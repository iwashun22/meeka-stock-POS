const { rateLimit } = require('express-rate-limit');
const { passwordIsCorrect } = require('../middleware/authentication.cjs');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  message: 'คุณใส่รหัสผ่านปัจจุบันไม่ถูกต้องหลายครั้ง กรุณาลองใหม่อีกครั้งในภายหลัง',
  handler: (req, res, next, options) => {
    rateLimitedUserLog(req, req.session.warnMessage);
		res.status(options.statusCode).send(options.message);
  },
  skipSuccessfulRequests: true,
  requestWasSuccessful: async (req, res) => {
    if (req.method !== 'POST') return true;

    const abuseMap = {
      "/login": "login_bruteforce_detected",
      "/update/user/password": "password_reset_abuse_detected"
    }

    req.session.warnMessage = abuseMap[req.path];

    if (req.path in abuseMap) {
      return await passwordIsCorrect("password", "old_password")(req, res);
    }
    return true;
  }
});

module.exports = rateLimiter;