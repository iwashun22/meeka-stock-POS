const router = require('express').Router();

router.get('/', (req, res) => {
  // console.log(req.user);
  res.render('search', { user: req.user });
});

module.exports = router;