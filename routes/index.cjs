const router = require('express').Router();
const { getAlertMessages } = require('../util/alertMessage.cjs');

router.get('/', (req, res) => {
  // console.log(req.user);
  const messages = getAlertMessages(req);

  res.render('search', { user: req.user, messages });
});

module.exports = router;