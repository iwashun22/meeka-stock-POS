const router = require('express').Router();
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');
const { validUsernameInput, validPasswordInput } = require('../util/regexCheck.cjs');

router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('register', {
    previousInput: { username: '', password: '', confirmation: '' }
  });
});

router.post('/', async (req, res) => {
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
    err.message = 'ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษ !@#$%^&*()_+-="\'/ เท่านั้น';
  }
  else if (password.length < 6) {
    err.on = 'password';
    err.message = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  else if (password !== confirmation) {
    err.on = 'confirmation';
    err.message = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
  }

  if (Object.keys(err).length) {
    return res.status(400).render('register', { 
      error: err,
      previousInput: { username, password, confirmation }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await supabase.from('users').insert({
    username,
    hashed_password: hashedPassword
  });

  res.redirect('/login');
});

module.exports = router;