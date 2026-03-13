function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    res.cookie('returnTo', req.originalUrl, { httpOnly: true, maxAge: 5 * 60 * 1000 }); // expires in 5 minutes
    return res.status(401).redirect('/login');
  }
  next();
}

module.exports = {
  requireAuth,
}