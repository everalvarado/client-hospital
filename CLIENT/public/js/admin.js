const user = guard('admin');
let ROLES = [];

const cargar = {
  'sec-inicio': cargarResumen,
  'sec-personas': cargarPersonas,
  'sec-medicos': cargarMedicos,
  'sec-horarios': cargarHorarios,
  'sec-consultorios': cargarConsultorios,
  'sec-turnos': cargarTurnos,
};
initLayout(user, (sec) => cargar[sec]?.());

// ------------------------------------------------------------ Resumen
async function cargarResumen() {
  const r = await accion(() => api('/estadisticas/resumen'));
  if (r) {
    const items = [['Turnos hoy', r.turnos_hoy], ['Pendientes de aprobar', r.pendientes], ['Pacientes', r.pacientes],
      ['Médicos', r.medicos], ['Consultorios', r.consultorios], ['Personas', r.personas]];
    $('#stats').innerHTML = items.map(([l, n]) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');
  }
  const dias = await accion(() => api('/turnos/prioridad'));
  if (dias) {
    $('#prioridad').innerHTML = tabla(['Fecha', 'Turnos totales', 'Con prioridad', 'Estado'], dias.map((d) => `
      <tr><td>${fmtFecha(d.fecha)} <span class="muted">${fmtFechaLarga(d.fecha).split(',')[0]}</span></td>
          <td>${d.total_turnos}</td><td>${d.turnos_prioridad}</td>
          <td>${d.cumple_regla ? '<span class="badge b-ok">Cumple</span>' : `<span class="badge b-warn">Faltan ${2 - d.turnos_prioridad}</span>`}</td></tr>`));
  }
}

// ------------------------------------------------------------ Personas
let timerBusqueda;
$('#buscar-persona').oninput = () => { clearTimeout(timerBusqueda); timerBusqueda = setTimeout(cargarPersonas, 300); };

async function cargarPersonas() {
  if (!ROLES.length) ROLES = (await accion(() => api('/usuarios/roles'))) || [];
  const q = $('#buscar-persona').value.trim();
  const personas = await accion(() => api(`/personas${q ? '?q=' + encodeURIComponent(q) : ''}`));
  if (!personas) return;
  $('#tabla-personas').innerHTML = tabla(['DNI', 'Nombre', 'Contacto', 'Usuario', 'Roles', 'Acciones'], personas.map((p) => `
    <tr>
      <td>${esc(p.dni)}</td>
      <td><b>${esc(p.apellido)}, ${esc(p.nombre)}</b><br><small class="muted">${esc([p.ciudad, p.pais].filter(Boolean).join(', '))}${p.obra_social ? ' · ' + esc(p.obra_social) : ''}</small></td>
      <td><small>${esc(p.telefono || '-')}<br>${esc(p.email || '')}</small></td>
      <td>${p.nombre_usuario ? `${esc(p.nombre_usuario)}<br><span class="badge ${p.estado === 'Activo' ? 'b-ok' : 'b-no'}">${esc(p.estado)}</span>` : '<span class="muted">Sin usuario</span>'}</td>
      <td>${p.roles.map((r) => `<span class="chip">${esc(r.nombre_rol)}</span>`).join('')}</td>
      <td><div class="acts">
        <button class="btn sm sec" data-roles="${p.id_persona}">Roles</button>
        ${p.id_usuario ? `
          <button class="btn sm ${p.estado === 'Activo' ? 'danger' : 'ok'}" data-estado="${p.id_usuario}" data-nuevo="${p.estado === 'Activo' ? 'Inactivo' : 'Activo'}">${p.estado === 'Activo' ? 'Desactivar' : 'Activar'}</button>
          <button class="btn sm ghost" data-pass="${p.id_usuario}">Contraseña</button>` : ''}
      </div></td>
    </tr>`));

  $$('[data-roles]').forEach((b) => (b.onclick = () => editarRoles(personas.find((p) => p.id_persona == b.dataset.roles))));
  $$('[data-estado]').forEach((b) => (b.onclick = async () => {
    if (await accion(() => api(`/usuarios/${b.dataset.estado}/estado`, { method: 'PATCH', body: { estado: b.dataset.nuevo } }), 'Estado actualizado')) cargarPersonas();
  }));
  $$('[data-pass]').forEach((b) => (b.onclick = () => cambiarPass(b.dataset.pass)));
}

const checksRoles = (marcados = []) => ROLES.map((r) => `
  <label class="check"><input type="checkbox" name="roles" value="${r.id_rol}" ${marcados.includes(r.id_rol) ? 'checked' : ''}> ${esc(r.nombre_rol)}</label>`).join('');

$('#nueva-persona').onclick = async () => {
  if (!ROLES.length) ROLES = (await accion(() => api('/usuarios/roles'))) || [];
  const m = modal('Nueva persona', `
    <form id="form-persona" class="grid g2">
      ${camposPersonaHTML()}
      <div><label>Usuario (opcional)</label><input name="nombre_usuario" maxlength="50"></div>
      <div><label>Contraseña</label><input name="contraseña" type="password" minlength="6"></div>
      <div style="grid-column:1/-1"><label>Roles *</label><div class="grid g4">${checksRoles()}</div></div>
      <div class="footer" style="grid-column:1/-1"><button class="btn">Guardar</button></div>
    </form>`);
  opcionesPaises(1).then((html) => { $('.sel-pais', m).innerHTML = html; });
  $('#form-persona', m).onsubmit = async (e) => {
    e.preventDefault();
    const body = formData(e.target);
    body.roles = $$('input[name=roles]:checked', e.target).map((c) => Number(c.value));
    if (await accion(() => api('/personas', { method: 'POST', body }), 'Persona creada')) {
      cerrarModal();
      cargarPersonas();
    }
  };
};

function editarRoles(p) {
  const m = modal(`Roles de ${p.nombre} ${p.apellido}`, `
    <form id="form-roles"><div class="grid g2">${checksRoles(p.roles.map((r) => r.id_rol))}</div>
    <div class="footer"><button class="btn">Guardar roles</button></div></form>`);
  $('#form-roles', m).onsubmit = async (e) => {
    e.preventDefault();
    const roles = $$('input[name=roles]:checked', e.target).map((c) => Number(c.value));
    if (await accion(() => api(`/personas/${p.id_persona}/roles`, { method: 'PUT', body: { roles } }), 'Roles actualizados')) {
      cerrarModal();
      cargarPersonas();
    }
  };
}

function cambiarPass(idUsuario) {
  const m = modal('Cambiar contraseña', `
    <form id="form-pass"><label>Nueva contraseña</label><input name="contrasena" type="password" minlength="6" required>
    <div class="footer"><button class="btn">Guardar</button></div></form>`);
  $('#form-pass', m).onsubmit = async (e) => {
    e.preventDefault();
    if (await accion(() => api(`/usuarios/${idUsuario}/contrasena`, { method: 'PATCH', body: formData(e.target) }), 'Contraseña actualizada')) cerrarModal();
  };
}

// ------------------------------------------------------------ Médicos / especialidades
async function cargarMedicos() {
  const [esps, medicos] = await Promise.all([accion(() => api('/especialidades')), accion(() => api('/medicos'))]);
  if (!esps || !medicos) return;

  $('#tabla-esp').innerHTML = tabla(['Especialidad', ''], esps.map((e) => `
    <tr><td>${esc(e.nombre)}</td><td style="text-align:right"><button class="btn sm danger" data-del-esp="${e.id_especialidad}">Eliminar</button></td></tr>`));
  $('#sel-esp').innerHTML = esps.map((e) => `<option value="${e.id_especialidad}">${esc(e.nombre)}</option>`).join('');
  $('#sel-medico').innerHTML = medicos.map((m) => `<option value="${m.id_medico}">${esc(m.apellido)}, ${esc(m.nombre)}</option>`).join('');

  $('#tabla-medicos').innerHTML = tabla(['Médico', 'Especialidades'], medicos.map((m) => `
    <tr><td><b>Dr/a. ${esc(m.apellido)}, ${esc(m.nombre)}</b></td>
        <td>${m.especialidades.map((e) => `<span class="chip">${esc(e.nombre)} <a href="#" title="Quitar" data-quitar="${m.id_medico}/${e.id}">×</a></span>`).join('') || '<span class="muted">Sin especialidad</span>'}</td></tr>`),
  'No hay personas con rol Médico');

  $$('[data-del-esp]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Eliminar especialidad?')) return;
    if (await accion(() => api(`/especialidades/${b.dataset.delEsp}`, { method: 'DELETE' }), 'Especialidad eliminada')) cargarMedicos();
  }));
  $$('[data-quitar]').forEach((a) => (a.onclick = async (e) => {
    e.preventDefault();
    if (await accion(() => api(`/medicos/${a.dataset.quitar.replace('/', '/especialidades/')}`, { method: 'DELETE' }), 'Especialidad quitada')) cargarMedicos();
  }));
}

