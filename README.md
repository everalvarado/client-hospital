# Sistema Hospitalario de Turnos

Unión de los dos proyectos:

- **Base:** la *API Hospitalaria* original. Conserva su `app.js` y `config`, Express 5, morgan,
  nodemon, `sequelize.sync()` con el seeder `seedInicial`, el **puerto 3001**, la base **hospital_db**,
  las rutas `/auth`, `/medicos`, `/turnos`, `/control`, `/paises`, `/horarios` y los usuarios
  `admin` y `med001`…`med005`.
- **Agregado:** el turnero con el diagrama de tablas, que suma los **4 roles** (Administrador, Enfermero,
  Médico y Paciente), una **pantalla para cada rol** y las **reglas del sistema**.

| Carpeta | Qué es | Tecnología | Puerto |
|---------|--------|------------|--------|
| **API/** | Backend | Node.js + Express 5 + Sequelize + PostgreSQL | 3001 |
| **CLIENT/** | Frontend | HTML + CSS + JS con Vite | 5173 |

---

## 1. Correrlo en tu computadora

**Necesitás instalados:** [Node.js](https://nodejs.org) y [PostgreSQL](https://www.postgresql.org/download/), que trae pgAdmin.

1. En `API/.env` revisá que `DB_PASSWORD` sea la contraseña de tu PostgreSQL. Viene con la del proyecto original.
2. Doble clic en **`1-INSTALAR.bat`**: instala la API y el CLIENT.
3. Doble clic en **`2-INICIAR.bat`**: abre la API y el CLIENT, y el navegador en http://localhost:5173.

La primera vez que arranca, la API hace todo esto sola:
- crea la base `hospital_db` (si no existe),
- crea las tablas a partir de los modelos (`sequelize.sync()`),
- carga los datos iniciales y la regla de aprobación (`seedInicial`).

En la consola vas a ver: `Conectado a PostgreSQL` → `Tablas sincronizadas` → `Servidor escuchando en puerto 3001`.

**Desde VS Code:** *Archivo → Abrir carpeta…* → en *Ejecutar y depurar* elegí
**"▶ Iniciar todo (API + CLIENT)"** → F5. También podés usar la terminal: `cd API` y `npm run dev`, que usa nodemon.

**Volver a empezar con datos limpios:** `npm run db:reset` en la carpeta `API`.
Borra las tablas, las crea de nuevo y vuelve a cargar los datos iniciales.

### Usuarios iniciales
| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Médicos | `med001` … `med005` | `med123` |
| Enfermera | `enfermera` | `enfermera123` |
| Pacientes | `juan` / `sofia` | `paciente123` |

En el login, al elegir un rol se completan solos el usuario y la contraseña de prueba (modo demo).
Para desactivarlo, cambiá `MODO_DEMO` a `false` en `CLIENT/public/js/config.js`.

---

## 2. Rutas de la API

Son las mismas del proyecto original, más las que necesitan los paneles. La lista completa con ejemplos
está en `API/README.md` y en `API/api.http`.

```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{ "usuario": "admin", "contraseña": "admin123" }
```

---

## 3. Reglas del sistema

| Regla | Cómo se cumple |
|-------|----------------|
| La enfermera solo aprueba un turno si el paciente tiene un control de peso y talla **verificado**. | Trigger en PostgreSQL, que crea `seedInicial`. Además, el botón *Aprobar* aparece desactivado. |
| El turno se asocia al control verificado **más reciente**. | El mismo trigger completa `id_control` al aprobar. |
| Siempre hay al menos **2 turnos por día con prioridad** para parajes o comunidades lejanas. | La API reserva 2 horarios por médico y por día. El administrador ve qué días cumplen la regla. |
| Un médico no puede tener dos turnos a la misma hora. | Índice único en el modelo `Turno`. |

**Mejoras sobre el diagrama:**
- tablas nuevas **PAIS** y **HORARIO_MEDICO** (cada médico tiene sus días y horarios de atención),
- **PERSONA** suma sexo, ciudad, país, obra social, número de afiliado y matrícula del médico,
- **TURNO** suma el motivo de la consulta y la especialidad.

---

## 4. GitHub y Render

1. Subí `API` y `CLIENT` a **dos repositorios** de GitHub. El `.env` no se sube, porque está en `.gitignore`.
2. En Render: **New → Blueprint → repositorio de la API**.
   - `render.yaml` crea la base PostgreSQL y el servicio de la API, y los conecta solos.
   - Las tablas y los datos se crean en el primer arranque.
   - Para comprobar que anda, abrí `…/health`.
3. **New → Blueprint → repositorio del CLIENT**. Cuando te pida `VITE_API_URL`, pegá la URL de la API.
4. Después de eso, cada `git push` vuelve a publicar todo solo.

**Plan gratis de Render:** la API se duerme después de 15 minutos sin uso y tarda alrededor de un minuto en despertar.
La base gratis vence a los 30 días.

## Si algo no funciona

| Mensaje | Solución |
|---------|----------|
| No se pudo conectar con el servidor | La API no está corriendo: `npm run dev` en `API`. |
| No se pudo conectar a PostgreSQL | Iniciá el servicio de PostgreSQL. |
| PostgreSQL rechazó el usuario o la contraseña | Corregí `DB_PASSWORD` en `API/.env`. |
| Faltan tablas | Reiniciá la API o ejecutá `npm run db:reset`. |
| Este usuario no tiene el rol… | Elegí el rol correcto arriba del login. |
