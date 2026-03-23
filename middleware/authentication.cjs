const supabase = require('../lib/supabase.cjs');
const bcrypt = require('bcrypt');

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    res.cookie('returnTo', req.originalUrl, { httpOnly: true, maxAge: 5 * 60 * 1000 }); // expires in 5 minutes
    return res.status(401).redirect('/login');
  }
  next();
}

const passwordIsCorrect = (...requestBody) => async (req, res) => {
  let password = '';
  for (const key of requestBody) {
    if (req.body[key]) {
      password = req.body[key];
      break;
    }
  }

  if (!req.user) return false;
  const id = req.user.id;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!password || !data || error) {
    return false;
  }

  const isCorrectPassword = await bcrypt.compare(password, data.hashed_password);
  return isCorrectPassword;
}

module.exports = {
  requireAuth,
  passwordIsCorrect
}