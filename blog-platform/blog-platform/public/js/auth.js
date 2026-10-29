const params = new URLSearchParams(location.search);
const redirectTo = safeRedirect(params.get('redirect'));
const msg = document.getElementById('msg');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabs = document.querySelectorAll('.tab');

if (Auth.token) location.replace(redirectTo);

function showTab(name) {
  loginForm.hidden = name !== 'login';
  registerForm.hidden = name !== 'register';
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  msg.hidden = true;
}
tabs.forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
if (params.get('tab') === 'register') showTab('register');

async function submit(form, endpoint, fields) {
  const button = form.querySelector('button[type=submit]');
  button.disabled = true;
  msg.hidden = true;
  try {
    const body = Object.fromEntries(fields.map((f) => [f, form.elements[f].value]));
    const { token, user } = await api(`/auth/${endpoint}`, { method: 'POST', body });
    Auth.save(token, user);
    location.href = redirectTo;
  } catch (err) {
    showMessage(msg, err.message);
    button.disabled = false;
  }
}

loginForm.addEventListener('submit', (e) => { e.preventDefault(); submit(loginForm, 'login', ['email', 'password']); });
registerForm.addEventListener('submit', (e) => { e.preventDefault(); submit(registerForm, 'register', ['name', 'email', 'password']); });
