# Registro de cambios

Formato: versión · qué se agregó, cambió o corrigió.

## v3.1 — Validación de datos

**Agregado**
- `CLIENT/public/js/validaciones.js`: valida todos los formularios automáticamente.
  - Filtra mientras se escribe: el **DNI** solo acepta números (máx. 8), el teléfono solo números y `+ ( ) -`, nombre y apellido solo letras, el usuario sin espacios.
  - El **email** tiene que tener un `@` y un dominio (`nombre@mail.com`).
  - Muestra el error en rojo debajo de cada campo y no deja enviar el formulario.
  - En los campos numéricos no se pueden escribir `e`, `+` ni `-`.
  - La fecha de nacimiento y la del control no pueden ser futuras.
  - En horarios, la hora de fin tiene que ser posterior a la de inicio.
- `API/src/utils/validaciones.js`: las mismas reglas en la API, para que no se puedan saltear desde Postman.
- Validaciones en los modelos `Persona` (DNI y email) y `Usuario` (nombre de usuario).

**Corregido**
- La API aceptaba un peso o una talla con texto (`"abc"`).
- `PUT /personas/:id` y `PUT /perfil` guardaban cualquier dato sin validar.
- Se podía cargar un consultorio con número negativo, una especialidad con números o un horario más corto que un turno.
- La contraseña ahora debe tener al menos una letra y un número (el login de usuarios existentes no cambia).

## v3.0 — Unión con la API de referencia (versión final)

**Agregado**
- Tablas `pais` y `horario_medico`.
- Campos nuevos en `persona`: sexo, ciudad, id_pais, obra_social, numero_afiliado, matricula.
- Campos nuevos en `turno`: motivo e id_especialidad.
- Rutas `/paises`, `/horarios`, `/horarios/disponibles`, `/medicos/login`, `/medicos/:id/turnos`.
- Médicos `med003`, `med004` y `med005` con matrícula y horarios.
- `utils/agenda.js`: horarios libres según la agenda del médico y 2 cupos reservados con prioridad.
- Bloqueo por médico y día al pedir un turno, para que dos pacientes no tomen el mismo horario.
- Índice único parcial `ux_turno_medico_fecha_hora`.
- `npm run db:reset`.
- Configuración de VS Code (`.vscode/`) para iniciar API y CLIENT juntos.

**Cambiado**
- Puerto 3000 → **3001**. Base `turnero_hospital` → **hospital_db**.
- Nombres de rutas adaptados a los de la API de referencia (`/auth`, `/turnos`, `/control`…).
- Creación de tablas con `sequelize.sync()` + seeder al arrancar (antes era un script SQL aparte).
- Express 4 → **Express 5**. Se agregaron morgan y nodemon.
- `sync({ alter: true })` → `sync()`, porque `alter` duplicaba los índices en cada reinicio.

**Corregido**
- El login acepta `contraseña` y `contrasena`. Si una contraseña estaba sin encriptar, la encripta al entrar.
- Mensajes claros cuando PostgreSQL está apagado o la contraseña del `.env` es incorrecta (503).

**Eliminado**
- Scripts `1-INSTALAR.bat`, `2-INICIAR.bat`, `instalar.sh` e `iniciar.sh`. Ahora se usa `npm run dev` o VS Code.

## v2.0 — Backend con Sequelize

**Agregado**
- Estructura del profesor: `config / models / controllers / routes / app.js`.
- Un modelo por tabla y `models/index.js` con todas las relaciones.
- Autenticación con JWT y permisos por rol.
- Trigger de PostgreSQL para las Reglas 1 y 3.
- `render.yaml` para la API y para el CLIENT.

**Cambiado**
- El frontend pasó a Vite y lee la URL de la API desde `VITE_API_URL`.

## v1.1 — Corrección del login

**Corregido**
- No se podía iniciar sesión con los usuarios de prueba.

**Agregado**
- Autorrelleno de usuario y contraseña al elegir el rol (modo demo).

## v1.0 — Primera versión

**Agregado**
- Pantalla de login con 4 roles.
- Una interfaz distinta para cada rol.
- Base de datos con las 9 tablas del diagrama.
