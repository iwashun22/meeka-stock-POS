const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');
const getProductData = require('../middleware/getProductData.cjs');

router.get('/:id', requireAuth, getProductData, (req, res) => {
  const { user, productData } = req;

  res.render('update', { user: user, data: productData });
});

router.post('/:id', requireAuth, getProductData, (req, res) => {
  const { user, productData } = req;
  res.send("still in development");
})

router.get('/new/product', requireAuth, (req, res) => {
  if (req.user.roles.name !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  res.send('Add new product page - Coming Soon');
});

module.exports = router;