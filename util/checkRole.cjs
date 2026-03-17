const checkRole = (roleName) => (
  anonymous = true,
  employee = true,
  manager = true
) => {
  const roles = [null, "employee", "manager", "admin"];
  const mask = [anonymous, employee, manager, true];
  const filtered = roles.filter((_, i) => mask[i]);

  return filtered.includes(roleName);
}

module.exports = checkRole;