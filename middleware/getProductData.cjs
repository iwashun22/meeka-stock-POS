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
      req.productData = null;
      return next();
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

async function allMatched(req, res, next) {
  const q = req.query.q;

  const parts = await supabase
    .from("parts")
    .select("*")
    .ilike("part_name", `%${q}%`)
    .order("part_name", { ascending: true })
    .limit(5);

  if (!parts.data || !parts.data.length) return next();

  const allMatchingData = (await Promise.all(
    parts.data.map(async (part) => {
      const arr = [part.part_name];
      const { data, error } = await supabase
        .from("stocks")
        .select("*")
        .eq("part_id", part.part_id)
        .order("model", { ascending: true });

      if (!data || !data.length) {
        return null;
      }

      arr.push(data.map(d => {
        return {
          ...d,
          is_genuine: (/.+-G-.+/gi).test(d.sku_id)
        }
      }));
      return arr;
    })
  )).filter(Boolean);

  req.allMatchingData = allMatchingData;
  next();
}

module.exports = getProductData;
module.exports.allMatched = allMatched;