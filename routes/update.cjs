const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');
const { validPasswordInput } = require('../util/regexCheck.cjs');
const getProductData = require('../middleware/getProductData.cjs');
const { sum, subtract } = require('../util/mathOperator.cjs');
const { permittedRoles } = require('../middleware/permittedRoles.cjs');
const checkRole = require('../util/checkRole.cjs');
const checkPriceFormat = require('../util/checkPriceFormat.cjs');
const supabase = require('../util/supabase.cjs');
const bcrypt = require('bcrypt');
const { setAlertMessages } = require('../util/alertMessage.cjs');
const { sellLog, addLog, changeNameLog, changePriceLog, changeLocationLog } = require('../util/formatLog.cjs');

router.get('/:id', requireAuth, getProductData, (req, res) => {
  const { user, productData } = req;

  res.render('update', { user: user, data: productData });
});

router.get('/user/password', requireAuth, (req, res) => {
  res.render('change-password', { user: req.user, previousInput: {} });
});

router.post('/user/password', requireAuth, async (req, res) => {
  const { old_password, new_password, confirmation } = req.body;
  const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("id", req.user.id)
  .single();

  if (!data || error) {
    return res.status(500).send("Error getting user from database");
  }

  const correctPassword = await bcrypt.compare(old_password, data.hashed_password);

  const err = {}
  if (!correctPassword) {
    err.on = 'old_password';
    err.message = 'รหัสผ่านปัจจุบันไม่ถูกต้อง';
  }
  else if(!validPasswordInput(new_password)) {
    err.on = 'new_password';
    err.message = 'รหัสผ่านต้องประกอบด้วย ตัวอักษรภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษ !@#$%^&*()_+-="\'/ เท่านั้น';
  }
  else if (new_password.length < 6) {
    err.on = 'new_password';
    err.message = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  else if (new_password !== confirmation) {
    err.on = 'confirmation';
    err.message = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
  }

  if (Object.keys(err).length) {
    return res.render('change-password', {
      user: req.user,
      previousInput: {
        old_password,
        new_password,
        confirmation
      },
      error: err
    });
  }

  const hash = await bcrypt.hash(new_password, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({ hashed_password: hash })
    .eq("id", req.user.id);

  if (updateError) {
    setAlertMessages(req, [
      ['เกิดข้อผิดพลาด', 'error']
    ]);
    return res.redirect('/');
  }

  setAlertMessages(req, [
    ['เปลี่ยนรหัสผ่านสำเร็จ']
  ]);
  res.redirect('/');
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
    !checkRole(user.role)(false, false) &&
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

  setAlertMessages(req, [
    ['แก้ไขข้อมูลสำเร็จ']
  ]);

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

  setAlertMessages(req, [
    ['แก้ไขข้อมูลสำเร็จ']
  ]);

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