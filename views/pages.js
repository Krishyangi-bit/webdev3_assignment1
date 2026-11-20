// views/pages.js
// One function per page. Each returns a complete HTML string.

const { layout, escapeHtml: e } = require('./layout');
const { OPERATIONS } = require('../calculator');
const { FACES } = require('../dice');

// ---------------------------------------------------------------- Home
const UTILITIES = [
  {
    core: 'process',
    title: 'CLI Calculator',
    text: 'Reads the operation and two numbers from process.argv. Supports add, sub, mul, div, mod and pow, and rejects bad input with a clear message.',
    cmd: 'node calculator.js add 10 5',
  },
  {
    core: 'module.exports',
    title: 'Custom Modules',
    text: 'isEven and logger live in /modules and are required by every other utility, including this server.',
    cmd: 'node app.js 4 7 10',
  },
  {
    core: 'http',
    title: 'HTTP Server',
    text: 'Routes for /, /about, /contact and /tools plus a small JSON API. Anything else gets a real 404.',
    cmd: 'node server.js',
  },
  {
    core: 'fs',
    title: 'File Manager',
    text: 'Create, read, update and delete text files with writeFile, readFile, appendFile and unlink. A missing file is reported, not crashed on.',
    cmd: 'node fileManager.js',
  },
  {
    core: 'crypto',
    title: 'Dice Roller',
    text: 'crypto.randomInt() rolls 1 to 6 inside a loop. Every roll is appended to dice-history.txt.',
    cmd: 'node dice.js 5',
  },
  {
    core: 'console',
    title: 'Execution Flow',
    text: 'Timestamped, colour-coded logs show sync code, nextTick, promises, timers and I/O callbacks in the order Node runs them.',
    cmd: 'node app.js',
  },
];

const ENDPOINTS = [
  { href: '/api/calc?op=add&a=10&b=5', desc: 'Calculator as JSON' },
  { href: '/api/is-even?n=42', desc: 'Parity check' },
  { href: '/api/dice?count=3', desc: 'Roll three dice' },
  { href: '/api/status', desc: 'Uptime and memory' },
  { href: '/this-page-does-not-exist', desc: 'Custom 404 page' },
];

function home() {
  const cards = UTILITIES.map(
    (u, i) => `
          <article class="mod-card">
            <header><span class="mod-num">0${i + 1}</span><span class="tag">${u.core}</span></header>
            <h3>${u.title}</h3>
            <p>${u.text}</p>
            <code class="cmd"><span class="prompt">$</span>${u.cmd}</code>
          </article>`
  ).join('');

  const endpoints = ENDPOINTS.map(
    (ep) => `
          <li><a href="${e(ep.href)}"><span class="verb">GET</span><span class="ep">${e(ep.href)}</span><span class="ep-desc">${ep.desc}</span></a></li>`
  ).join('');

  const body = `
        <section class="hero">
          <p class="eyebrow">Lab Assignment 1 · Web Dev III · Unit 1</p>
          <h1>Welcome to the Node Server.</h1>
          <p class="lead">Six small utilities built on Node.js core modules. No npm packages, no frameworks. This page is served by the built-in <code>http</code> module.</p>
          <div class="hero-actions">
            <a class="btn" href="/tools">Try the tools</a>
            <a class="btn btn-ghost" href="/about">Read the brief</a>
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <h2>The toolkit</h2>
            <p>Each utility also runs from the terminal.</p>
          </div>
          <div class="mod-grid">${cards}
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <h2>Test it in the browser</h2>
            <p>Or point Postman at the same URLs.</p>
          </div>
          <ul class="endpoints">${endpoints}
          </ul>
        </section>`;

  return layout({ title: 'Home', path: '/', body });
}

// --------------------------------------------------------------- About
const TOPICS = [
  ['Introduction to Backend Development', 'Every page is built on the server. The browser receives finished HTML.'],
  ['HTTP Fundamentals', 'GET and POST, status codes 200 / 400 / 404 / 405 / 413, and headers like Content-Type and Allow.'],
  ['Node.js Runtime & NPM', `Runs on Node ${process.version}. package.json holds npm scripts and zero dependencies.`],
  ['Node.js Modules', 'CommonJS: module.exports in /modules, require() everywhere else.'],
  ['Core Node.js Modules', 'process, http, fs, crypto, path and url. Nothing installed.'],
  ['Process Object & CLI', 'process.argv for input, process.exitCode for failures, process.env.PORT for config.'],
  ['HTTP Server Development', 'http.createServer with a route table, a static stylesheet and form POST parsing.'],
  ['API Testing & Debugging', 'JSON endpoints under /api for Postman or curl. Each request is logged with status and timing.'],
];

