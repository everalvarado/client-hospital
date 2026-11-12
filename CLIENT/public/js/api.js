/* =============================================================
   Conexión frontend <-> backend + utilidades compartidas
   ============================================================= */

// Dirección de la API: viene de VITE_API_URL (ver js/config.js)
const API_BASE = (window.CONFIG && window.CONFIG.API_URL) || 'http://localhost:3001';

const Auth = {
  get token() { return localStorage.getItem('turnero_token'); },
  get user() {
    try { return JSON.parse(localStorage.getItem('turnero_user')); } catch { return null; }
  },
  save(token, user) {
    localStorage.setItem('turnero_token', token);
    localStorage.setItem('turnero_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('turnero_token');
    localStorage.removeItem('turnero_user');
    location.href = 'index.html';
  },
};

/** Llama a la API REST. Lanza Error con el mensaje del backend si falla. */
async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token) headers.Authorization = `Bearer ${Auth.token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verificá que la API esté corriendo (npm run dev en la carpeta API).');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    Auth.logout();
    throw new Error('Sesión expirada');
  }
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

/** Protege una página: solo entra el rol indicado */
function guard(rol) {
  const u = Auth.user;
  if (!Auth.token || !u || u.rol !== rol) {
    location.href = 'index.html';
    throw new Error('Sin acceso');
  }
  return u;
}

// ------------------------------------------------------------ Helpers DOM
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, tipo = '') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

const hoyISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

function fmtFecha(iso) {
  if (!iso) return '-';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function fmtFechaLarga(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const badgeEstado = (e) => `<span class="badge b-${esc(e)}">${esc(e)}</span>`;
const badgePrio = (p) => (p ? '<span class="badge b-prio">Prioridad comunidad</span>' : '');

function tabla(columnas, filas, vacio = 'Sin registros') {
  if (!filas.length) return `<div class="empty">${vacio}</div>`;
  return `<div class="table-wrap"><table>
    <thead><tr>${columnas.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${filas.join('')}</tbody></table></div>`;
}

/** Abre un modal con HTML; devuelve el elemento para enganchar eventos */
function modal(titulo, html) {
  cerrarModal();
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.id = 'modal';
  bg.innerHTML = `<div class="modal"><h2>${esc(titulo)}<button class="close" type="button">×</button></h2>${html}</div>`;
  bg.addEventListener('click', (e) => { if (e.target === bg) cerrarModal(); });
  $('.close', bg).onclick = cerrarModal;
  document.body.appendChild(bg);
  return bg;
}
const cerrarModal = () => $('#modal')?.remove();

/** Opciones <option> de países (GET /paises, público) */
async function opcionesPaises(seleccionado) {
  const paises = (await api('/paises').catch(() => [])) || [];
  return '<option value="">—</option>' + paises.map((p) =>
    `<option value="${p.id_pais}" ${String(p.id_pais) === String(seleccionado) ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('');
}

const opcionesSexo = (sel) => [['', '—'], ['F', 'Femenino'], ['M', 'Masculino'], ['X', 'Otro / No binario']]
  .map(([v, t]) => `<option value="${v}" ${v === (sel || '') ? 'selected' : ''}>${t}</option>`).join('');

/** Campos de persona compartidos por el registro y el alta del administrador */
const camposPersonaHTML = () => `
  <div><label>DNI *</label><input name="dni" required maxlength="15"></div>
  <div><label>Fecha de nacimiento</label><input name="fecha_nacimiento" type="date"></div>
  <div><label>Nombre *</label><input name="nombre" required maxlength="50"></div>
  <div><label>Apellido *</label><input name="apellido" required maxlength="50"></div>
  <div><label>Sexo</label><select name="sexo">${opcionesSexo()}</select></div>
  <div><label>Teléfono</label><input name="telefono" maxlength="20"></div>
  <div><label>Email</label><input name="email" type="email" maxlength="100"></div>
  <div><label>País</label><select name="id_pais" class="sel-pais"><option value="">Cargando…</option></select></div>
  <div><label>Ciudad</label><input name="ciudad" maxlength="80"></div>
  <div><label>Dirección (paraje o comunidad si corresponde)</label><input name="direccion" maxlength="100"></div>
  <div><label>Obra social</label><input name="obra_social" maxlength="80" placeholder="Sin obra social"></div>
  <div><label>N° de afiliado</label><input name="numero_afiliado" maxlength="30"></div>`;

const formData = (form) => Object.fromEntries(new FormData(form).entries());

/** Configura sidebar: usuario, logout y navegación entre secciones */
function initLayout(user, onChange) {
  $('#user-nombre').textContent = user.nombre;
  $('#user-usuario').textContent = '@' + user.usuario;
  $('#logout').onclick = () => Auth.logout();
  const botones = $$('.sidebar nav button');
  const mostrar = (id) => {
    botones.forEach((b) => b.classList.toggle('active', b.dataset.sec === id));
    $$('.section').forEach((s) => s.classList.toggle('active', s.id === id));
    $('#titulo').textContent = botones.find((b) => b.dataset.sec === id)?.dataset.title || '';
    onChange?.(id);
  };
  botones.forEach((b) => (b.onclick = () => mostrar(b.dataset.sec)));
  mostrar(botones[0].dataset.sec);
  return mostrar;
}

/** Ejecuta una acción mostrando toast de éxito o error */
async function accion(fn, okMsg) {
  try {
    const r = await fn();
    if (okMsg) toast(okMsg, 'ok');
    return r;
  } catch (e) {
    toast(e.message, 'err');
    return undefined;
  }
}
