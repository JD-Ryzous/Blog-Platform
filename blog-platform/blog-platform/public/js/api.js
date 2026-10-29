/* Shared helpers used by every page. */

// ---- Login state (token + user are kept in localStorage) ----
const Auth = {
  get token() { return localStorage.getItem('token'); },
  get user() {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },
  save(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ---- Calls the REST API and returns parsed JSON, or throws Error(message) ----
async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token) headers.Authorization = `Bearer ${Auth.token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && Auth.token) Auth.clear(); // token expired or invalid
    const msg = data.errors?.length ? data.errors.map((e) => e.message).join(' ') : data.message;
    throw new Error(msg || 'Request failed.');
  }
  return data;
}

// ---- Safe DOM builder: text is inserted as text, never as HTML (prevents XSS) ----
function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  node.append(...children.flat().filter((c) => c != null));
  return node;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showMessage(box, text, type = 'error') {
  box.className = `message ${type}`;
  box.textContent = text;
  box.hidden = false;
}

// Only allow redirects to pages on this site
function safeRedirect(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

// ---- Navigation bar (Home, Create Blog, Login / Logout) ----
function renderNav() {
  const here = location.pathname;
  const user = Auth.user;
  const link = (href, label) => h('a', { href, class: here === href ? 'active' : '' }, label);

  const links = h('nav', { class: 'nav-links', id: 'nav-links' },
    link('/', 'Home'),
    link('/editor.html', 'Create Blog'),
    user
      ? [h('span', { class: 'nav-user' }, `Hi, ${user.name}`),
         h('button', { class: 'link', onclick: () => { Auth.clear(); location.href = '/'; } }, 'Logout')]
      : link('/login.html', 'Login')
  );
  const menuBtn = h('button', {
    class: 'menu-btn', 'aria-label': 'Toggle menu',
    onclick: () => links.classList.toggle('open')
  }, '☰');

  document.getElementById('navbar').replaceChildren(
    h('div', { class: 'nav-inner' }, h('a', { class: 'brand', href: '/' }, 'BlogSpace'), menuBtn, links)
  );
}
document.addEventListener('DOMContentLoaded', renderNav);