function about() {
  const topics = TOPICS.map(([title, text]) => `
            <li><div><strong>${title}</strong><span>${e(text)}</span></div></li>`).join('');

  const body = `
        <p class="eyebrow">About</p>
        <h1 class="page-title">About Page</h1>

        <div class="two-col section">
          <div class="prose">
            <p class="lead">The Smart Utility Toolkit is a hands-on lab for learning backend fundamentals with Node.js core modules.</p>
            <p>It covers command-line input, modular code, server creation, file handling and secure randomness. Each part is a small, self-contained program. The server ties them together so they can be used from a browser.</p>
            <p>Nothing here comes from npm. Routing, form parsing, static files and JSON responses are all written by hand on top of <code>http</code>, <code>fs</code> and <code>crypto</code>.</p>
          </div>
          <dl class="spec">
            <div><dt>Course</dt><dd>Web Dev III (Node.js &amp; Express Backend)</dd></div>
            <div><dt>Unit</dt><dd>Unit 1</dd></div>
            <div><dt>Marks</dt><dd>2.5</dd></div>
            <div><dt>Mode</dt><dd>In-class lab practical</dd></div>
            <div><dt>Time</dt><dd>45 to 60 minutes</dd></div>
          </dl>
        </div>

        <section class="section">
          <div class="section-head"><h2>Unit 1 topics, and where they show up</h2></div>
          <ol class="topics">${topics}
          </ol>
        </section>

        <div class="two-col section">
          <section>
            <div class="section-head"><h2>Rules followed</h2></div>
            <ul class="checklist">
              <li>No external npm packages</li>
              <li>No Express or other frameworks</li>
              <li>No database. Data goes to plain .txt files.</li>
              <li>Only Node.js built-in modules</li>
              <li>Every program runs from the terminal</li>
            </ul>
          </section>
          <section>
            <div class="section-head"><h2>Project structure</h2></div>
<pre class="tree"><span class="dir">smart-utility-toolkit/</span>
├── calculator.js   <span class="note"># process.argv</span>
├── app.js          <span class="note"># module reuse + event loop</span>
├── server.js       <span class="note"># http</span>
├── fileManager.js  <span class="note"># fs CRUD</span>
├── dice.js         <span class="note"># crypto</span>
├── test.txt
├── <span class="dir">modules/</span>
│   ├── isEven.js
│   └── logger.js
├── <span class="dir">views/</span>          <span class="note"># HTML templates</span>
├── <span class="dir">public/</span>         <span class="note"># style.css</span>
└── README.md</pre>
          </section>
        </div>`;

  return layout({ title: 'About', path: '/about', body });
}

// ------------------------------------------------------------- Contact
function field(name, label, values, errors, { type = 'text', textarea = false, attrs = '' } = {}) {
  const error = errors[name];
  const control = textarea
    ? `<textarea id="${name}" name="${name}" ${attrs}>${e(values[name])}</textarea>`
    : `<input id="${name}" name="${name}" type="${type}" value="${e(values[name])}" ${attrs}>`;
  return `
            <div class="field${error ? ' has-error' : ''}">
              <label for="${name}">${label}</label>
              ${control}
              ${error ? `<p class="field-error">${e(error)}</p>` : ''}
            </div>`;
}

function contact({ values = {}, errors = {}, method = 'GET', status = 200 } = {}) {
  const body = `
        <p class="eyebrow">Contact</p>
        <h1 class="page-title">Contact Page</h1>

        <div class="contact-grid section">
          <div>
            <p class="lead">Send a message. The server writes it to <code>messages.txt</code>. No database needed.</p>
            <ol class="steps">
              <li><span>The browser sends a <strong>POST /contact</strong> with a URL-encoded body.</span></li>
              <li><span>The server collects the body chunk by chunk from the request stream.</span></li>
              <li><span>Fields are checked. Mistakes come back with a <strong>400</strong> and your input kept.</span></li>
              <li><span><code>fs.appendFile()</code> saves the message and the terminal logs it.</span></li>
            </ol>
          </div>

          <form class="form" method="post" action="/contact" novalidate>
            ${errors.form ? `<div class="alert alert-err">${e(errors.form)}</div>` : ''}
            <div class="row">${field('name', 'Name', values, errors, { attrs: 'autocomplete="name" maxlength="80"' })}${field('email', 'Email', values, errors, { type: 'email', attrs: 'autocomplete="email" maxlength="120"' })}
            </div>${field('subject', 'Subject <span class="hint">(optional)</span>', values, errors, { attrs: 'maxlength="120"' })}${field('message', 'Message', values, errors, { textarea: true, attrs: 'maxlength="2000"' })}
            <div><button class="btn" type="submit">Send message</button></div>
          </form>
        </div>`;

  return layout({ title: 'Contact', path: '/contact', body, method, status });
}

function contactSuccess(values) {
  const body = `
        <p class="eyebrow">Contact</p>
        <h1 class="page-title">Message received.</h1>
        <div class="section">
          <div class="alert alert-ok">
            Thanks, <strong>${e(values.name)}</strong>. Your message was appended to <code>messages.txt</code>.
          </div>
          <dl class="spec receipt">
            <div><dt>From</dt><dd>${e(values.name)} &lt;${e(values.email)}&gt;</dd></div>
            <div><dt>Subject</dt><dd>${e(values.subject || '(none)')}</dd></div>
            <div><dt>Message</dt><dd class="pre">${e(values.message)}</dd></div>
          </dl>
          <p><a class="btn btn-ghost" href="/contact">Send another</a></p>
        </div>`;

  return layout({ title: 'Message sent', path: '/contact', body, method: 'POST' });
}

