const router = require('express').Router();
const supabase = require('../util/supabase.cjs');

router.post('/', (req, res) => {
  const product_sku_id = req.body.sku_id;
  res.redirect(`/product/${product_sku_id}`);
})

router.get('/:sku_id', async (req, res) => {
  const sku_id = req.params.sku_id;
  const { data, error } = await supabase.from('stocks').select('*').eq('sku_id', sku_id).single();
  console.log(data);

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).render('search', { data: null, notFound: true });
    }
    console.error('Error fetching product:', error);
    return res.status(500).send('Internal Server Error');
  }

  res.render('search', { data: data });
})

module.exports = router;