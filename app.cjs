const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const dotenv = require('dotenv');
dotenv.config();

const rateLimiter = require('./util/rateLimiter.cjs');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', { maxAge: 0 /* only in development */ }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(session({
  secret: process.env.SESSION_SECRET || 'hiding cat',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(rateLimiter);

// TODO: In production, set trust proxy in order to make rate-limiter work

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
