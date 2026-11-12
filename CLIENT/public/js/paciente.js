const user = guard('paciente');
let horaSel = null;
let dispActual = null;

$('#sel-fecha').min = hoyISO();

initLayout(user, (sec) => {
  if (sec === 'sec-pedir') cargarEspecialidades();
  if (sec === 'sec-turnos') cargarTurnos();
  if (sec === 'sec-controles') cargarControles();
  if (sec === 'sec-perfil') cargarPerfil();
});

// ------------------------------------------------------------ Pedir turno
async function cargarEspecialidades() {
  if ($('#sel-esp').options.length > 1) return;
  const esps = await accion(() => api('/especialidades'));
  if (!esps) return;
  $('#sel-esp').innerHTML += esps.map((e) => `<option value="${e.id_especialidad}">${esc(e.nombre)}</option>`).join('');
}

$('#sel-esp').onchange = async () => {
  const esp = $('#sel-esp').value;
  $('#sel-med').innerHTML = '<option value="">—</option>';
  $('#sel-med').disabled = true;
  resetSlots();
  if (!esp) return;
  const meds = await accion(() => api(`/medicos?especialidad=${esp}`));
  if (!meds) return;
  $('#sel-med').innerHTML = meds.length
    ? '<option value="">Elegí un médico…</option>' + meds.map((m) => `<option value="${m.id_medico}">Dr/a. ${esc(m.apellido)}, ${esc(m.nombre)}</option>`).join('')
    : '<option value="">No hay médicos para esta especialidad</option>';
  $('#sel-med').disabled = !meds.length;
};

$('#sel-med').onchange = () => {
  $('#sel-fecha').disabled = !$('#sel-med').value;
  cargarSlots();
};
$('#sel-fecha').onchange = cargarSlots;
$('#chk-prio').onchange = () => dispActual && pintarSlots();

function resetSlots() {
  horaSel = null;
  dispActual = null;
  $('#slots').innerHTML = '<span class="muted">Elegí médico y fecha para ver los horarios.</span>';
  $('#aviso').innerHTML = '';
  $('#btn-confirmar').disabled = true;
}

async function cargarSlots() {
  resetSlots();
  const med = $('#sel-med').value;
  const fecha = $('#sel-fecha').value;
  if (!med || !fecha) return;
  dispActual = await accion(() => api(`/horarios/disponibles?id_medico=${med}&fecha=${fecha}`));
  if (dispActual) pintarSlots();
}

function pintarSlots() {
  const prio = $('#chk-prio').checked;
  const d = dispActual;
  const puede = prio ? d.permitePrioridad : d.permiteNormal;
  let aviso = '';
  if (!d.atiende) aviso = `<div class="alert err">El médico no atiende ese día. Atiende: <b>${esc(d.diasAtencion.join(', ') || 'sin horarios cargados')}</b>.</div>`;
  else if (!d.libres) aviso = '<div class="alert err">No quedan horarios para este día. Probá otra fecha.</div>';
  else if (!puede) aviso = `<div class="alert warn">Los horarios restantes están reservados para pacientes de parajes o comunidades lejanas
      (se garantizan ${d.cuposPrioridadReservados + d.turnosPrioridad} turnos con prioridad por día).</div>`;
  else if (d.cuposPrioridadReservados > 0) aviso = `<div class="alert info">Quedan ${d.libres} horarios libres; ${d.cuposPrioridadReservados} están reservados para pacientes con prioridad.</div>`;
  $('#aviso').innerHTML = aviso;

  $('#slots').innerHTML = d.slots.map((s) =>
    `<button type="button" class="slot ${s.hora === horaSel ? 'sel' : ''}" data-hora="${s.hora}" ${!s.libre || !puede ? 'disabled' : ''}>${s.hora}</button>`).join('');
  $$('.slot').forEach((b) => (b.onclick = () => {
    horaSel = b.dataset.hora;
    $$('.slot').forEach((x) => x.classList.toggle('sel', x === b));
    $('#btn-confirmar').disabled = false;
  }));
  if (!puede) { horaSel = null; $('#btn-confirmar').disabled = true; }
}

$('#btn-confirmar').onclick = async () => {
  const body = {
    id_medico: Number($('#sel-med').value),
    id_especialidad: Number($('#sel-esp').value) || null,
    motivo: $('#motivo').value.trim(),
    fecha: $('#sel-fecha').value,
    hora: horaSel,
    prioridad_comunidad: $('#chk-prio').checked,
  };
  const ok = await accion(() => api('/turnos', { method: 'POST', body }), 'Turno solicitado. Queda pendiente de aprobación.');
  if (ok) {
    $('#motivo').value = '';
    cargarSlots();
    $('[data-sec="sec-turnos"]').click();
  } else {
    cargarSlots();
  }
};

// ------------------------------------------------------------ Mis turnos
async function cargarTurnos() {
  const turnos = await accion(() => api('/turnos'));
  if (!turnos) return;
  turnos.sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  $('#tabla-turnos').innerHTML = tabla(['Fecha', 'Hora', 'Médico', 'Motivo', 'Consultorio', 'Estado', ''], turnos.map((t) => `
    <tr><td><b>${fmtFecha(t.fecha)}</b></td><td>${t.hora}</td><td>${esc(t.medico)}<br><small class="muted">${esc(t.especialidad || '')}</small></td>
        <td><small>${esc(t.motivo || '-')}</small></td>
        <td>${t.consultorio ?? '<span class="muted">A asignar</span>'}</td>
        <td>${badgeEstado(t.estado)} ${badgePrio(t.prioridad_comunidad)}
          ${t.estado === 'Pendiente' && !t.tiene_control_verificado ? '<br><small class="muted">Acercate a enfermería para tu control de peso y talla</small>' : ''}</td>
        <td>${['Pendiente', 'Aprobado'].includes(t.estado) ? `<button class="btn sm danger" data-cancel="${t.id_turno}">Cancelar</button>` : ''}</td></tr>`),
  'Todavía no pediste turnos');
  $$('[data-cancel]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Seguro que querés cancelar el turno?')) return;
    if (await accion(() => api(`/turnos/${b.dataset.cancel}/cancelar`, { method: 'PATCH' }), 'Turno cancelado')) cargarTurnos();
  }));
}

// ------------------------------------------------------------ Mis controles
async function cargarControles() {
  const c = await accion(() => api('/control'));
  if (!c) return;
  $('#tabla-controles').innerHTML = tabla(['Fecha', 'Peso', 'Talla', 'IMC', 'Verificado'], c.map((x) => `
    <tr><td>${fmtFecha(x.fecha_control)}</td><td>${x.peso} kg</td><td>${x.talla} cm</td><td>${x.imc}</td>
        <td>${x.verificado ? '<span class="badge b-ok">Sí</span>' : '<span class="badge b-no">Pendiente</span>'}</td></tr>`),
  'Aún no tenés controles registrados');
}

// ------------------------------------------------------------ Perfil
async function cargarPerfil() {
  const p = await accion(() => api('/perfil'));
  if (!p) return;
  const f = $('#form-perfil');
  f.id_pais.innerHTML = await opcionesPaises(p.id_pais);
  for (const [k, v] of Object.entries(p)) if (f[k] && k !== 'id_pais') f[k].value = v ?? '';
}

$('#form-perfil').onsubmit = async (e) => {
  e.preventDefault();
  const { telefono, email, direccion, ciudad, id_pais, obra_social, numero_afiliado } = formData(e.target);
  await accion(() => api('/perfil', { method: 'PUT', body: { telefono, email, direccion, ciudad, id_pais, obra_social, numero_afiliado } }), 'Datos actualizados');
};
