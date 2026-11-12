const user = guard('medico');
$('#f-agenda').value = hoyISO();

initLayout(user, (sec) => ({ 'sec-agenda': cargarAgenda, 'sec-proximos': cargarTurnos, 'sec-horarios': cargarHorarios }[sec]?.()));

api(`/medicos/${user.id_persona}`)
  .then((m) => { $('#mis-esp').innerHTML = m.especialidades.map((e) => `<span class="chip" style="background:#ffffff30;color:#fff">${esc(e.nombre)}</span>`).join(''); })
  .catch(() => {});

function moverDia(delta) {
  const [y, m, d] = $('#f-agenda').value.split('-').map(Number);
  const f = new Date(y, m - 1, d + delta);
  $('#f-agenda').value = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  cargarAgenda();
}
$('#dia-ant').onclick = () => moverDia(-1);
$('#dia-sig').onclick = () => moverDia(1);
$('#f-agenda').onchange = cargarAgenda;

// ------------------------------------------------------------ Agenda del día
async function cargarAgenda() {
  const fecha = $('#f-agenda').value;
  $('#fecha-larga').textContent = fmtFechaLarga(fecha);
  const turnos = await accion(() => api(`/medicos/${user.id_persona}/turnos?fecha=${fecha}`));
  if (!turnos) return;

  const aprobados = turnos.filter((t) => t.estado === 'Aprobado');
  const atendidos = turnos.filter((t) => t.estado === 'Atendido');
  const pendientes = turnos.filter((t) => t.estado === 'Pendiente');
  $('#stats-dia').innerHTML = [['Por atender', aprobados.length], ['Atendidos', atendidos.length], ['Pendientes de enfermería', pendientes.length]]
    .map(([l, n]) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('');

  const lista = [...aprobados, ...atendidos].sort((a, b) => a.hora.localeCompare(b.hora));
  $('#agenda').innerHTML = lista.length ? lista.map((t) => `
    <div class="agenda-item">
      <div class="h">${t.hora}</div>
      <div>
        <b>${esc(t.paciente)}</b> ${badgeEstado(t.estado)} ${badgePrio(t.prioridad_comunidad)}<br>
        ${t.motivo ? `<small>Motivo: ${esc(t.motivo)}</small><br>` : ''}
        <small class="muted">DNI ${esc(t.dni_paciente)} · Consultorio ${t.consultorio ?? '-'}
          ${t.peso ? ` · Último control: ${t.peso} kg / ${t.talla} cm (${fmtFecha(t.fecha_control)})` : ''}</small>
      </div>
      <div class="acts">
        <button class="btn sm sec" data-ficha="${t.id_paciente}">Ficha</button>
        ${t.estado === 'Aprobado' ? `<button class="btn sm" data-atender="${t.id_turno}">Marcar atendido</button>` : ''}
      </div>
    </div>`).join('') : '<div class="empty">No hay turnos aprobados para este día</div>';
  enganchar(cargarAgenda);
}

// ------------------------------------------------------------ Todos mis turnos
$('#f-estado').onchange = cargarTurnos;
async function cargarTurnos() {
  const est = $('#f-estado').value;
  const turnos = await accion(() => api(`/medicos/${user.id_persona}/turnos${est ? '?estado=' + est : ''}`));
  if (!turnos) return;
  $('#tabla-turnos').innerHTML = tabla(['Fecha', 'Hora', 'Paciente', 'Consultorio', 'Estado', ''], turnos.map((t) => `
    <tr><td>${fmtFecha(t.fecha)}</td><td>${t.hora}</td>
        <td>${esc(t.paciente)} ${badgePrio(t.prioridad_comunidad)}<br><small class="muted">${esc(t.motivo || '')}</small></td><td>${t.consultorio ?? '-'}</td>
        <td>${badgeEstado(t.estado)}</td>
        <td><div class="acts"><button class="btn sm sec" data-ficha="${t.id_paciente}">Ficha</button>
          ${t.estado === 'Aprobado' ? `<button class="btn sm" data-atender="${t.id_turno}">Atendido</button>` : ''}</div></td></tr>`));
  enganchar(cargarTurnos);
}

function enganchar(recargar) {
  $$('[data-ficha]').forEach((b) => (b.onclick = () => verFicha(b.dataset.ficha)));
  $$('[data-atender]').forEach((b) => (b.onclick = async () => {
    if (await accion(() => api(`/turnos/${b.dataset.atender}/atender`, { method: 'PATCH' }), 'Turno marcado como atendido')) recargar();
  }));
}

// ------------------------------------------------------------ Ficha del paciente
async function verFicha(idPaciente) {
  const f = await accion(() => api(`/medicos/${user.id_persona}/pacientes/${idPaciente}`));
  if (!f) return;
  const p = f.paciente;
  modal(`${p.nombre} ${p.apellido}`, `
    <div class="grid g2" style="margin-bottom:1rem">
      <div><label>DNI</label>${esc(p.dni)}</div>
      <div><label>Nacimiento</label>${fmtFecha(p.fecha_nacimiento)}</div>
      <div><label>Teléfono</label>${esc(p.telefono || '-')}</div>
      <div><label>Dirección</label>${esc(p.direccion || '-')}</div>
      <div><label>Ciudad / país</label>${esc([p.ciudad, p.pais?.nombre].filter(Boolean).join(', ') || '-')}</div>
      <div><label>Obra social</label>${esc(p.obra_social || '-')}${p.numero_afiliado ? ' · N° ' + esc(p.numero_afiliado) : ''}</div>
    </div>
    <h3>Controles de peso y talla</h3>
    ${tabla(['Fecha', 'Peso', 'Talla', 'IMC', 'Verificado'], f.controles.map((c) => `
      <tr><td>${fmtFecha(c.fecha_control)}</td><td>${c.peso} kg</td><td>${c.talla} cm</td><td>${c.imc}</td>
          <td>${c.verificado ? '<span class="badge b-ok">Sí</span>' : '<span class="badge b-no">No</span>'}</td></tr>`), 'Sin controles')}
    <h3 style="margin-top:1rem">Turnos conmigo</h3>
    ${tabla(['Fecha', 'Hora', 'Motivo', 'Estado'], f.turnos.map((t) => `<tr><td>${fmtFecha(t.fecha)}</td><td>${t.hora}</td><td><small>${esc(t.motivo || '-')}</small></td><td>${badgeEstado(t.estado)}</td></tr>`))}
  `);
}

// ------------------------------------------------------------ Mis horarios
async function cargarHorarios() {
  const m = await accion(() => api(`/medicos/${user.id_persona}`));
  if (!m) return;
  $('#tabla-horarios').innerHTML = tabla(['Día', 'Horario', 'Turnos de', 'Consultorio'], (m.horarios || []).map((h) => `
    <tr><td><b>${esc(h.dia)}</b></td><td>${h.hora_inicio} a ${h.hora_fin}</td><td>${h.duracion_minutos} min</td><td>${h.consultorio ?? '-'}</td></tr>`),
  'Todavía no tenés horarios cargados. Pedile al administrador que los agregue.');
}
