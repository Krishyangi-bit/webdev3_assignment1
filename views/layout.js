// views/layout.js
// Shared page shell: sidebar navigation, request bar and footer.

const { STATUS_CODES } = require('http');

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/tools', label: 'Tools' },
];

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

function layout({ title, path, body, method = 'GET', status = 200 }) {
  const nav = NAV.map((item, i) => {
    const active = item.href === path;
    return `<a class="nav-item${active ? ' is-active' : ''}" href="${item.href}"${active ? ' aria-current="page"' : ''}>
          <span class="nav-idx">0${i + 1}</span><span class="nav-label">${item.label}</span><span class="nav-path">${item.href}</span>
        </a>`;
  }).join('\n        ');

  const statusClass = `s${String(status)[0]}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · Smart Utility Toolkit</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div class="shell">
    <aside class="rail">
      <a class="brand" href="/">
        <span class="brand-mark">SU</span>
        <span class="brand-text">Smart Utility Toolkit<small>lab-01 · node core</small></span>
      </a>
      <nav class="nav" aria-label="Main">
        <p class="nav-title">Routes</p>
        ${nav}
      </nav>
      <div class="rail-foot">
        <span class="dot"></span>server online<br>
        node ${escapeHtml(process.version)}<br>
        0 npm dependencies
      </div>
    </aside>

    <main>
      <div class="reqbar" role="status">
        <span class="verb">${escapeHtml(method)}</span>
        <span class="req-path">${escapeHtml(path)}</span>
        <span class="status ${statusClass}">${status} ${escapeHtml(STATUS_CODES[status] || '')}</span>
        <span class="served">served by http.createServer()</span>
      </div>
      <div class="content">
${body}
      </div>
      <footer class="footer">
        Smart Utility Toolkit · Web Dev III Lab Assignment 1 · built with process, http, fs and crypto only
      </footer>
    </main>
  </div>
</body>
</html>`;
}

module.exports = { layout, escapeHtml };
