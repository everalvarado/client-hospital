const TEXTOS = {
  admin:     { nombre: 'Administrador', titulo: 'Panel de administración', texto: 'Gestioná personas, usuarios, roles, especialidades, consultorios y controlá la agenda.' },
  enfermero: { nombre: 'Enfermero',     titulo: 'Panel de enfermería',     texto: 'Registrá controles de peso y talla, verificalos y aprobá los turnos pendientes.' },
  medico:    { nombre: 'Médico',        titulo: 'Agenda médica',           texto: 'Consultá tu agenda diaria, la ficha de tus pacientes y marcá los turnos atendidos.' },
  paciente:  { nombre: 'Paciente',      titulo: 'Portal del paciente',     texto: 'Pedí tus turnos, seguí su estado y consultá tus controles de peso y talla.' },
};

let rolActual = 'paciente';

// Si ya hay sesión, ir directo al panel
if (Auth.token && Auth.user) location.href = `${Auth.user.rol}.html`;

// ------------------------------------------------------------ Modo demo: autorrelleno
const CFG = window.CONFIG || {};

function pintarCuentasDemo(rol) {
  const demo = $('.demo');
  if (!CFG.MODO_DEMO) { demo.classList.add('hidden'); return; }
  const lista = (CFG.CUENTAS_DEMO || {})[rol] || [];
  if (!lista.length) { demo.classList.add('hidden'); return; }
  $('#usuario').value = lista[0][0];
  $('#contrasena').value = lista[0][1];
  demo.innerHTML = `<b>Autorrelleno (modo demo):</b> elegí con qué usuario entrar
    <div class="demo-users">${lista.map(([u, , n], i) =>
      `<button type="button" class="demo-user ${i === 0 ? 'active' : ''}" data-i="${i}">${esc(n)} <span>@${esc(u)}</span></button>`).join('')}
    </div>`;
  $$('.demo-user', demo).forEach((b) => (b.onclick = () => {
    const [u, p] = lista[Number(b.dataset.i)];
    $('#usuario').value = u;
    $('#contrasena').value = p;
    $$('.demo-user', demo).forEach((x) => x.classList.toggle('active', x === b));
  }));
}

function seleccionarRol(rol) {
  rolActual = rol;
  pintarCuentasDemo(rol);
  document.body.className = `rol-${rol}`;
  $$('.role-btn').forEach((b) => b.classList.toggle('active', b.dataset.rol === rol));
  $('#side-title').textContent = TEXTOS[rol].titulo;
  $('#side-text').textContent = TEXTOS[rol].texto;
  $('#btn-login').textContent = `Ingresar como ${TEXTOS[rol].nombre}`;
  $('#registro-link').classList.toggle('hidden', rol !== 'paciente');
  $('#login-error').classList.add('hidden');
}

$$('.role-btn').forEach((b) => (b.onclick = () => seleccionarRol(b.dataset.rol)));
seleccionarRol(rolActual);

$('#form-login').onsubmit = async (e) => {
  e.preventDefault();
  const err = $('#login-error');
  err.classList.add('hidden');
  const btn = $('#btn-login');
  btn.disabled = true;
  try {
    const { usuario, contrasena } = formData(e.target);
    const { token, user } = await api('/auth/login', { method: 'POST', body: { usuario, 'contraseña': contrasena, rol: rolActual } });
    Auth.save(token, user);
    location.href = `${user.rol}.html`;
  } catch (ex) {
    err.textContent = ex.message;
    err.classList.remove('hidden');
  } finally {
    btn.disabled = false;
  }
};

$('#abrir-registro').onclick = (e) => {
  e.preventDefault();
  const m = modal('Registro de paciente', `
    <form id="form-reg" class="grid g2">
      ${camposPersonaHTML()}
      <div><label>Usuario *</label><input name="usuario" required maxlength="50"></div>
      <div><label>Contraseña * (mín. 6)</label><input name="contraseña" type="password" required minlength="6"></div>
      <div class="footer" style="grid-column:1/-1"><button class="btn" type="submit">Crear cuenta</button></div>
    </form>`);
  opcionesPaises(1).then((html) => { $('.sel-pais', m).innerHTML = html; });
  $('#form-reg', m).onsubmit = async (ev) => {
    ev.preventDefault();
    const r = await accion(() => api('/auth/registro-paciente', { method: 'POST', body: formData(ev.target) }), 'Cuenta creada. Ya podés iniciar sesión.');
    if (r) {
      $('#usuario').value = ev.target.usuario.value;
      cerrarModal();
    }
  };
};
