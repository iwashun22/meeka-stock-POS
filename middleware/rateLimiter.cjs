const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { passwordIsCorrect } = require('./authentication.cjs');
const { rateLimitedUserLog } = require('../util/formatLog.cjs');

const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../lib/redisClient.cjs');

const MINUTES = 15;

async function setJsonWithTTL(key, data) {
  await redisClient.multi()
    .json.set(key, "$", data)
    .expire(key, MINUTES * 60)
    .exec();
}

const rateLimiter = rateLimit({
  windowMs: MINUTES * 60 * 1000, // 15 minutes
  limit: 5,
  message: 'คุณใส่รหัสผ่านปัจจุบันไม่ถูกต้องหลายครั้ง กรุณาลองใหม่อีกครั้งในภายหลัง',
  skipSuccessfulRequests: true,
  requestWasSuccessful: async (req, res) => {
    if (req.method !== 'POST') return true;

    const limitTriggerUrl = ["/login", "/update/user/password"];

    if (limitTriggerUrl.includes(req.originalUrl)) {
      const key = ipKeyGenerator(req.ip);

      let logMessage = '';
      if (req.originalUrl === limitTriggerUrl[0]) {
        logMessage = 'login_bruteforce_detected';
      } else if (req.originalUrl === limitTriggerUrl[1]) {
        logMessage = 'password_reset_abuse_detected';
      }

      await setJsonWithTTL(key, {
        ipBlocked: false,
        logMessage
      });
      return await passwordIsCorrect("password", "old_password")(req, res);
    }
    return true;
  },
  handler: async (req, res, next, options) => {
    const key = ipKeyGenerator(req.ip);
    try {
      const { ipBlocked, logMessage } = await redisClient.json.get(key);

      if (!ipBlocked) {
        rateLimitedUserLog(req, logMessage);
        await setJsonWithTTL(key, {
          ipBlocked: true,
          logMessage
        });
      }
    } catch(err) {}

    return res
      .status(options.statusCode)
      .render('lock', { message: options.message });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  })
});

module.exports = rateLimiter;