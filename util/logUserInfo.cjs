function logUserInfo(userData) {
  const {
    hashed_password: _a,
    role_id: _b,
    roles: _c,
    ...userInfo
  } = userData;

  return {
    ...userInfo,
    role: _c.name
  }
}

module.exports = logUserInfo;