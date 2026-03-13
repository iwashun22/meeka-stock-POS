const router = require('express').Router();
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('register', { title: 'Register' });
});

router.post('/', async (req, res) => {
  const { username, password, confirmation } = req.body;

  if(username.length < 4 || password.length < 6) {
    return res.status(400).send('Username must be at least 4 characters and password must be at least 6 characters long');
  }
  if (password !== confirmation) {
    return res.status(400).send('Password and confirmation do not match');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await supabase.from('users').insert({
    username,
    hashed_password: hashedPassword
  });

  res.redirect('/login');
});

module.exports = router;