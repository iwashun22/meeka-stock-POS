const logger = require('./logger.cjs');
const logUserInfo = require('./logUserInfo.cjs');

const formatLog = (event, messageFormatCallback) => (user, productData, [updateKey, updateValue], quantity = null) => {
  const { sku_id, updated_at, ...data } = productData;

  if (!updateKey in productData) throw new Error(`The column name ${updateKey} does not exist.`);
  const oldValue = productData[updateKey];

  const formatted = messageFormatCallback(
    data.name, oldValue, updateValue, quantity
  );

  logger.info(formatted, {
    event,
    user: logUserInfo(user),
    product_id: sku_id,
    quantity,
    data: {
      ...data,
      [updateKey]: {
        old: oldValue,
        new: updateValue
      }
    }
  });

  logger.flush();
}

const sellLog = formatLog("SELL",
  (name, old_val, new_val, q) => `Sold [${q}] items :: ${name}`
);

const addLog = formatLog("RESTOCK",
  (name, old_val, new_val, q) => `Restocked [${q}] items :: "${name}"`
);

const changeNameLog = formatLog("CHANGE_PRODUCT_NAME",
  (name, old_val, new_val, q) => `Change product name "${old_val}" to "${new_val}"`
);

const changeLocationLog = formatLog("CHANGE_PRODUCT_LOCATION",
  (name, old_val, new_val, q) => `Change location of "${name}" from [${old_val}] to [${new_val}]`
)

const changePriceLog = formatLog("CHANGE_PRODUCT_PRICE",
  (name, old_val, new_val, q) => `Change price of "${name}" from ${old_val} to ${new_val}`
);

module.exports = {
  sellLog,
  addLog,
  changeNameLog,
  changeLocationLog,
  changePriceLog
};