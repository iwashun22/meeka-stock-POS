const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');
const getProductData = require('../middleware/getProductData.cjs');
const { sum, subtract } = require('../util/mathOperator.cjs');
const { permittedRoles } = require('../middleware/permittedRoles.cjs');
const checkRole = require('../util/checkRole.cjs');
const supabase = require('../util/supabase.cjs');
const logger = require('../util/logger.cjs');

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
  const log_info = action === "sell" ? "SELL" : "ADD";
  const updatedStock = fn(productData.stock, quantity);

  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from("stocks")
    .update({ stock: updatedStock, updated_at: timestamp })
    .eq("sku_id", id);

  if (error) {
    return res.status(500).send("Error updating stock");
  }

  const {
    hashed_password: _a,
    role_id: _b,
    ...userInfo
  } = user;
  logger.info(`${log_info} [${quantity}] product: ${id}`, {
    previous: productData,
    updateByUser: {
      ...userInfo,
      roles: userInfo.roles.name
    },
    stockChange: {
      before: productData.stock,
      now: updatedStock
    }
  });
  logger.flush();

  req.session.success = 'แก้ไขข้อมูลสำเร็จ';
  res.redirect(`/product/info/${id}`);
});

router.post('/change/:id',
  requireAuth,
  permittedRoles(false, false, false),
  getProductData,
  (req, res) =>
{
  const { on, new_value } = req.body;

  switch (on) {
    case 'product_name':
      // TODO: 
      break;
    case 'selling_price':
      // TODO: check price format
      break;
    default:
      res.send(400).send('Bad request');
      break;
  }

  res.send('Coming Soon');
});

router.get('/new/product', requireAuth, (req, res) => {
  if (req.user.roles.name !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  res.send('Add new product page - Coming Soon');
});

module.exports = router;