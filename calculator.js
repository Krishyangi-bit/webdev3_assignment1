// calculator.js
// CLI calculator driven by process.argv.
//   node calculator.js add 10 5      -> Result: 15
//   node calculator.js help          -> usage
// It also exports calculate() so server.js can reuse the same logic.

const logger = require('./modules/logger');
const isEven = require('./modules/isEven');

const OPERATIONS = {
  add: { name: 'Addition', symbol: '+', fn: (a, b) => a + b },
  sub: { name: 'Subtraction', symbol: '-', fn: (a, b) => a - b },
  mul: { name: 'Multiplication', symbol: '×', fn: (a, b) => a * b },
  div: {
    name: 'Division',
    symbol: '÷',
    fn: (a, b) => {
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    },
  },
  mod: {
    name: 'Modulus',
    symbol: '%',
    fn: (a, b) => {
      if (b === 0) throw new Error('Cannot take modulus by zero');
      return a % b;
    },
  },
  pow: { name: 'Power', symbol: '^', fn: (a, b) => a ** b },
};

// Friendly alternative names, e.g. "node calculator.js multiply 3 4"
const ALIASES = {
  plus: 'add',
  subtract: 'sub',
  minus: 'sub',
  multiply: 'mul',
  times: 'mul',
  divide: 'div',
  modulus: 'mod',
  power: 'pow',
};

function resolveOperation(op) {
  const key = String(op || '').toLowerCase();
  return ALIASES[key] || key;
}

function toNumber(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Missing ${label}`);
  }
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`"${value}" is not a valid number`);
  return n;
}

function calculate(op, a, b) {
  const key = resolveOperation(op);
  const operation = OPERATIONS[key];
  if (!operation) {
    throw new Error(`Unknown operation "${op}". Use one of: ${Object.keys(OPERATIONS).join(', ')}`);
  }
  const x = toNumber(a, 'first number');
  const y = toNumber(b, 'second number');
  const raw = operation.fn(x, y);
  if (!Number.isFinite(raw)) throw new Error('Result is too large to represent');
  // Trim floating point noise: 0.1 + 0.2 -> 0.3
  return Number.isInteger(raw) ? raw : Number(raw.toPrecision(12));
}

function printUsage() {
  console.log('\nUsage: node calculator.js <operation> <a> <b>\n');
  for (const [key, op] of Object.entries(OPERATIONS)) {
    console.log(`  ${key.padEnd(5)} ${op.name.padEnd(15)} node calculator.js ${key} 10 5`);
  }
  console.log(`\nAliases: ${Object.keys(ALIASES).join(', ')}\n`);
}

function runCli(args) {
  logger.info(`CLI input (process.argv.slice(2)): ${JSON.stringify(args)}`);

  if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
    printUsage();
    return;
  }
  if (args.length !== 3) {
    logger.error(`Expected 3 arguments (operation, a, b) but got ${args.length}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  const [op, a, b] = args;
  try {
    const result = calculate(op, a, b);
    const { name, symbol } = OPERATIONS[resolveOperation(op)];
    logger.info(`${name}: ${a} ${symbol} ${b}`);
    console.log(`Result: ${result}`);
    if (Number.isInteger(result)) {
      logger.info(`${result} is ${isEven(result) ? 'even' : 'odd'} (checked with modules/isEven)`);
    }
  } catch (err) {
    logger.error(err.message);
    process.exitCode = 1;
  }
}

// Only run the CLI when executed directly, not when required by server.js
if (require.main === module) {
  runCli(process.argv.slice(2));
}

module.exports = { calculate, OPERATIONS, resolveOperation };
