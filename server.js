// server.js
// HTTP server built only on the core http module.
//
//   node server.js              -> http://localhost:3000
//   $env:PORT=4000; node server.js   (PowerShell, custom port)

const http = require('http');
const fs = require('fs');
const path = require('path');

const logger = require('./modules/logger');
const isEven = require('./modules/isEven');
const { calculate } = require('./calculator');
const { rollDice, saveHistory } = require('./dice');
const pages = require('./views/pages');

const PORT = Number(process.env.PORT) || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.txt');
const STYLESHEET = path.join(__dirname, 'public', 'style.css');
const MAX_BODY_BYTES = 10 * 1024;
const MAX_WEB_DICE = 10;

// ------------------------------------------------------------ helpers
function send(res, status, body, type = 'text/html; charset=utf-8', headers = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body), ...headers });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data, null, 2), 'application/json; charset=utf-8');
}

function runCalc(q) {
  const state = { op: q.get('op'), a: q.get('a'), b: q.get('b') };
  try {
    state.result = calculate(state.op, state.a, state.b);
  } catch (err) {
    state.error = err.message;
  }
  return state;
}

function runParity(q) {
  const state = { n: q.get('n') ?? '' };
  try {
    state.result = isEven(state.n);
  } catch (err) {
    state.error = err.message;
  }
  return state;
}

function runDice(q) {
  const raw = q.get('count') ?? '1';
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 1 || count > MAX_WEB_DICE) {
    return { count: raw, error: `count must be a whole number from 1 to ${MAX_WEB_DICE}` };
  }
  const rolls = rollDice(count);
  saveHistory(rolls, (err) => err && logger.error(`Could not save dice history: ${err.message}`));
  return { count, rolls, total: rolls.reduce((sum, r) => sum + r, 0) };
}

function validateContact(v) {
  const errors = {};
  if (!v.name) errors.name = 'Please enter your name.';
  else if (v.name.length > 80) errors.name = 'Name must be 80 characters or fewer.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'Please enter a valid email address.';
  if (v.subject.length > 120) errors.subject = 'Subject must be 120 characters or fewer.';
  if (v.message.length < 5) errors.message = 'Message should be at least 5 characters.';
  else if (v.message.length > 2000) errors.message = 'Message must be 2000 characters or fewer.';
  return errors;
}

// ----------------------------------------------------------- handlers
function serveStylesheet(req, res) {
  fs.readFile(STYLESHEET, 'utf8', (err, css) => {
    if (err) {
      logger.error(`Could not read style.css: ${err.message}`);
      return send(res, 500, '/* stylesheet missing */', 'text/css; charset=utf-8');
    }
    send(res, 200, css, 'text/css; charset=utf-8', { 'Cache-Control': 'no-cache' });
  });
}

function handleContactPost(req, res) {
  let body = '';
  let tooLarge = false;

  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    if (tooLarge) return;
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) tooLarge = true;
  });

  req.on('end', () => {
    if (tooLarge) {
      logger.warn('Rejected contact form: body too large');
      return send(res, 413, pages.contact({ errors: { form: 'That message is too large to accept.' }, method: 'POST', status: 413 }));
    }

    const form = new URLSearchParams(body);
    const values = {
      name: (form.get('name') || '').trim(),
      email: (form.get('email') || '').trim(),
      subject: (form.get('subject') || '').trim(),
      message: (form.get('message') || '').trim(),
    };

    const errors = validateContact(values);
    if (Object.keys(errors).length) {
      logger.warn(`Contact form invalid: ${Object.keys(errors).join(', ')}`);
      return send(res, 400, pages.contact({ values, errors, method: 'POST', status: 400 }));
    }

    const entry = [
      `[${logger.timestamp()}] ${values.name} <${values.email}>`,
      `Subject: ${values.subject || '(none)'}`,
      values.message,
      '-'.repeat(40),
      '',
    ].join('\n');

    logger.info(`Saving message from ${values.name}...`);
    fs.appendFile(MESSAGES_FILE, entry, 'utf8', (err) => {
      if (err) {
        logger.error(`Could not save message: ${err.message}`);
        return send(res, 500, pages.contact({ values, errors: { form: 'The server could not save your message. Please try again.' }, method: 'POST', status: 500 }));
      }
      logger.success('Message saved to messages.txt');
      send(res, 200, pages.contactSuccess(values));
    });
  });

  req.on('error', (err) => logger.error(`Request stream error: ${err.message}`));
}

