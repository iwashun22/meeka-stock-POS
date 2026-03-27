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

router.get('/parts', getProductData.allMatched, (req, res) => {
  const q = req.query.q;

  if (!req.allMatchingData || !req.allMatchingData.length) {
    return res.status(404).render('search', { user: req.user, data: null, notFound: true, lastSearch: q });
  }

  return res.render('search', { user: req.user, allMatchingData: req.allMatchingData, lastSearch: q });
});

router.get('/info/:id', getProductData, (req, res) => {
  const { productData } = req;
  const { id } = req.params;

  if (!productData) {
    return res.redirect(`/product/parts?q=${id}`)
  }

  const messages = getAlertMessages(req);

  res.render('search', { user: req.user, data: productData, lastSearch: id, messages });
});

module.exports = router;