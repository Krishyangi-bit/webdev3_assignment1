// dice.js
// Dice simulator using crypto.randomInt() (cryptographically secure).
//
//   node dice.js            -> roll one die
//   node dice.js 5          -> roll five dice in a loop
//   node dice.js --history  -> show the last 10 saved rolls

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('./modules/logger');
const isEven = require('./modules/isEven');

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const HISTORY_FILE = path.join(__dirname, 'dice-history.txt');
const MAX_DICE = 100;

function rollDie() {
  // randomInt's upper bound is exclusive, so this returns 1..6
  return crypto.randomInt(1, 7);
}

function rollDice(count = 1) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie());
  }
  return rolls;
}

// Bonus: keep a history of every roll in a text file.
function saveHistory(rolls, done = () => {}) {
  const total = rolls.reduce((sum, r) => sum + r, 0);
  const line = `[${logger.timestamp()}] rolls: ${rolls.join(', ')} | total: ${total}\n`;
  fs.appendFile(HISTORY_FILE, line, 'utf8', done);
}

function showHistory() {
  fs.readFile(HISTORY_FILE, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return logger.warn('No rolls recorded yet. Run: node dice.js 3');
      return logger.error(`Could not read history: ${err.message}`);
    }
    const lines = data.trim().split('\n');
    logger.info(`Last ${Math.min(10, lines.length)} of ${lines.length} saved rolls:`);
    lines.slice(-10).forEach((l) => console.log(`  ${l}`));
  });
}

function runCli([arg]) {
  if (arg === '--history') return showHistory();

  const count = arg === undefined ? 1 : Number(arg);
  if (!Number.isInteger(count) || count < 1 || count > MAX_DICE) {
    logger.error(`Dice count must be a whole number from 1 to ${MAX_DICE}`);
    process.exitCode = 1;
    return;
  }

  logger.info(`Rolling ${count} ${count === 1 ? 'die' : 'dice'} with crypto.randomInt()`);
  const rolls = rollDice(count);

  for (let i = 0; i < rolls.length; i++) {
    const tag = count > 1 ? logger.colors.dim(` (roll ${i + 1})`) : '';
    console.log(`🎲 Dice Rolled: ${rolls[i]}  ${FACES[rolls[i] - 1]}${tag}`);
  }

  if (count > 1) {
    const total = rolls.reduce((sum, r) => sum + r, 0);
    console.log(`   Total: ${total} (${isEven(total) ? 'even' : 'odd'}), average: ${(total / count).toFixed(2)}`);
  }

  saveHistory(rolls, (err) => {
    if (err) return logger.error(`Could not save history: ${err.message}`);
    logger.success('Saved to dice-history.txt');
  });
}

if (require.main === module) {
  runCli(process.argv.slice(2));
}

module.exports = { rollDie, rollDice, saveHistory, FACES, MAX_DICE };
