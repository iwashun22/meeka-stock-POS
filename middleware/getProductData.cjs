const supabase = require('../lib/supabase.cjs');
const formatDate = require('../util/formatDate.cjs');
const checkPriceFormat = require('../util/checkPriceFormat.cjs');
const { setAlertMessages } = require('../util/alertMessage.cjs');

async function getProductData(req, res, next) {
  const { id } = req.params;

  const { data: productData, error } = await supabase
    .from('stocks')
    .select('*, parts(*)')
    .eq('sku_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).render('search', { user: req.user, data: null, notFound: true, lastSearch: id });
    }
    console.error('Error fetching product:', error);
    setAlertMessages(req, [
      ["เกิดข้อผิดพลาด", "error"]
    ]);
    return res.status(500).redirect('/');
  }

  req.productData = {
    ...productData,
    name: productData.parts.part_name || '',
    location: productData.location || '',
    updated_at: formatDate(productData.updated_at),
    selling_price: checkPriceFormat(productData.selling_price),
    cost_price: checkPriceFormat(productData.cost_price),
  };
  next();
}

module.exports = getProductData;