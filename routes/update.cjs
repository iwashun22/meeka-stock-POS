const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');
const getProductData = require('../middleware/getProductData.cjs');
const { sum, subtract } = require('../util/mathOperator.cjs');
const { permittedRoles } = require('../middleware/permittedRoles.cjs');
const checkRole = require('../util/checkRole.cjs');
const checkPriceFormat = require('../util/checkPriceFormat.cjs');
const supabase = require('../util/supabase.cjs');
const { sellLog, addLog, changeNameLog, changePriceLog, changeLocationLog } = require('../util/formatLog.cjs');

router.get('/:id', requireAuth, getProductData, (req, res) => {
  const { user, productData } = req;

  res.render('update', { user: user, data: productData });
});

router.post('/stock/:id',
  requireAuth,
  permittedRoles(false, true, true),
  getProductData,
  async (req, res) =>
{
  const { user, productData } = req;
  const { action, quantity } = req.body;
  const { id } = req.params;

  if (
    // if not manager or admin (if anonymous or employee)
    !checkRole(user.roles.name)(false, false) &&
    // and making "add" action
    action === "add"
  ) {
    return res.status(403).send('Forbidden');
  }
  if (action === "sell" && quantity > productData.stock) {
    return res.status(400).send('Bad request');
  }

  if (!(["sell", "add"].includes(action))) {
    return res.status(400).send('Bad request');
  }

  const fn = action === "sell" ? subtract : sum;
  const logfn = action === "sell" ? sellLog : addLog;
  const updatedStock = fn(productData.stock, quantity);

  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from("stocks")
    .update({ stock: updatedStock, updated_at: timestamp })
    .eq("sku_id", id);

  if (error) {
    return res.status(500).send("Error updating stock");
  }

  logfn(user, productData, ["stock", updatedStock], quantity);

  req.session.success = 'แก้ไขข้อมูลสำเร็จ';
  res.redirect(`/product/info/${id}`);
});

router.post('/change/:id',
  requireAuth,
  permittedRoles(false, false, false),
  getProductData,
  async (req, res) =>
{
  const { on, new_value } = req.body;
  const { id } = req.params;
  const { user, productData } = req;

  if (!new_value) return res.status(400).send('Bad request');
  
  const timestamp = new Date().toISOString();

  switch (on) {
    case 'product_name':
      const { error: renameErr } = await supabase
        .from("stocks")
        .update({ name: new_value, updated_at: timestamp })
        .eq("sku_id", id);

      if (renameErr) {
        return res.status(500).send('Error renaming the product');
      }

      changeNameLog(user, productData, ["name", new_value]);
      break;


    case 'product_location':
      const { error: relocateErr } = await supabase
        .from("stocks")
        .update({ location: new_value, updated_at: timestamp })
        .eq("sku_id", id);

      if (relocateErr) {
        return res.status(500).send('Error relocating the product');
      }

      changeLocationLog(user, productData, ["location", new_value]);
      break;


    case 'selling_price':
      const valid_value = checkPriceFormat(new_value);
      if (!valid_value) {
        return res.status(400).send('Price should be a number');
      }

      const { error: updatePriceErr } = await supabase
        .from("stocks")
        .update({ selling_price: valid_value, updated_at: timestamp })
        .eq("sku_id", id);

      if (updatePriceErr) {
        res.status(500).send('Error updating selling_price');
      }

      changePriceLog(user, productData, ["selling_price", valid_value]);
      break;
    default:
      return res.send(400).send('Bad request');
  }

  req.session.success = 'แก้ไขข้อมูลสำเร็จ';
  res.redirect(`/product/info/${id}`);
});

router.get('/new/product',
  requireAuth,
  permittedRoles(false, false, false),
  (req, res) => 
{

  res.send('Add new product page - Coming Soon');
});

module.exports = router;