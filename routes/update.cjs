const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');

router.get('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  res.render('update', { user: req.user, id: id });
});

module.exports = router;