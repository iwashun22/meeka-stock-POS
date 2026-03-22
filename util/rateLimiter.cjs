const { rateLimit } = require('express-rate-limit');
const { passwordIsCorrect } = require('../middleware/authentication.cjs');
const { rateLimitedUserLog } = require('../util/formatLog.cjs');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  keyGenerator: (req) => req.ip,
  message: 'คุณใส่รหัสผ่านปัจจุบันไม่ถูกต้องหลายครั้ง กรุณาลองใหม่อีกครั้งในภายหลัง',
  skipSuccessfulRequests: true,
  requestWasSuccessful: async (req, res) => {
    if (req.method !== 'POST') return true;

    const limitTriggerUrl = ["/login", "/update/user/password"];

    if (limitTriggerUrl.includes(req.originalUrl)) {
      return await passwordIsCorrect("password", "old_password")(req, res);
    }
    return true;
  },
  handler: (req, res, next, options) => {
    rateLimitedUserLog(req, "password_attempts_limit_exceeded");

    return res
      .status(options.statusCode)
      .render('lock', { message: options.message });
  }
});

module.exports = rateLimiter;