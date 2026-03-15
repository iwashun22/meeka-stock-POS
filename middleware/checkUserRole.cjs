const supabase = require('../util/supabase.cjs');

async function checkUserRole(req, res, next) {
  const userId = req.user.id;

  const { data: userData, error } = await supabase
    .from('users')
    .select('*, roles!users_role_id_fkey(*)')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user data:', error);
    return res.status(500).send('Internal Server Error' );
  }

  if (!userData.roles.name) {
    return res.status(403).render('update', { notPermitted: true, data: req.productData, user: req.user });
  }

  req.user.role = userData.roles.name;
  next();
}

module.exports = checkUserRole;