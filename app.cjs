const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const redisClient = require('./util/redisClient.cjs');
const { RedisStore } = require('connect-redis');

if (process.env.NODE_ENV === "dev") {
  require('dotenv').config();
}

const rateLimiter = require('./util/rateLimiter.cjs');

const redisStore = new RedisStore({
  client: redisClient
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', { maxAge: 0 /* only in development */ }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'hiding cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(rateLimiter);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy in the chain (Fly.io router)
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

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
