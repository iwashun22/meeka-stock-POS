const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');
const { rateLimit } = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
})

passport.use(new LocalStrategy(async (username, password, done) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  const previousInput = { username, password }
  if (error || !data) {
    return done(null, false, { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', previousInput });
  }

  const isValid = await bcrypt.compare(password, data.hashed_password);
  if (!isValid) {
    return done(null, false, { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', previousInput });
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

  res.render('login', { error: null, previousInput: {} });
});

router.post('/', loginLimiter, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).render('login', { 
        error: { message: info.message },
        previousInput: info.previousInput || {}
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      const returnTo = req.cookies.returnTo || '/';
      res.clearCookie('returnTo');
      return res.redirect(returnTo);
    });
  })(req, res, next);
}); 

module.exports = router;