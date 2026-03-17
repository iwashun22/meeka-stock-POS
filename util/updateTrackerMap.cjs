const { randomBytes } = require('crypto');

const updateTrackerMap = new Map();

function generateOrGetToken(sku_id) {
  const existingToken = updateTrackerMap.get(sku_id);
  if (existingToken) return existingToken

  const token = randomBytes(32).toString('hex');
  updateTrackerMap.set(sku_id, token);
  return token;
}

function isUsableToken(sku_id, token) {
  const trackerToken = updateTrackerMap.get(sku_id);

  return trackerToken === token;
}

module.exports = {
  generateOrGetToken,
  isUsableToken,
}