// modules/isEven.js
// Custom module: exported with module.exports and reused by
// app.js, calculator.js, dice.js and server.js.

function isEven(value) {
  const n = Number(value);
  if (String(value).trim() === '' || !Number.isInteger(n)) {
    throw new TypeError(`isEven expects a whole number, got "${value}"`);
  }
  return n % 2 === 0;
}

function isOdd(value) {
  return !isEven(value);
}

module.exports = isEven;
module.exports.isOdd = isOdd;