$('#form-esp').onsubmit = async (e) => {
  e.preventDefault();
  if (await accion(() => api('/especialidades', { method: 'POST', body: formData(e.target) }), 'Especialidad creada')) {
    e.target.reset();
    cargarMedicos();
  }
};

$('#form-me').onsubmit = async (e) => {
  e.preventDefault();
  if (await accion(() => api(`/medicos/${e.target.id_medico.value}/especialidades`, { method: 'POST', body: formData(e.target) }), 'Especialidad asignada')) cargarMedicos();
};

// ------------------------------------------------------------ Consultorios
async function cargarConsultorios() {
  cargarPaises();
  const cons = await accion(() => api('/consultorios'));
  if (!cons) return;
  $('#tabla-cons').innerHTML = tabla(['Número', 'Descripción', ''], cons.map((c) => `
    <tr><td><b>${c.numero}</b></td><td>${esc(c.descripcion || '')}</td>
        <td style="text-align:right"><button class="btn sm danger" data-del-cons="${c.id_consultorio}">Eliminar</button></td></tr>`));
  $$('[data-del-cons]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Eliminar consultorio?')) return;
    if (await accion(() => api(`/consultorios/${b.dataset.delCons}`, { method: 'DELETE' }), 'Consultorio eliminado')) cargarConsultorios();
  }));
}

