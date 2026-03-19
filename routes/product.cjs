const router = require('express').Router();
const getProductData = require('../middleware/getProductData.cjs');
const { getAlertMessages } = require('../util/alertMessage.cjs');

router.get('/search', (req, res) => {
  const product_sku_id = req.query.sku_id;

  if (!product_sku_id) {
    return res.redirect('/');
  }

  res.redirect(`/product/info/${product_sku_id}`);
});

router.get('/info/:id', getProductData, (req, res) => {
  const { productData } = req;
  const lastSearch = productData.sku_id;

  const messages = getAlertMessages(req);

  res.render('search', { user: req.user, data: productData, lastSearch, messages });
});

module.exports = router;