const user = guard('enfermero');
let CONSULTORIOS = [];
let pacienteSel = null;

$('#fecha_control').value = hoyISO();
$('#f-dia').value = hoyISO();

initLayout(user, (sec) => {
  if (sec === 'sec-pendientes') cargarPendientes();
  if (sec === 'sec-controles') { buscarPacientes(); cargarControles(); }
  if (sec === 'sec-dia') cargarDia();
});

// ------------------------------------------------------------ Pendientes
async function cargarPendientes() {
  if (!CONSULTORIOS.length) CONSULTORIOS = (await accion(() => api('/consultorios'))) || [];
  const turnos = await accion(() => api('/turnos?estado=Pendiente'));
  if (!turnos) return;
  $('#tabla-pendientes').innerHTML = tabla(['Fecha', 'Paciente', 'Médico', 'Peso/Talla', 'Consultorio', 'Acciones'], turnos.map((t) => `
    <tr>
      <td><b>${fmtFecha(t.fecha)}</b> ${t.hora}<br>${badgePrio(t.prioridad_comunidad)}</td>
      <td>${esc(t.paciente)}<br><small class="muted">DNI ${esc(t.dni_paciente)}</small></td>
      <td>${esc(t.medico)}<br><small class="muted">${esc(t.especialidad || '')}${t.motivo ? ' · ' + esc(t.motivo) : ''}</small></td>
      <td>${t.tiene_control_verificado ? '<span class="badge b-ok">Control verificado</span>'
        : `<span class="badge b-warn">Sin control verificado</span><br><a href="#" data-ir-control="${t.id_paciente}" data-nombre="${esc(t.paciente)}">Registrar control</a>`}</td>
      <td><select data-cons="${t.id_turno}" ${t.tiene_control_verificado ? '' : 'disabled'}>
            <option value="">Elegir…</option>
            ${CONSULTORIOS.map((c) => `<option value="${c.id_consultorio}">${c.numero} · ${esc(c.descripcion || '')}</option>`).join('')}
          </select></td>
      <td><div class="acts">
        <button class="btn sm ok" data-aprobar="${t.id_turno}" ${t.tiene_control_verificado ? '' : 'disabled title="Requiere control verificado"'}>Aprobar</button>
        <button class="btn sm danger" data-cancel="${t.id_turno}">Cancelar</button>
      </div></td>
    </tr>`), 'No hay turnos pendientes 🎉');

  $$('[data-aprobar]').forEach((b) => (b.onclick = async () => {
    const id_consultorio = $(`[data-cons="${b.dataset.aprobar}"]`).value;
    if (!id_consultorio) return toast('Elegí un consultorio', 'err');
    if (await accion(() => api(`/turnos/${b.dataset.aprobar}/aprobar`, { method: 'PATCH', body: { id_consultorio } }), 'Turno aprobado')) cargarPendientes();
  }));
  $$('[data-cancel]').forEach((b) => (b.onclick = async () => {
    if (!confirm('¿Cancelar este turno?')) return;
    if (await accion(() => api(`/turnos/${b.dataset.cancel}/cancelar`, { method: 'PATCH' }), 'Turno cancelado')) cargarPendientes();
  }));
  $$('[data-ir-control]').forEach((a) => (a.onclick = (e) => {
    e.preventDefault();
    pacienteSel = { id_persona: Number(a.dataset.irControl), nombre: a.dataset.nombre, apellido: '' };
    $('[data-sec="sec-controles"]').click();
    seleccionarPaciente(pacienteSel);
  }));
}

// ------------------------------------------------------------ Controles
let timer;
$('#buscar-pac').oninput = () => { clearTimeout(timer); timer = setTimeout(buscarPacientes, 300); };

async function buscarPacientes() {
  const q = $('#buscar-pac').value.trim();
  const pacs = await accion(() => api(`/personas?rol=Paciente${q ? '&q=' + encodeURIComponent(q) : ''}`));
  if (!pacs) return;
  $('#lista-pac').innerHTML = tabla(['Paciente', 'Controles', ''], pacs.map((p) => `
    <tr><td><b>${esc(p.apellido)}, ${esc(p.nombre)}</b><br><small class="muted">DNI ${esc(p.dni)} · ${esc(p.direccion || '')}</small></td>
        <td>${p.controles}</td>
        <td style="text-align:right"><button class="btn sm sec" data-sel="${p.id_persona}">Seleccionar</button></td></tr>`), 'Sin resultados');
  $$('[data-sel]').forEach((b) => (b.onclick = () => seleccionarPaciente(pacs.find((p) => p.id_persona == b.dataset.sel))));
}

function seleccionarPaciente(p) {
  pacienteSel = p;
  $('#id_paciente').value = p.id_persona;
  $('#pac-sel').innerHTML = `Paciente: <b>${esc(p.nombre)} ${esc(p.apellido)}</b>`;
  $('#btn-control').disabled = false;
  $('#titulo-controles').textContent = `Historial de ${p.nombre} ${p.apellido}`.trim();
  cargarControles();
}

async function cargarControles() {
  const q = pacienteSel ? `?id_paciente=${pacienteSel.id_persona}` : '';
  const ctrls = await accion(() => api(`/control${q}`));
  if (!ctrls) return;
  $('#tabla-controles').innerHTML = tabla(['Fecha', 'Paciente', 'Peso', 'Talla', 'IMC', 'Registró', 'Verificado'], ctrls.map((c) => `
    <tr><td>${fmtFecha(c.fecha_control)}</td><td>${esc(c.paciente)}</td><td>${c.peso} kg</td><td>${c.talla} cm</td><td>${c.imc}</td>
        <td><small>${esc(c.enfermera)}</small></td>
        <td>${c.verificado ? '<span class="badge b-ok">Sí</span>' : `<button class="btn sm ok" data-verif="${c.id_control}">Verificar</button>`}</td></tr>`));
  $$('[data-verif]').forEach((b) => (b.onclick = async () => {
    if (await accion(() => api(`/control/${b.dataset.verif}/verificar`, { method: 'PATCH' }), 'Control verificado')) cargarControles();
  }));
}

$('#form-control').onsubmit = async (e) => {
  e.preventDefault();
  if (!pacienteSel) return toast('Seleccioná un paciente', 'err');
  const d = formData(e.target);
  const body = {
    id_paciente: Number(d.id_paciente),
    fecha_control: d.fecha_control,
    peso: Number(d.peso),
    talla: Number(d.talla),
    verificado: e.target.verificado.checked,
  };
  if (await accion(() => api('/control', { method: 'POST', body }), 'Control registrado')) {
    e.target.peso.value = '';
    e.target.talla.value = '';
    cargarControles();
    buscarPacientes();
  }
};

// ------------------------------------------------------------ Día
$('#f-dia').onchange = cargarDia;
async function cargarDia() {
  const turnos = await accion(() => api(`/turnos?fecha=${$('#f-dia').value}`));
  if (!turnos) return;
  $('#tabla-dia').innerHTML = tabla(['Hora', 'Paciente', 'Médico', 'Consultorio', 'Estado'], turnos.map((t) => `
    <tr><td><b>${t.hora}</b></td><td>${esc(t.paciente)} ${badgePrio(t.prioridad_comunidad)}</td>
        <td>${esc(t.medico)}</td><td>${t.consultorio ?? '-'}</td><td>${badgeEstado(t.estado)}</td></tr>`), 'No hay turnos para esta fecha');
}
