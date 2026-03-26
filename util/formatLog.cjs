const logger = require('../lib/logger.cjs');

const formatLog = (event, messageFormatCallback) => (req, [updateKey, updateValue], quantity = null) => {
  const { user, productData } = req;
  const { sku_id, updated_at, ...data } = productData;

  if (!updateKey in productData) throw new Error(`The column name ${updateKey} does not exist.`);
  const oldValue = productData[updateKey];

  const productName = `${productData.name} ${productData.model}`;
  const formatted = messageFormatCallback(
    productName, oldValue, updateValue, quantity
  );

  logger.info(formatted, {
    event,
    user,
    product_id: sku_id,
    quantity,
    data: {
      ...data,
      [updateKey]: {
        old: oldValue,
        new: updateValue
      }
    },
    ip: req.ip
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


const userAuthLog = (event, level = "info", messageCallback) => (req, reason) => {
  const formatted = messageCallback(req, reason);

  const fn = level === "info" ? logger.info.bind(logger) :
             level === "warn" ? logger.warn.bind(logger) :
             logger.error.bind(logger);

  fn(formatted, {
    event,
    reason,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  logger.flush();
}

const loginAttemptFailedLog = userAuthLog("LOGIN_ATTEMPT_FAILED", "warn",
  (req, reason) => `Login attempt failed for <${req.body.username}> from ${req.ip} (reason: ${reason})`
);

const loginSuccessLog = userAuthLog("LOGIN_SUCCESS", "info",
  (req, reason) => `Login success for ${req.body.username} from ${req.ip}`
);

const passwordResetAttemptFailedLog = userAuthLog("PASSWORD_RESET_FAILED", "warn",
  (req, _r) => `Password reset failed by ${req.user.username} from ${req.ip}`
);

const rateLimitedUserLog = userAuthLog("USER_RATE_LIMITED", "error",
  (req, reason) => `Rate limit applied to IP ${req.ip} (reason: ${reason})`
);

const registrationRestrictedLog = userAuthLog("REGISTRATION_RESTRICTED", "error",
  (req) => `Registration restricted for IP ${req.ip} (reason: too_many_registrations)`
);

const registeredUserLog = userAuthLog("NEW_REGISTRATION", "info",
  (req, _r) => `Registration successful for ${req.body.username} from IP ${req.ip}`
);

module.exports = {
  sellLog,
  addLog,
  changeNameLog,
  changeLocationLog,
  changePriceLog,
  loginAttemptFailedLog,
  loginSuccessLog,
  passwordResetAttemptFailedLog,
  rateLimitedUserLog,
  registrationRestrictedLog,
  registeredUserLog,
};