$('#form-cons').onsubmit = async (e) => {
  e.preventDefault();
  if (await accion(() => api('/consultorios', { method: 'POST', body: formData(e.target) }), 'Consultorio creado')) {
    e.target.reset();
    cargarConsultorios();
  }
};

// ------------------------------------------------------------ Turnos
$('#f-fecha').onchange = cargarTurnos;
$('#f-estado').onchange = cargarTurnos;
$('#f-limpiar').onclick = () => { $('#f-fecha').value = ''; $('#f-estado').value = ''; cargarTurnos(); };

async function cargarTurnos() {
  const params = new URLSearchParams();
  if ($('#f-fecha').value) params.set('fecha', $('#f-fecha').value);
  if ($('#f-estado').value) params.set('estado', $('#f-estado').value);
  const turnos = await accion(() => api(`/turnos?${params}`));
  if (!turnos) return;
  $('#tabla-turnos').innerHTML = tabla(['Fecha', 'Hora', 'Paciente', 'Médico', 'Consultorio', 'Estado', ''], turnos.map((t) => `
    <tr><td>${fmtFecha(t.fecha)}</td><td>${t.hora}</td>
        <td>${esc(t.paciente)}<br><small class="muted">DNI ${esc(t.dni_paciente)}</small> ${badgePrio(t.prioridad_comunidad)}</td>
        <td>${esc(t.medico)}<br><small class="muted">${esc(t.especialidad || '')}${t.motivo ? ' · ' + esc(t.motivo) : ''}</small></td><td>${t.consultorio ?? '-'}</td><td>${badgeEstado(t.estado)}</td>
        <td>${['Pendiente', 'Aprobado'].includes(t.estado) ? `<button class="btn sm danger" data-cancel="${t.id_turno}">Cancelar</button>` : ''}</td></tr>`));
  $$('[data-cancel]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Cancelar este turno?')) return;
    if (await accion(() => api(`/turnos/${b.dataset.cancel}/cancelar`, { method: 'PATCH' }), 'Turno cancelado')) cargarTurnos();
  }));
}

// ------------------------------------------------------------ Horarios de atención
async function cargarHorarios() {
  const [medicos, consultorios] = await Promise.all([accion(() => api('/medicos')), accion(() => api('/consultorios'))]);
  if (!medicos || !consultorios) return;
  const opcMed = medicos.map((m) => `<option value="${m.id_medico}">${esc(m.apellido)}, ${esc(m.nombre)}</option>`).join('');
  if (!$('#h-medico').options.length) {
    $('#h-medico').innerHTML = opcMed;
    $('#h-filtro').innerHTML += opcMed;
    $('#h-consultorio').innerHTML = '<option value="">Sin asignar</option>' +
      consultorios.map((c) => `<option value="${c.id_consultorio}">${c.numero} · ${esc(c.descripcion || '')}</option>`).join('');
  }
  const filtro = $('#h-filtro').value;
  const horarios = await accion(() => api(`/horarios${filtro ? '?id_medico=' + filtro : ''}`));
  if (!horarios) return;
  $('#tabla-horarios').innerHTML = tabla(['Médico', 'Día', 'Horario', 'Turnos de', 'Consultorio', ''], horarios.map((h) => `
    <tr><td>${esc(h.medico)}</td><td><b>${esc(h.dia)}</b></td><td>${h.hora_inicio} a ${h.hora_fin}</td>
        <td>${h.duracion_minutos} min</td><td>${h.consultorio ?? '-'}</td>
        <td style="text-align:right"><button class="btn sm danger" data-del-hor="${h.id_horario}">Quitar</button></td></tr>`),
  'No hay horarios cargados');
  $$('[data-del-hor]').forEach((b) => (b.onclick = async () => {
    if (await accion(() => api(`/horarios/${b.dataset.delHor}`, { method: 'DELETE' }), 'Horario quitado')) cargarHorarios();
  }));
}
$('#h-filtro').onchange = cargarHorarios;
$('#form-horario').onsubmit = async (e) => {
  e.preventDefault();
  if (await accion(() => api('/horarios', { method: 'POST', body: formData(e.target) }), 'Horario agregado')) cargarHorarios();
};

// ------------------------------------------------------------ Países
async function cargarPaises() {
  const paises = await accion(() => api('/paises'));
  if (!paises) return;
  $('#tabla-paises').innerHTML = tabla(['País', ''], paises.map((p) => `
    <tr><td>${esc(p.nombre)}</td><td style="text-align:right"><button class="btn sm danger" data-del-pais="${p.id_pais}">Eliminar</button></td></tr>`));
  $$('[data-del-pais]').forEach((b) => (b.onclick = async () => {
    if (await accion(() => api(`/paises/${b.dataset.delPais}`, { method: 'DELETE' }), 'País eliminado')) cargarPaises();
  }));
}
$('#form-pais').onsubmit = async (e) => {
  e.preventDefault();
  if (await accion(() => api('/paises', { method: 'POST', body: formData(e.target) }), 'País agregado')) {
    e.target.reset();
    cargarPaises();
  }
};