function handleTools(req, res, url) {
  const q = url.searchParams;
  const tool = q.get('tool');
  const state = {};
  if (tool === 'calc') state.calc = runCalc(q);
  if (tool === 'parity') state.parity = runParity(q);
  if (tool === 'dice') state.dice = runDice(q);
  send(res, 200, pages.tools(state));
}

function apiResult(res, state) {
  if (state.error) return sendJson(res, 400, { ok: false, error: state.error });
  sendJson(res, 200, { ok: true, ...state });
}

// ---------------------------------------------------------- route table
// Key format: "METHOD /path"
const routes = {
  'GET /': (req, res) => send(res, 200, pages.home()),
  'GET /about': (req, res) => send(res, 200, pages.about()),
  'GET /contact': (req, res) => send(res, 200, pages.contact()),
  'POST /contact': handleContactPost,
  'GET /tools': handleTools,
  'GET /style.css': serveStylesheet,
  'GET /favicon.ico': (req, res) => {
    res.writeHead(204);
    res.end();
  },

  'GET /api/calc': (req, res, url) => apiResult(res, runCalc(url.searchParams)),
  'GET /api/is-even': (req, res, url) => apiResult(res, runParity(url.searchParams)),
  'GET /api/dice': (req, res, url) => apiResult(res, runDice(url.searchParams)),
  'GET /api/status': (req, res) =>
    sendJson(res, 200, {
      ok: true,
      node: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      pid: process.pid,
    }),
};

function normalisePath(rawUrl) {
  const url = new URL(rawUrl, 'http://localhost');
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  return { url, pathname };
}

// --------------------------------------------------------------- server
const server = http.createServer((req, res) => {
  const started = Date.now();
  res.on('finish', () => logger.request(req.method, req.url, res.statusCode, Date.now() - started));

  let parsed;
  try {
    parsed = normalisePath(req.url);
  } catch {
    return send(res, 400, 'Bad request', 'text/plain; charset=utf-8');
  }
  const { url, pathname } = parsed;

  const handler = routes[`${req.method} ${pathname}`];
  if (handler) return handler(req, res, url);

  // The path exists but not for this method -> 405
  const allowed = Object.keys(routes)
    .filter((key) => key.split(' ')[1] === pathname)
    .map((key) => key.split(' ')[0]);

  if (allowed.length) {
    const headers = { Allow: allowed.join(', ') };
    if (pathname.startsWith('/api/')) {
      return send(res, 405, JSON.stringify({ ok: false, error: `Use ${allowed.join(', ')}` }), 'application/json; charset=utf-8', headers);
    }
    return send(res, 405, pages.methodNotAllowed(req.method, pathname, allowed), undefined, headers);
  }

  if (pathname.startsWith('/api/')) {
    return sendJson(res, 404, { ok: false, error: `No API route for ${pathname}` });
  }
  send(res, 404, pages.notFound(req.method, pathname));
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Stop the other process or pick another port, e.g. $env:PORT=4000; node server.js`);
  } else {
    logger.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});

logger.info('Starting server...');
server.listen(PORT, () => {
  logger.success(`Server running at http://localhost:${PORT}`);
  const list = Object.keys(routes).filter((r) => !r.includes('favicon') && !r.includes('style.css'));
  logger.info(`Routes: ${list.join(' | ')}`);
  logger.info('Press Ctrl+C to stop');
});
logger.info('server.listen() called. Waiting for the async "listening" event...');

process.on('SIGINT', () => {
  console.log('');
  logger.warn('Shutting down server...');
  server.close(() => {
    logger.success('Server stopped');
    process.exit(0);
  });
  // Keep-alive connections can hold close() open; don't wait forever.
  setTimeout(() => process.exit(0), 1000).unref();
});
