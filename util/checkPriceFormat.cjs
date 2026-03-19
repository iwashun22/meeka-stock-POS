function checkPriceFormat(text) {
  const num = Number(text);

  if(isNaN(num)) return false;

  return num.toFixed(2).toString();
}

module.exports = checkPriceFormat;