const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/', (req, res) => {
  // TODO: handle login logic
  res.redirect('/');
});

module.exports = router;