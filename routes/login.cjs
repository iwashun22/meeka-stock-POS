const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(async (username, password, done) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    return done(null, false, { message: 'Invalid username or password' });
  }

  const isValid = await bcrypt.compare(password, data.hashed_password);
  if (!isValid) {
    return done(null, false, { message: 'Invalid username or password' });
  }

  done(null, data);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return done(null, false);
  }

  done(null, data);
});

router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }

  const hasReachedMaxLoginAttempts = req.session.loginAttempts >= 5;
  if (hasReachedMaxLoginAttempts) {
    return res.status(429).send('Too many login attempts. Please try again later.');
  }
  res.render('login');
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/login',
}), (req, res) => {
  const returnTo = req.cookies.returnTo || '/';
  res.clearCookie('returnTo');
  res.redirect(returnTo);
});

module.exports = router;