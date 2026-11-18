# Creación del proyecto paso a paso

Cómo se armó el sistema desde cero, en el mismo orden en que lo hicimos.

## 1. Análisis

1. Partimos del diagrama de tablas del profesor: PERSONA, USUARIO, ROL, PERSONA_ROL, ESPECIALIDAD, MEDICO_ESPECIALIDAD, CONSULTORIO, PESO_TALLA y TURNO.
2. Leímos las 3 reglas del sistema:
   - La enfermera solo aprueba un turno si hay un PESO_TALLA verificado.
   - Al menos 2 turnos por día con `prioridad_comunidad = TRUE`.
   - El turno se asocia al control verificado más reciente.
3. Definimos 4 roles (Administrador, Enfermero, Médico, Paciente) y qué hace cada uno. → ver [REQUERIMIENTOS.md](REQUERIMIENTOS.md).
4. Decidimos agregar **PAIS** y **HORARIO_MEDICO** para poder ofrecer horarios reales. → ver [BASE_DE_DATOS.md](BASE_DE_DATOS.md).

## 2. Estructura pedida por el profesor

Dos proyectos separados, cada uno con su servidor y su repositorio:

```
Proyecto/
├── API/                     ← backend (Node + Express + Sequelize)
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── config/database.js
│       ├── controllers/
│       ├── routes/
│       ├── models/          ← un archivo por tabla + index.js con las relaciones
│       └── app.js
└── CLIENT/                  ← frontend (HTML + CSS + JS con Vite)
```

## 3. Creación de la API

```bash
mkdir API && cd API
npm init -y
npm install express sequelize pg pg-hstore dotenv cors morgan bcryptjs jsonwebtoken
npm install -D nodemon
```

En `package.json` agregamos los scripts:

```json
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "db:reset": "node src/database/reset.js"
}
```

Creamos `.env` (no se sube a GitHub) y `.gitignore`:

```env
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
PORT=3001
JWT_SECRET=una_clave_secreta
JWT_EXPIRES=8h
CORS_ORIGIN=*
CUPOS_PRIORIDAD=2
```

```gitignore
node_modules
.env
```

Después, en este orden:

| Orden | Archivo o carpeta | Qué hicimos |
|---|---|---|
| 1 | `src/config/database.js` | Instancia de Sequelize con los datos del `.env` (y `DATABASE_URL` para Render) |
| 2 | `src/models/*.js` | Un modelo por tabla, con nombre en singular y mayúscula (`Persona.js`, `Turno.js`…) |
| 3 | `src/models/index.js` | Todas las relaciones (`hasMany`, `belongsTo`, `belongsToMany`) |
| 4 | `src/middlewares/` | `auth.js` (token y roles) y `errores.js` (mensajes claros) |
| 5 | `src/controllers/` | La lógica de cada recurso (12 controladores) |
| 6 | `src/routes/` | Las URLs de cada recurso (12 archivos) |
| 7 | `src/utils/agenda.js` | Cálculo de horarios libres y de los 2 cupos con prioridad |
| 8 | `src/database/` | `crearBase.js`, `reset.js` y el seeder con el trigger y los datos iniciales |
| 9 | `src/app.js` | Une todo: middlewares, rutas, sync, seeder y `app.listen(3001)` |
| 10 | `api.http` | Pedidos de prueba para REST Client |

## 4. Creación del CLIENT

```bash
npm create vite@latest CLIENT -- --template vanilla
cd CLIENT
npm install
```

| Orden | Archivo | Qué hicimos |
|---|---|---|
| 1 | `vite.config.js` | Proyecto multipágina (5 HTML) |
| 2 | `.env` | `VITE_API_URL=http://localhost:3001` |
| 3 | `public/js/config.js` | Lee la URL de la API y el modo demo |
| 4 | `public/js/api.js` | `fetch` con token, sesión, `guard()` por rol, avisos y tablas |
| 5 | `index.html` | Login con elección de rol y registro de pacientes |
| 6 | `admin.html`, `enfermero.html`, `medico.html`, `paciente.html` | Una pantalla por rol |
| 7 | `public/css/styles.css` | Diseño responsive con un color por rol |

## 5. Unión con la API de referencia

Unimos nuestro proyecto con la *API Hospitalaria* del curso:

- Puerto **3001**, base **hospital_db** y su `.env`.
- Express 5, morgan, nodemon.
- `sequelize.sync()` + seeder al arrancar.
- Sus rutas: `/auth`, `/medicos`, `/turnos`, `/control`, `/paises`, `/horarios`.
- Sus usuarios: `admin / admin123` y `med001` a `med005 / med123`.

## 6. Pruebas

- PostgreSQL: trigger, índices y consultas en pgAdmin.
- API: `api.http` y Postman.
- Pantallas: recorrido completo de los 4 roles.

→ ver [PRUEBAS.txt](PRUEBAS.txt) y [ACCIONES-Y-VERIFICACION.md](ACCIONES-Y-VERIFICACION.md).

## 7. GitHub y Render

```bash
# en API/ y después en CLIENT/
git init
git add .
git commit -m "feat: primera versión"
git branch -M main
git remote add origin https://github.com/USUARIO/turnero-api.git
git push -u origin main
```

En Render → **New → Blueprint** → elegir el repositorio. El `render.yaml` crea:

- la base `turnero-db`;
- el servicio `turnero-api` (health check en `/health`);
- el sitio estático del CLIENT, con `VITE_API_URL` apuntando a la API.

## 8. Comandos del día a día

| Comando | Dónde | Para qué |
|---|---|---|
| `npm install` | API y CLIENT | Instalar dependencias |
| `npm run dev` | API | Iniciar la API con nodemon (puerto 3001) |
| `npm run dev` | CLIENT | Iniciar las pantallas (puerto 5173) |
| `npm run db:reset` | API | Volver la base al estado inicial |
| `npm run build` | CLIENT | Generar la carpeta `dist` para Render |
