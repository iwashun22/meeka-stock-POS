const router = require('express').Router();
const getProductData = require('../middleware/getProductData.cjs');

router.post('/', (req, res) => {
  const product_sku_id = req.body.sku_id;
  res.redirect(`/product/${product_sku_id}`);
})

router.get('/:id', getProductData, (req, res) => {
  const { productData } = req;

  if (!productData) {
    return res.status(404).render('search', { data: null, notFound: true });
  }

  res.render('search', { user: req.user, data: productData });
})

module.exports = router;