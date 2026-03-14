const { validUsernameInput, validPasswordInput } = require('../util/regexCheck.cjs');
const supabase = require('../util/supabase.cjs');

async function validateRegistration(req, res, next) {
  const { username, password, confirmation } = req.body;

  const err = {};
  if(!validUsernameInput(username)) {
    err.on = 'username';
    err.message = 'ชื่อผู้ใช้ต้องประกอบด้วย ตัวอักษรภาษาอังกฤษ และตัวเลขเท่านั้น';
  }
  else if(username.length < 4) {
    err.on = 'username';
    err.message = 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร';
  }
  else if(!validPasswordInput(password)) {
    err.on = 'password';
    err.message = 'รหัสผ่านต้องประกอบด้วย ตัวอักษรภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษ !@#$%^&*()_+-="\'/ เท่านั้น';
  }
  else if (password.length < 6) {
    err.on = 'password';
    err.message = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  else if (password !== confirmation) {
    err.on = 'confirmation';
    err.message = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
  }

  const existingUser = await supabase.from('users').select('*').eq('username', username).single();

  if (existingUser.data) {
    err.on = 'username';
    err.message = 'ชื่อผู้ใช้นี้มีอยู่แล้ว';
  }

  if (Object.keys(err).length) {
    return res.status(400).render('register', { 
      error: err,
      previousInput: { username, password, confirmation }
    });
  }

  next();
}

module.exports = validateRegistration;