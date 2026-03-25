const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const redisClient = require('./lib/redisClient.cjs');
const { RedisStore } = require('connect-redis');

const isDev = process.env.NODE_ENV === "dev";
if (isDev) {
  require('dotenv').config();
}

const rateLimiter = require('./middleware/rateLimiter.cjs');

const redisStore = new RedisStore({
  client: redisClient
});

const app = express();

// make hashed filename accissible to locals
const { readFileSync } = require('fs');
const path = require('path');
const assets = JSON.parse(readFileSync(
  path.resolve(__dirname, 'public/dist/manifest.json')
));

app.locals.getAsset = (filename) => path.resolve('/dist', assets[filename]);


// configure middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', {
  maxAge: isDev ? 0 : '30d',
  immutable: !isDev
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'hiding cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: !isDev, // true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(rateLimiter);

if (!isDev) {
  app.set("trust proxy", true); // trust proxy chain (Fly.io router)
}

app.set('view engine', 'pug');

app.use('/', require('./routes/index.cjs'));
app.use('/login', require('./routes/login.cjs'));
app.use('/product', require('./routes/product.cjs'));
app.use('/update', require('./routes/update.cjs'));
app.use('/register', require('./routes/register.cjs'));

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

app.use((req, res) => {
  res.status(404).render('notfound');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