// --------------------------------------------------------------- Tools
function resultBlock(state, render) {
  if (!state) return '<div class="result muted">Result appears here</div>';
  if (state.error) return `<div class="result error"><span class="result-label">Error</span>${e(state.error)}</div>`;
  return `<div class="result">${render(state)}</div>`;
}

function tools({ calc, parity, dice } = {}) {
  const c = calc || {};
  const options = Object.entries(OPERATIONS)
    .map(([key, op]) => `<option value="${key}"${c.op === key ? ' selected' : ''}>${op.name} (${op.symbol})</option>`)
    .join('');

  const body = `
        <p class="eyebrow">Tools</p>
        <h1 class="page-title">The utilities, in the browser.</h1>
        <p class="lead">Each form sends a GET request. The server runs the same module the CLI uses and renders the result.</p>

        <div class="tool-grid section">
          <article class="tool" id="calc">
            <div class="tool-head"><h3>Calculator</h3><span class="tag">calculator.js</span></div>
            <form class="tool-body" method="get" action="/tools#calc">
              <input type="hidden" name="tool" value="calc">
              <div class="field"><label for="op">Operation</label><select id="op" name="op">${options}</select></div>
              <div class="inline">
                <div class="field"><label for="a">a</label><input id="a" name="a" type="number" step="any" required value="${e(c.a ?? 10)}"></div>
                <div class="field"><label for="b">b</label><input id="b" name="b" type="number" step="any" required value="${e(c.b ?? 5)}"></div>
              </div>
              <button class="btn" type="submit">Calculate</button>
            </form>
            ${resultBlock(calc, (s) => `<span class="result-label">Result</span><span class="result-value">${e(s.result)}</span>`)}
          </article>

          <article class="tool" id="parity">
            <div class="tool-head"><h3>Even or odd</h3><span class="tag">modules/isEven.js</span></div>
            <form class="tool-body" method="get" action="/tools#parity">
              <input type="hidden" name="tool" value="parity">
              <div class="field"><label for="n">Whole number</label><input id="n" name="n" type="number" step="1" required value="${e(parity?.n ?? 42)}"></div>
              <button class="btn" type="submit">Check</button>
            </form>
            ${resultBlock(parity, (s) => `<span class="result-label">isEven(${e(s.n)})</span><span class="result-value">${s.result ? 'true · even' : 'false · odd'}</span>`)}
          </article>

          <article class="tool" id="dice">
            <div class="tool-head"><h3>Dice roller</h3><span class="tag">dice.js · crypto</span></div>
            <form class="tool-body" method="get" action="/tools#dice">
              <input type="hidden" name="tool" value="dice">
              <div class="field"><label for="count">How many dice (1 to 10)</label><input id="count" name="count" type="number" min="1" max="10" step="1" required value="${e(dice?.count ?? 3)}"></div>
              <button class="btn" type="submit">Roll</button>
            </form>
            ${resultBlock(dice, (s) => `<span class="result-label">Rolled ${s.rolls.join(', ')} · total ${s.total}</span><span class="dice-row" aria-hidden="true">${s.rolls.map((r) => FACES[r - 1]).join('')}</span>`)}
          </article>
        </div>`;

  return layout({ title: 'Tools', path: '/tools', body });
}

// ----------------------------------------------------------------- 404
function notFound(method, path) {
  const body = `
        <div class="notfound">
          <p class="code">404</p>
          <h1 class="page-title">Nothing lives at this route.</h1>
          <p class="lead">The server checked its route table and found no match for <code>${e(method)} ${e(path)}</code>.</p>
          <div class="section-head"><h2>Routes that do exist</h2></div>
          <ul class="endpoints">
            <li><a href="/"><span class="verb">GET</span><span class="ep">/</span><span class="ep-desc">Welcome</span></a></li>
            <li><a href="/about"><span class="verb">GET</span><span class="ep">/about</span><span class="ep-desc">About page</span></a></li>
            <li><a href="/contact"><span class="verb">GET</span><span class="ep">/contact</span><span class="ep-desc">Contact page</span></a></li>
            <li><a href="/tools"><span class="verb">GET</span><span class="ep">/tools</span><span class="ep-desc">Calculator, parity, dice</span></a></li>
          </ul>
        </div>`;

  return layout({ title: 'Not found', path, body, method, status: 404 });
}

function methodNotAllowed(method, path, allowed) {
  const body = `
        <div class="notfound">
          <p class="code">405</p>
          <h1 class="page-title">Wrong method for this route.</h1>
          <p class="lead"><code>${e(path)}</code> exists but does not accept <code>${e(method)}</code>. Allowed: <code>${e(allowed.join(', '))}</code>.</p>
          <p><a class="btn" href="/">Back home</a></p>
        </div>`;

  return layout({ title: 'Method not allowed', path, body, method, status: 405 });
}

module.exports = { home, about, contact, contactSuccess, tools, notFound, methodNotAllowed };
