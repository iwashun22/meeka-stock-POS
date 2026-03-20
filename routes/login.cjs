const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');
const { passwordIsCorrect } = require('../middleware/authentication.cjs');
const { rateLimit } = require('express-rate-limit');
const { loginAttemptFailedLog, loginSuccessLog } = require('../util/formatLog.cjs');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  message: 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
  skipSuccessfulRequests: true,
  requestWasSuccessful: passwordIsCorrect(["password"])
})

passport.use(new LocalStrategy(async (username, password, done) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, roles(*)')
    .eq('username', username)
    .single();

  const previousInput = { username, password }
  if (error || !data) {
    return done(null, false, {
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      reason: 'user_not_found',
      previousInput
    });
  }

  const isValid = await bcrypt.compare(password, data.hashed_password);
  if (!isValid) {
    return done(null, false, {
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      reason: 'invalid_credentials',
      previousInput
    });
  }

  done(null, data);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, roles(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return done(null, false);
  }

  const { roles, ...user} = data;
  user.role = roles.name;

  done(null, user);
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
      loginAttemptFailedLog(req, info.reason);
      return res.status(401).render('login', {
        error: { message: info.message },
        previousInput: info.previousInput || {}
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      const returnTo = req.cookies.returnTo || '/';
      res.clearCookie('returnTo');

      // reset limiter if authenticated
      loginLimiter.resetKey(req.ip);
      loginSuccessLog(req, null);
      return res.redirect(returnTo);
    });
  })(req, res, next);
}); 

module.exports = router;