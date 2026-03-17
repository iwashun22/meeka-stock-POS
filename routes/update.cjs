const router = require('express').Router();
const { requireAuth } = require('../middleware/authentication.cjs');
const getProductData = require('../middleware/getProductData.cjs');
const { sum, subtract } = require('../util/mathOperator.cjs');
const { permittedRoles } = require('../middleware/permittedRoles.cjs');
const checkRole = require('../util/checkRole.cjs');
const supabase = require('../util/supabase.cjs');

router.get('/:id', requireAuth, getProductData, (req, res) => {
  const { user, productData } = req;

  res.render('update', { user: user, data: productData });
});

router.post('/stock/:id',
  requireAuth,
  getProductData,
  permittedRoles(false, true, true),
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
  const updatedStock = fn(productData.stock, quantity);

  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from("stocks")
    .update({ stock: updatedStock, updated_at: timestamp })
    .eq("sku_id", id);

  if (error) {
    return res.status(500).send("Error updating stock");
  }

  return res.redirect(`/update/${id}`);
})

router.get('/new/product', requireAuth, (req, res) => {
  if (req.user.roles.name !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  res.send('Add new product page - Coming Soon');
});

module.exports = router;