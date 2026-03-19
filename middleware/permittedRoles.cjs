const checkRole = require('../util/checkRole.cjs');

const permittedRoles = (
  anonymous = true,
  employee = true,
  manager = true
) => (req, res, next) => {
  if (checkRole(req.user.role)(anonymous, employee, manager)){
    next();
  }
  else {
    return res.status(403).send('Forbidden');
  }
}

module.exports = {
  permittedRoles,
}