# Catálogo de rutas

Base de la API: `http://localhost:3001` (en Render: la URL del servicio `turnero-api`).
Los parámetros `:id` se reemplazan por el número de registro. Todos los cuerpos de `POST`, `PUT` y `PATCH` son JSON.

**Acceso:** 🔓 público · 🔐 requiere token (`Authorization: Bearer <token>`) · entre paréntesis, los roles permitidos.

## Generales (`src/app.js`)

| Método | Ruta | Función | Archivo | Acceso |
|---|---|---|---|---|
| GET | `/` | Estado de la API y lista de rutas | `app.js` | 🔓 |
| GET | `/health` | Prueba la conexión con PostgreSQL | `app.js` | 🔓 |

## Autenticación

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| POST | `/auth/login` | `login` | `auth.js` | 🔓 |
| POST | `/auth/registro-paciente` | `registroPaciente` | `auth.js` | 🔓 |
| GET | `/auth/me` | `yo` | `auth.js` | 🔐 |

## Médicos

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| GET | `/medicos?especialidad=` | `listar` | `medicos.js` | 🔓 |
| POST | `/medicos/login` | `login` | `medicos.js` | 🔓 |
| GET | `/medicos/:id` | `obtener` | `medicos.js` | 🔓 |
| GET | `/medicos/:id/turnos?fecha=&estado=` | `turnos` | `medicos.js` | 🔐 (médico, enfermero, admin) |
| GET | `/medicos/:id/pacientes/:idPaciente` | `fichaPaciente` | `medicos.js` | 🔐 (médico, admin) |
| POST | `/medicos/:id/especialidades` | `agregarEspecialidad` | `medicos.js` | 🔐 (admin) |
| DELETE | `/medicos/:id/especialidades/:idEspecialidad` | `quitarEspecialidad` | `medicos.js` | 🔐 (admin) |

## Turnos

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| GET | `/turnos?fecha=&estado=&id_medico=&id_paciente=` | `listar` | `turnos.js` | 🔐 (cada rol ve lo suyo) |
| GET | `/turnos/prioridad` | `prioridad` | `turnos.js` | 🔐 (admin) |
| POST | `/turnos` | `crear` | `turnos.js` | 🔐 (paciente) |
| PATCH | `/turnos/:id/aprobar` | `aprobar` | `turnos.js` | 🔐 (enfermero) |
| PATCH | `/turnos/:id/cancelar` | `cancelar` | `turnos.js` | 🔐 (paciente, enfermero, admin) |
| PATCH | `/turnos/:id/atender` | `atender` | `turnos.js` | 🔐 (médico) |

## Controles de peso y talla

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| GET | `/control?id_paciente=` | `listar` | `control.js` | 🔐 (según el rol) |
| POST | `/control` | `crear` | `control.js` | 🔐 (enfermero) |
| PATCH | `/control/:id/verificar` | `verificar` | `control.js` | 🔐 (enfermero) |

## Horarios de atención

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| GET | `/horarios?id_medico=` | `listar` | `horarios.js` | 🔓 |
| GET | `/horarios/disponibles?id_medico=&fecha=` | `disponibles` | `horarios.js` | 🔐 |
| POST | `/horarios` | `crear` | `horarios.js` | 🔐 (admin) |
| DELETE | `/horarios/:id` | `eliminar` | `horarios.js` | 🔐 (admin) |

## Catálogos

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| GET | `/paises` | `listar` | `paises.js` | 🔓 |
| POST | `/paises` | `crear` | `paises.js` | 🔐 (admin) |
| DELETE | `/paises/:id` | `eliminar` | `paises.js` | 🔐 (admin) |
| GET | `/especialidades` | `listar` | `especialidades.js` | 🔓 |
| POST | `/especialidades` | `crear` | `especialidades.js` | 🔐 (admin) |
| DELETE | `/especialidades/:id` | `eliminar` | `especialidades.js` | 🔐 (admin) |
| GET | `/consultorios` | `listar` | `consultorios.js` | 🔐 |
| POST | `/consultorios` | `crear` | `consultorios.js` | 🔐 (admin) |
| DELETE | `/consultorios/:id` | `eliminar` | `consultorios.js` | 🔐 (admin) |

## Personas, usuarios y perfil

| Método | Ruta | Función | Archivo de rutas | Acceso |
|---|---|---|---|---|
| GET | `/personas?q=&rol=` | `listar` | `personas.js` | 🔐 (admin; enfermero solo pacientes) |
| POST | `/personas` | `crear` | `personas.js` | 🔐 (admin) |
| PUT | `/personas/:id` | `editar` | `personas.js` | 🔐 (admin) |
| PUT | `/personas/:id/roles` | `cambiarRoles` | `personas.js` | 🔐 (admin) |
| GET | `/usuarios/roles` | `roles` | `usuarios.js` | 🔐 (admin) |
| PATCH | `/usuarios/:id/estado` | `cambiarEstado` | `usuarios.js` | 🔐 (admin) |
| PATCH | `/usuarios/:id/contrasena` | `cambiarContrasena` | `usuarios.js` | 🔐 (admin) |
| GET | `/perfil` | `obtener` | `perfil.js` | 🔐 |
| PUT | `/perfil` | `editar` | `perfil.js` | 🔐 |
| GET | `/estadisticas/resumen` | `resumen` | `estadisticas.js` | 🔐 (admin) |

**Total: 44 rutas** (2 generales + 42 en los 12 archivos de `src/routes/`).

## Ejemplos de cuerpos JSON

```json
// POST /auth/login
{ "usuario": "juan", "contraseña": "paciente123", "rol": "paciente" }

// POST /turnos
{ "id_medico": 3, "id_especialidad": 1, "fecha": "2026-12-01", "hora": "10:00",
  "motivo": "Dolor de cabeza", "prioridad_comunidad": false }

// PATCH /turnos/:id/aprobar
{ "id_consultorio": 1 }

// POST /control
{ "id_paciente": 7, "peso": 68.5, "talla": 165, "fecha_control": "2026-11-18" }
```

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 / 201 | Correcto / registro creado |
| 400 | Dato inválido o regla no cumplida |
| 401 | Sin token o token vencido |
| 403 | El rol no tiene permiso |
| 404 | Ruta o registro inexistente |
| 409 | Duplicado u horario ya tomado |
| 503 | No hay conexión con PostgreSQL |
| 500 | Error inesperado |

Los ejemplos para ejecutar están en `API/api.http` (extensión REST Client de VS Code).
