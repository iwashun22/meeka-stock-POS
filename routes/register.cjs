const router = require('express').Router();
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');
const validateRegistration = require('../middleware/validateRegistration.cjs');
// const { rateLimit } = require('express-rate-limit');
// const rateLimiter = require('../util/rateLimiter.cjs');
const passport = require('passport');

// const registerLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 3,
//   message: 'Too many registration attempts. Please try again later.',
// });

router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('register', { previousInput: {} });
});

router.post('/', validateRegistration, async (req, res, next) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await supabase.from('users').insert({
    username,
    hashed_password: hashedPassword
  });

  next();
},
passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

module.exports = router;