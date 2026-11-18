# Evaluación: dónde está cada criterio de la rúbrica

Rúbrica del Proyecto Integrador (2º año). Para cada criterio del nivel **Sobresaliente (10)**, indicamos dónde está la evidencia en el proyecto.

## 1. Calidad Técnica y Arquitectura — 35 %

| Lo que pide el 10 | Evidencia | Dónde |
|---|---|---|
| Arquitectura sólida, separación de capas impecable | API y CLIENT separados; en la API: `config → models → controllers → routes`, más `middlewares` y `utils` | [ARQUITECTURA.md](ARQUITECTURA.md), `API/src/` |
| POO / modularidad | Un modelo (clase de Sequelize) por tabla; un controlador y un archivo de rutas por recurso | `API/src/models/`, `controllers/`, `routes/` |
| BD optimizada y normalizada | 11 tablas en 3FN, 15 relaciones, índices únicos y de búsqueda, trigger | [BASE_DE_DATOS.md](BASE_DE_DATOS.md) |
| Modelo ER correcto | DER con cardinalidades | [img/DER.png](img/DER.png) |
| Git avanzado (ramas, PRs, commits de todos) | Ramas `feature/*`, Pull Requests revisados por otro integrante, commits con prefijo | [PLANIFICACION.md](PLANIFICACION.md), historial en GitHub |
| Integración / despliegue funcional | Render con `render.yaml` (base, API y sitio) | [CREACION.md](CREACION.md#7-github-y-render) |
| Código limpio y documentado | Comentarios en controladores, nombres claros, configuración en `.env` | Todo `API/src/` |

## 2. Cumplimiento Funcional (MVP) — 35 %

| Lo que pide el 10 | Evidencia | Dónde |
|---|---|---|
| Supera el MVP | Además de las 3 reglas: horarios por médico, cupos reservados, ficha del paciente con IMC, resumen del admin, registro de pacientes | [REQUERIMIENTOS.md](REQUERIMIENTOS.md) |
| Manejo de errores robusto | `middlewares/errores.js` traduce cada error a 400 / 401 / 403 / 404 / 409 / 503 con mensaje claro | [RUTAS.md](RUTAS.md#códigos-de-respuesta) |
| Validaciones front y back | `CLIENT/public/js/validaciones.js` (filtra al escribir: DNI solo números, email con @…) y las mismas reglas en `API/src/utils/validaciones.js`, más modelos, trigger e índices | [ACCIONES-Y-VERIFICACION.md](ACCIONES-Y-VERIFICACION.md) |
| UX/UI cuidada, adaptativa e intuitiva | Una pantalla y un color por rol, avisos, horarios tachados, diseño responsive | `CLIENT/` |
| No colapsa con datos erróneos | Casos de prueba con datos inválidos | [PRUEBAS.txt](PRUEBAS.txt) |

## 3. Gestión y Documentación — 15 %

| Lo que pide el 10 | Evidencia | Dónde |
|---|---|---|
| DER | Imagen con cardinalidades y descripción de tablas | [BASE_DE_DATOS.md](BASE_DE_DATOS.md) |
| Especificación de requerimientos | Funcionales, no funcionales y reglas de negocio | [REQUERIMIENTOS.md](REQUERIMIENTOS.md) |
| README estructurado con guía de setup y despliegue | README principal + guía de creación | [../README.md](../README.md), [CREACION.md](CREACION.md) |
| Arquitectura diagramada | Diagrama de capas y flujo de un turno | [ARQUITECTURA.md](ARQUITECTURA.md) |
| Tablero Kanban / organización visible | Tablero en GitHub Projects y división de tareas | [PLANIFICACION.md](PLANIFICACION.md) |
| Documentación al día | Catálogo de rutas, registro de cambios | [RUTAS.md](RUTAS.md), [CAMBIOS.md](CAMBIOS.md) |

## 4. Defensa Oral y Trabajo en Equipo — 15 %

| Lo que pide el 10 | Cómo lo preparamos |
|---|---|
| Exposición fluida y profesional | Guía de exposición en Word: un tema por integrante, con tiempos |
| Todos exponen y responden | Cada integrante es responsable de una parte del código (ver [PLANIFICACION.md](PLANIFICACION.md)) |
| Demo en vivo fluida | Guion de demo en [ACCIONES-Y-VERIFICACION.md](ACCIONES-Y-VERIFICACION.md); `npm run db:reset` antes de empezar |
| Justificación técnica de cada tecnología | Tabla de tecnologías y decisiones en [ARQUITECTURA.md](ARQUITECTURA.md) |
| Gestión del tiempo | 1 hora: 5 bloques de ~10 min + preguntas |

## Lista de control antes de entregar

- [ ] Los 2 repositorios en GitHub con commits de los 5 integrantes.
- [ ] Al menos un Pull Request revisado por integrante.
- [ ] Tablero Kanban con todas las tareas en *Hecho*.
- [ ] API y CLIENT funcionando en Render (abrir la URL 1 minuto antes, para despertar la API).
- [ ] `.env` fuera de GitHub.
- [ ] Base reiniciada con `npm run db:reset` antes de la demo.
- [ ] Probados los 4 roles y las 3 reglas.
- [ ] Carpeta `docs/` completa y README actualizado.
