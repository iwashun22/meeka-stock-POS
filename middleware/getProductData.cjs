const supabase = require('../util/supabase.cjs');
const formatDate = require('../util/formatDate.cjs');

async function getProductData(req, res, next) {
  const { id } = req.params;

  const { data: productData, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('sku_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).render('search', { user: req.user, data: null, notFound: true, lastSearch: id });
    }
    console.error('Error fetching product:', error);
    return res.status(500).send('Internal Server Error');
  }

  req.productData = { ...productData, updated_at: formatDate(productData.updated_at) };
  next();
}

module.exports = getProductData;