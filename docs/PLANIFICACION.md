# Planificación y trabajo en equipo

Completar los nombres de los integrantes.

## División de tareas

| Integrante | Área | Archivos a cargo | Rama |
|---|---|---|---|
| 1. ________ | Análisis, requerimientos y base de datos | `models/`, `models/index.js`, seeder, trigger, DER | `feature/base-datos` |
| 2. ________ | Backend: autenticación y seguridad | `authController`, `middlewares/`, `usuarioController`, `personaController` | `feature/auth` |
| 3. ________ | Backend: turnos y reglas | `turnoController`, `controlController`, `utils/agenda.js`, `horarioController` | `feature/turnos` |
| 4. ________ | Frontend | `CLIENT/` (login y 4 pantallas), `api.js`, estilos | `feature/frontend` |
| 5. ________ | Despliegue, pruebas y documentación | `render.yaml`, `api.http`, `docs/`, README | `feature/docs-deploy` |

## Tablero Kanban (GitHub Projects)

Columnas: **Por hacer · En curso · En revisión · Hecho**. Cada tarjeta es un *issue* con responsable.

| # | Tarea | Responsable | Estado |
|---|---|---|---|
| 1 | Relevar requerimientos y reglas | Integrante 1 | Hecho |
| 2 | Diseñar el DER (11 tablas) | Integrante 1 | Hecho |
| 3 | Crear modelos y relaciones | Integrante 1 | Hecho |
| 4 | Trigger de aprobación (RN-01 y RN-03) | Integrante 1 | Hecho |
| 5 | Login con JWT y permisos por rol | Integrante 2 | Hecho |
| 6 | Alta de personas, roles y usuarios | Integrante 2 | Hecho |
| 7 | Manejo de errores | Integrante 2 | Hecho |
| 8 | Pedir, aprobar, cancelar y atender turnos | Integrante 3 | Hecho |
| 9 | Controles de peso y talla | Integrante 3 | Hecho |
| 10 | Horarios y cupos con prioridad (RN-02) | Integrante 3 | Hecho |
| 11 | Pantalla de login y registro | Integrante 4 | Hecho |
| 12 | Pantallas de los 4 roles | Integrante 4 | Hecho |
| 13 | Diseño responsive | Integrante 4 | Hecho |
| 14 | Unión con la API de referencia | Todos | Hecho |
| 15 | Pruebas de API y de pantallas | Integrante 5 | Hecho |
| 16 | Despliegue en Render | Integrante 5 | Hecho |
| 17 | Documentación (`docs/`, README) | Integrante 5 | Hecho |
| 18 | Ensayo de la exposición | Todos | Por hacer |

Cómo crear el tablero: en GitHub → *Projects* → *New project* → *Board*. Agregar las columnas y crear un issue por tarea.

## Cronograma

| Semana | Objetivo |
|---|---|
| 1 | Análisis, requerimientos y DER |
| 2 | Modelos, relaciones y base de datos |
| 3 | Login, permisos y rutas principales |
| 4 | Turnos, controles y reglas |
| 5 | Pantallas de los 4 roles |
| 6 | Unión con la API de referencia y pruebas |
| 7 | Despliegue en Render y documentación |
| 8 | Ensayo y exposición |

## Flujo de Git

```bash
git checkout main
git pull
git checkout -b feature/mi-tarea
# ...cambios...
git add .
git commit -m "feat: descripción corta"
git push -u origin feature/mi-tarea
```

Luego, en GitHub: **Pull Request → otro integrante revisa → Merge a `main`**.

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feat:` | Funcionalidad nueva | `feat: aprobar turno con consultorio` |
| `fix:` | Corrección | `fix: validar fecha pasada` |
| `docs:` | Documentación | `docs: catálogo de rutas` |
| `style:` | Estilos | `style: colores por rol` |
| `refactor:` | Reorganizar código | `refactor: separar agenda.js` |

## Reglas del equipo

1. Nadie sube directo a `main`: todo entra por Pull Request.
2. Cada PR lo revisa otra persona.
3. El `.env` nunca se sube.
4. Antes de empezar a trabajar: `git pull`.
5. Si se cambia una ruta o una tabla, se actualiza `docs/` en el mismo PR.
