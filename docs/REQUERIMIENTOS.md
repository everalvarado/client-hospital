# Especificación de requerimientos

## Problema

Los pacientes, sobre todo los de parajes y comunidades lejanas, pierden tiempo para conseguir un turno, y el hospital no tiene registro de los controles de peso y talla previos a la consulta.

## Solución

Un turnero web donde el paciente pide su turno, la enfermera registra y verifica el control de peso y talla y aprueba el turno, el médico atiende y el administrador gestiona todo.

## Actores

| Rol | Descripción |
|---|---|
| Administrador | Gestiona personas, usuarios, médicos, horarios, consultorios y catálogos |
| Enfermero | Registra controles de peso y talla y aprueba turnos |
| Médico | Atiende los turnos de su agenda |
| Paciente | Pide y cancela turnos y consulta sus controles |

## Requerimientos funcionales

| Código | Rol | Requerimiento |
|---|---|---|
| RF-01 | Todos | Iniciar sesión eligiendo el rol con usuario y contraseña |
| RF-02 | Paciente | Registrarse desde la pantalla de login |
| RF-03 | Paciente | Pedir un turno eligiendo especialidad, médico, fecha y horario libre, con motivo y prioridad por paraje |
| RF-04 | Paciente | Ver y cancelar sus turnos, ver sus controles y editar sus datos |
| RF-05 | Enfermero | Buscar pacientes, registrar controles de peso y talla y verificarlos |
| RF-06 | Enfermero | Aprobar turnos asignando consultorio, o cancelarlos |
| RF-07 | Médico | Ver su agenda del día y todos sus turnos |
| RF-08 | Médico | Ver la ficha del paciente y marcar el turno como atendido |
| RF-09 | Médico | Ver sus horarios de atención |
| RF-10 | Admin | Ver el resumen y el control de la regla de prioridad (14 días) |
| RF-11 | Admin | Alta de personas con usuario y roles; activar, desactivar y cambiar contraseñas |
| RF-12 | Admin | Gestionar especialidades, horarios, consultorios y países |
| RF-13 | Admin | Ver todos los turnos con filtros y cancelarlos |

## Reglas de negocio

| Código | Regla | Dónde se cumple |
|---|---|---|
| **RN-01** | La enfermera solo aprueba si existe un PESO_TALLA **verificado** | Trigger de PostgreSQL + botón desactivado |
| **RN-02** | Al menos **2 turnos por día** con `prioridad_comunidad = TRUE` | `utils/agenda.js` reserva 2 lugares por médico y día |
| **RN-03** | El turno se asocia al control verificado **más reciente** | El trigger completa `id_control` |
| RN-04 | Un médico no tiene dos turnos activos a la misma hora | Índice único parcial + validación |
| RN-05 | Solo se ofrecen horarios dentro de la agenda del médico | `horario_medico` + `agenda.js` |
| RN-06 | Un paciente no saca dos turnos con el mismo médico el mismo día | `turnoController.crear` |

## Requerimientos no funcionales

| Código | Requerimiento |
|---|---|
| RNF-01 | **Seguridad:** bcrypt, JWT (8 h) y permisos por rol en cada ruta |
| RNF-02 | **Integridad:** claves foráneas, índices únicos y trigger |
| RNF-03 | **Usabilidad:** interfaz por rol y mensajes claros |
| RNF-04 | **Responsive:** se adapta al celular |
| RNF-05 | **Disponibilidad:** publicado en Render |
| RNF-06 | **Mantenibilidad:** capas separadas, un modelo por tabla, configuración en `.env` |

## Alcance (MVP) y extras

| MVP pedido | Extras que agregamos |
|---|---|
| Login con 4 roles | Registro de pacientes |
| Interfaz por rol | Horarios de atención por médico |
| 9 tablas del diagrama | Tablas `pais` y `horario_medico` |
| 3 reglas del sistema | Cupos reservados automáticos, ficha con IMC |
| Conexión front – back – base | Despliegue en Render |
