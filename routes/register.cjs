const router = require('express').Router();
const supabase = require('../lib/supabase.cjs');
const bcrypt = require('bcrypt');
const validateRegistration = require('../middleware/validateRegistration.cjs');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const passport = require('passport');
const { registrationRestrictedLog } = require('../util/formatLog.cjs');

const redisClient = require('../lib/redisClient.cjs');
const { RedisStore } = require('rate-limit-redis');

const HOURS = 8;
const registerLimiter = rateLimit({
  windowMs: HOURS * 60 * 60 * 1000, // 8 hours
  max: 3,
  message: 'มีความพยายามลงทะเบียนมากเกินไป กรุณาลองใหม่ในภายหลัง',
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'register:'
  }),
  handler: async (req, res, next, options) => {
    const ip = ipKeyGenerator(req.ip);
    const key = `limit-register-${ip}`;

    const isLocked = await redisClient.get(key);
    if (!isLocked) {
      registrationRestrictedLog(req);
      await redisClient.set(key, 1);
      await redisClient.expire(key, HOURS * 60 * 60);
    }

    return res
      .status(options.statusCode)
      .render('lock', { message: options.message });
  }
});

router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('register', { previousInput: {} });
});

router.post('/', validateRegistration, registerLimiter, async (req, res, next) => {
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