const supabase = require('../util/supabase.cjs');

async function getProductData(req, res, next) {
  const { id } = req.params;

  const { data: productData, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('sku_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).render('search', { user: req.user, data: null, notFound: true });
    }
    console.error('Error fetching product:', error);
    return res.status(500).send('Internal Server Error');
  }

  const date = new Date(productData.updated_at);

  const formatted = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);

  req.productData = { ...productData, updated_at: formatted };
  next();
}

module.exports = getProductData;