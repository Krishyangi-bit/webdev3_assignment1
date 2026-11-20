// modules/logger.js
// A tiny reusable logger: timestamps + ANSI colours (bonus challenge).
// Every other file in the toolkit requires this module.

const useColor = Boolean(process.stdout.isTTY) && !('NO_COLOR' in process.env);

const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text));

const colors = {
  bold: paint('1'),
  dim: paint('2'),
  red: paint('31'),
  green: paint('32'),
  yellow: paint('33'),
  blue: paint('34'),
  magenta: paint('35'),
  cyan: paint('36'),
};

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function format(color, label, message) {
  return `${colors.dim(`[${timestamp()}]`)} ${color(label.padEnd(7))} ${message}`;
}

const info = (message) => console.log(format(colors.cyan, 'INFO', message));
const success = (message) => console.log(format(colors.green, 'SUCCESS', message));
const warn = (message) => console.log(format(colors.yellow, 'WARN', message));
const error = (message) => console.error(format(colors.red, 'ERROR', message));

// Used by server.js to log every HTTP request with its status and timing.
function request(method, url, status, ms) {
  const statusColor =
    status >= 500 ? colors.red : status >= 400 ? colors.yellow : status >= 300 ? colors.cyan : colors.green;
  console.log(
    format(colors.magenta, 'HTTP', `${colors.bold(method.padEnd(6))} ${url} ${statusColor(status)} ${colors.dim(`${ms}ms`)}`)
  );
}

module.exports = { info, success, warn, error, request, timestamp, colors };
