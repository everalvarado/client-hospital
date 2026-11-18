# Sistema Hospitalario de Turnos

Sistema web para pedir y gestionar turnos médicos en un hospital. Tiene **4 roles** (Administrador, Enfermero, Médico y Paciente), **lugar asegurado para pacientes de parajes y comunidades lejanas** y **control de peso y talla obligatorio** antes de aprobar cada turno.

Es la unión de dos proyectos:

- **Base:** la *API Hospitalaria* original. Conserva su `app.js` y `config`, Express 5, morgan, nodemon, `sequelize.sync()` con el seeder `seedInicial`, el **puerto 3001**, la base **hospital_db**, las rutas `/auth`, `/medicos`, `/turnos`, `/control`, `/paises`, `/horarios` y los usuarios `admin` y `med001`…`med005`.
- **Agregado:** el turnero armado con el diagrama de tablas. Suma los **4 roles**, una **pantalla para cada rol** y las **reglas del sistema**.

Son **dos proyectos, cada uno con su propio servidor**:

| Carpeta | Qué es | Tecnología | Puerto |
|---------|--------|------------|--------|
| **API/** | Backend: guarda los datos y aplica las reglas | Node.js + Express 5 + Sequelize + PostgreSQL | 3001 |
| **CLIENT/** | Frontend: las pantallas que ve el usuario | HTML + CSS + JavaScript con Vite | 5173 |

---

## 1. Qué hace cada rol

| Rol | Qué puede hacer |
|-----|-----------------|
| **Paciente** | Se registra, pide turnos (eligiendo especialidad, médico, día y horario), los sigue y los cancela. También ve sus controles y edita sus datos. |
| **Enfermero** | Registra y verifica el peso y la talla de los pacientes. Aprueba los turnos pendientes asignando un consultorio, o los cancela. |
| **Médico** | Ve su agenda del día y la ficha del paciente (datos, obra social, controles con IMC) y marca los turnos como atendidos. |
| **Administrador** | Gestiona personas, roles, especialidades, horarios de los médicos, consultorios y países. Ve todos los turnos y controla que se cumplan las reglas. |

**El recorrido de un turno:** el paciente lo pide (*Pendiente*) → la enfermera controla el peso y la talla y lo aprueba (*Aprobado*) → el médico lo atiende (*Atendido*). Mientras está pendiente o aprobado, se puede cancelar.

---

## 2. Correrlo en tu computadora

**Necesitás instalados:** [Node.js](https://nodejs.org) y [PostgreSQL](https://www.postgresql.org/download/), que trae pgAdmin.

### Paso previo
En `API/.env`, revisá que `DB_PASSWORD` sea la contraseña de tu PostgreSQL. Viene con la del proyecto original.

### Opción A: con la terminal
Abrí **dos terminales**, una para cada proyecto:

```bash
# Terminal 1: API
cd API
npm install          # solo la primera vez
npm run dev          # http://localhost:3001
```

```bash
# Terminal 2: CLIENT
cd CLIENT
npm install          # solo la primera vez
npm run dev          # se abre solo en http://localhost:5173
```

Dejá las dos terminales abiertas mientras usás el sistema. Para apagarlo, apretá **Ctrl + C** en cada una.

### Opción B: desde VS Code
*Archivo → Abrir carpeta…* → en *Ejecutar y depurar* elegí **"▶ Iniciar todo (API + CLIENT)"** → **F5**. Arranca los dos proyectos a la vez.

### Qué pasa la primera vez
La API hace todo esto sola, no hay que ejecutar nada en pgAdmin:
- crea la base `hospital_db` (si no existe),
- crea las tablas a partir de los modelos (`sequelize.sync()`),
- carga los datos iniciales y la regla de aprobación (`seedInicial`).

En la consola vas a ver: `Conectado a PostgreSQL` → `Tablas sincronizadas` → `Servidor escuchando en puerto 3001`.

Las tablas se ven en pgAdmin, en *hospital_db → Schemas → public → Tables*.

**Volver a empezar con datos limpios:** `npm run db:reset` en la carpeta `API`. Borra las tablas, las crea de nuevo y vuelve a cargar los datos iniciales. Conviene hacerlo antes de una demo.

### Usuarios iniciales

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Médicos | `med001` … `med005` | `med123` |
| Enfermera | `enfermera` | `enfermera123` |
| Pacientes | `juan` / `sofia` | `paciente123` |

`juan` vive en un paraje y ya tiene sus controles verificados. `sofia` tiene un control **sin verificar**, para mostrar la regla de la enfermera.

En el login, al elegir un rol se completan solos el usuario y la contraseña de prueba (modo demo). Para desactivarlo, cambiá `MODO_DEMO` a `false` en `CLIENT/public/js/config.js`.

---

## 3. Cómo está armado

### Arquitectura
Arquitectura **cliente-servidor en capas**:

```
Navegador ─► CLIENT (páginas + js/api.js) ─► API (rutas → middlewares → controladores → modelos) ─► PostgreSQL
                         HTTP + JSON con token JWT                          Sequelize
```

### Carpetas principales

```
API/src/
├── app.js           ← arranca el servidor y registra las rutas
├── config/          ← conexión con PostgreSQL (lee el .env)
├── models/          ← un modelo por tabla + index.js con TODAS las relaciones
├── controllers/     ← la lógica de cada ruta
├── routes/          ← auth, medicos, turnos, control, paises, horarios…
├── middlewares/     ← controla el token, el rol y los errores
├── utils/           ← agenda: horarios libres y cupos con prioridad
└── database/        ← crea la base, la reinicia y carga los datos (seeder)

CLIENT/
├── index.html       ← login con los 4 roles
├── admin.html · enfermero.html · medico.html · paciente.html
└── public/js/       ← api.js (conexión con la API), config.js y un archivo por pantalla
```

### Tecnologías

| Tecnología | Para qué |
|------------|----------|
| **Node.js + Express 5** | La API REST |
| **PostgreSQL** | La base de datos (claves foráneas, índices y trigger) |
| **Sequelize** | ORM: un modelo por tabla y las relaciones en un solo archivo |
| **JWT + bcryptjs** | Inicio de sesión con token y contraseñas encriptadas |
| **dotenv** | Contraseñas y claves fuera del código (`.env`) |
| **morgan + nodemon** | Ver cada pedido en la consola y reiniciar al guardar |
| **Vite** | Servidor del frontend |
| **GitHub + Render** | Guardar el código y publicar el sistema |

---

## 4. Base de datos

Son **11 tablas**: las 9 del diagrama original más 2 nuevas.

| Tabla | Qué guarda |
|-------|-----------|
| `persona` | Datos de todas las personas (pacientes, médicos, enfermeros y administradores) |
| `usuario` | Usuario y contraseña encriptada |
| `rol` · `persona_rol` | Los roles y qué roles tiene cada persona (puede tener más de uno) |
| `especialidad` · `medico_especialidad` | Las especialidades y cuáles tiene cada médico |
| `consultorio` | Consultorios disponibles |
| `peso_talla` | Controles de peso y talla, y si están verificados |
| `turno` | Turnos con su estado, prioridad, motivo y control asociado |
| `pais` ⭐ | *Nueva:* país de cada persona |
| `horario_medico` ⭐ | *Nueva:* días y horas en que atiende cada médico |

**Mejoras sobre el diagrama:**
- tablas nuevas **PAIS** y **HORARIO_MEDICO**: cada médico tiene sus días y horarios, y los turnos que se ofrecen salen de ahí;
- **PERSONA** suma sexo, ciudad, país, obra social, número de afiliado y matrícula del médico;
- **TURNO** suma el motivo de la consulta y la especialidad.

Todas las personas están en **una sola tabla** y los roles van aparte, en `persona_rol`. Así no se repiten datos y una persona puede tener más de un rol.

---

## 5. Rutas de la API

Son las mismas del proyecto original, más las que necesitan los paneles. Las rutas privadas necesitan el token que devuelve el login, enviado en el header `Authorization: Bearer <token>`.

| Ruta | Quién | Qué hace |
|------|-------|----------|
| `POST /auth/login` | Público | Iniciar sesión → devuelve el token |
| `POST /auth/registro-paciente` | Público | Registrar un paciente |
| `GET /medicos` | Público | Médicos con sus especialidades |
| `POST /medicos/login` | Público | Login de médicos |
| `GET /medicos/:id/turnos` | Médico, enfermero, admin | Agenda del médico |
| `GET /turnos` | Logueado | Turnos (paciente y médico ven solo los suyos) |
| `POST /turnos` | Paciente | Pedir turno |
| `PATCH /turnos/:id/aprobar` | Enfermero | Aprobar asignando consultorio |
| `PATCH /turnos/:id/cancelar` | Paciente, enfermero, admin | Cancelar |
| `PATCH /turnos/:id/atender` | Médico | Marcar como atendido |
| `GET` · `POST /control` | Logueado · Enfermero | Controles de peso y talla |
| `PATCH /control/:id/verificar` | Enfermero | Verificar un control |
| `GET /paises` | Público | Lista de países |
| `GET /horarios` | Público | Horarios de atención de los médicos |
| `GET /horarios/disponibles` | Logueado | Horarios libres de un médico en una fecha |

La lista completa con ejemplos está en `API/README.md` y en `API/api.http`, que se prueba con la extensión REST Client de VS Code o con Postman.

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{ "usuario": "admin", "contraseña": "admin123" }
```

**Códigos de respuesta:**

| Código | Significado |
|--------|-------------|
| 200 / 201 | OK / creado |
| 400 | Dato inválido o regla no cumplida |
| 401 | Sin sesión |
| 403 | Sin permiso para ese rol |
| 409 | Duplicado u horario ya tomado |
| 503 | La base no responde |

---

## 6. Reglas del sistema

| Regla | Cómo se cumple |
|-------|----------------|
| La enfermera solo aprueba un turno si el paciente tiene un control de peso y talla **verificado**. | Un trigger en PostgreSQL, que crea `seedInicial`, rechaza la aprobación. Además, el botón *Aprobar* aparece desactivado. |
| El turno se asocia al control verificado **más reciente**. | El mismo trigger completa `id_control` al aprobar. |
| Siempre hay al menos **2 turnos por día con prioridad** para parajes o comunidades lejanas. | La API reserva 2 horarios por médico y por día (`utils/agenda.js`). El administrador ve qué días cumplen la regla. |
| Un médico no puede tener dos turnos a la misma hora. | Índice único en el modelo `Turno` + transacción con bloqueo al pedir el turno. |
| Solo se ofrecen horarios en los que el médico atiende. | Tabla `horario_medico`. Si el día elegido no tiene agenda, se avisa qué días atiende. |

---

## 7. GitHub y Render

1. Subí `API` y `CLIENT` a **dos repositorios** de GitHub. El `.env` no se sube, porque está en `.gitignore` (tiene contraseñas).
2. En Render: **New → Blueprint → repositorio de la API**.
   - `render.yaml` crea la base PostgreSQL y el servicio de la API, y los conecta solos.
   - Las tablas y los datos se crean en el primer arranque.
   - Para comprobar que anda, abrí `…/health`: tiene que decir `"db":"conectada"`.
3. **New → Blueprint → repositorio del CLIENT**. Cuando te pida `VITE_API_URL`, pegá la URL de la API, sin `/` al final.
4. Después de eso, cada `git push` vuelve a publicar todo solo.

**Plan gratis de Render:** la API se duerme después de 15 minutos sin uso y tarda alrededor de un minuto en despertar. La base gratis vence a los 30 días.

---

## Si algo no funciona

| Mensaje | Solución |
|---------|----------|
| No se pudo conectar con el servidor | La API no está corriendo: `npm run dev` en `API`. |
| No se pudo conectar a PostgreSQL | Iniciá el servicio de PostgreSQL (Windows: *Servicios → postgresql*). |
| PostgreSQL rechazó el usuario o la contraseña | Corregí `DB_PASSWORD` en `API/.env`. |
| Faltan tablas | Reiniciá la API o ejecutá `npm run db:reset`. |
| Cannot find module… | Falta `npm install` en esa carpeta. |
| La ejecución de scripts está deshabilitada | En la terminal: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Este usuario no tiene el rol… | Elegí el rol correcto arriba del login. |
| La página en Render tarda en cargar | La API estaba dormida: esperá alrededor de un minuto. |

---

La documentación detallada (requerimientos, DER, todas las rutas, casos de prueba y proceso de desarrollo) está en [`docs/DOCUMENTACION.md`](docs/DOCUMENTACION.md).
