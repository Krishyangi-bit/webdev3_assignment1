// app.js
// 1) Reuses the custom modules (isEven + logger) from ./modules
// 2) Shows the order in which Node.js runs sync code, microtasks,
//    timers and I/O callbacks.
//
//   node app.js            -> checks a default list of numbers
//   node app.js 4 7 12     -> checks your own numbers

const fs = require('fs');
const isEven = require('./modules/isEven');
const { isOdd } = require('./modules/isEven');
const logger = require('./modules/logger');

// ---- Part 1: module reusability --------------------------------------
logger.info('Part 1: reusing modules/isEven.js');

const input = process.argv.slice(2);
const numbers = input.length ? input : ['0', '3', '8', '15', '42', '-6'];

for (const value of numbers) {
  try {
    const label = isEven(value) ? logger.colors.green('even') : logger.colors.yellow('odd');
    console.log(`  ${String(value).padStart(5)} is ${label}`);
  } catch (err) {
    logger.error(err.message);
  }
}

const odds = numbers.filter((v) => Number.isInteger(Number(v)) && isOdd(v));
logger.success(`Odd numbers found with isOdd(): [${odds.join(', ')}]`);

// ---- Part 2: execution flow (sync vs async) ----------------------------
console.log('');
logger.info('Part 2: execution order. Watch the numbers.');

console.log('  1. synchronous code runs first, top to bottom');

setTimeout(() => console.log('  5. setTimeout(0) callback (timers phase)'), 0);

// Reading a file takes longer than a 0 ms timer, so this usually comes after step 5.
fs.readFile(__filename, 'utf8', () => {
  console.log('  6. fs.readFile callback (I/O finished, poll phase)');
  // Inside an I/O callback the order below is guaranteed: check phase comes before timers.
  setTimeout(() => console.log('  8. setTimeout scheduled inside I/O (next timers phase)'), 0);
  setImmediate(() => console.log('  7. setImmediate scheduled inside I/O (check phase)'));
});

Promise.resolve().then(() => console.log('  4. Promise.then (microtask queue)'));
process.nextTick(() => console.log('  3. process.nextTick (runs before promises)'));

console.log('  2. last synchronous line. The call stack is now empty.');
