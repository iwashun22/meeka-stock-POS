const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');
const checkUserRole = require('../middleware/checkUserRole.cjs');
const getProductData = require('../middleware/getProductData.cjs');

router.get('/:id', requireAuth, getProductData, checkUserRole, (req, res) => {
  const { user, productData } = req;

  res.render('update', { user: user, data: productData });
});

module.exports = router;