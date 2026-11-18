# Acciones y verificación

Qué puede hacer cada rol, qué ruta usa y **cómo comprobar** que funcionó (en la pantalla y en pgAdmin).
Antes de probar: `npm run db:reset` en `API` para empezar con los datos iniciales.

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Enfermera | `enfermera` | `enfermera123` |
| Médicos | `med001` … `med005` | `med123` |
| Pacientes | `juan` / `sofia` | `paciente123` |

## Paciente

| Acción | Ruta | Cómo verificar |
|---|---|---|
| Registrarse | `POST /auth/registro-paciente` | Aparece el aviso verde. En pgAdmin: `SELECT * FROM persona ORDER BY id_persona DESC LIMIT 1;` |
| Pedir turno | `POST /turnos` | Queda *Pendiente* en "Mis turnos". `SELECT * FROM turno ORDER BY id_turno DESC LIMIT 1;` |
| Ver horarios libres | `GET /horarios/disponibles` | Los horarios ocupados aparecen tachados |
| Cancelar turno | `PATCH /turnos/:id/cancelar` | Estado *Cancelado*; el horario vuelve a quedar libre |
| Ver mis controles | `GET /control` | Lista con peso, talla e IMC |
| Editar mis datos | `PUT /perfil` | Al recargar se ven los datos nuevos |

## Enfermero

| Acción | Ruta | Cómo verificar |
|---|---|---|
| Buscar paciente | `GET /personas?q=` | Solo aparecen pacientes |
| Registrar peso y talla | `POST /control` | El control aparece *Sin verificar* |
| Verificar control | `PATCH /control/:id/verificar` | Cambia a *Verificado*. `SELECT verificado FROM peso_talla WHERE id_control = X;` |
| Aprobar turno | `PATCH /turnos/:id/aprobar` | Estado *Aprobado* con consultorio. `id_control` queda completo |
| Aprobar **sin** control verificado | `PATCH /turnos/:id/aprobar` | El botón está desactivado. Por API: **400** con el mensaje de la Regla 1 |
| Cancelar turno | `PATCH /turnos/:id/cancelar` | Estado *Cancelado* |

## Médico

| Acción | Ruta | Cómo verificar |
|---|---|---|
| Ver agenda del día | `GET /medicos/:id/turnos?fecha=` | Solo ve sus turnos |
| Ver ficha del paciente | `GET /medicos/:id/pacientes/:idPaciente` | Datos, controles con IMC e historial |
| Marcar atendido | `PATCH /turnos/:id/atender` | Estado *Atendido* |
| Ver mis horarios | `GET /horarios?id_medico=` | Días y horas de atención |

## Administrador

| Acción | Ruta | Cómo verificar |
|---|---|---|
| Ver resumen | `GET /estadisticas/resumen` | Totales de personas, turnos y controles |
| Controlar Regla 2 | `GET /turnos/prioridad` | Tabla de 14 días; cada día con al menos 2 lugares con prioridad |
| Alta de persona con usuario | `POST /personas` | Aparece en la lista y puede iniciar sesión |
| Cambiar roles | `PUT /personas/:id/roles` | `SELECT * FROM persona_rol WHERE id_persona = X;` |
| Activar o desactivar usuario | `PATCH /usuarios/:id/estado` | Un usuario *Inactivo* no puede entrar |
| Cambiar contraseña | `PATCH /usuarios/:id/contrasena` | Entra con la nueva; en la base se ve el hash |
| Especialidades, horarios, consultorios, países | `POST` / `DELETE` en cada ruta | Aparecen o desaparecen de la lista |
| Ver y cancelar turnos | `GET /turnos`, `PATCH /turnos/:id/cancelar` | Filtros por fecha y estado |

## Verificación de las 3 reglas

### Regla 1 — Aprobar solo con control verificado
1. Entrar como `enfermera`.
2. En *Turnos pendientes*, el turno de **Sofía** tiene el botón *Aprobar* desactivado.
3. Prueba por la base (debe dar error):
   ```sql
   UPDATE turno SET estado = 'Aprobado'
   WHERE id_paciente = (SELECT id_persona FROM persona WHERE nombre = 'Sofía');
   ```
4. Verificar el control de Sofía → ahora sí se puede aprobar.

### Regla 2 — Al menos 2 turnos por día con prioridad
1. Entrar como `admin` → *Resumen*: control de los próximos 14 días.
2. Como paciente, al pedir turno sin prioridad, los últimos 2 horarios del día no se pueden tomar.
3. En pgAdmin: la consulta "turnos con prioridad por día" de [BASE_DE_DATOS.md](BASE_DE_DATOS.md).

### Regla 3 — Control verificado más reciente
1. `juan` tiene varios controles verificados.
2. Aprobar un turno de Juan.
3. Comprobar que se asoció el último:
   ```sql
   SELECT t.id_turno, t.id_control,
          (SELECT id_control FROM peso_talla
            WHERE id_paciente = t.id_paciente AND verificado
            ORDER BY fecha_control DESC, id_control DESC LIMIT 1) AS mas_reciente
   FROM turno t WHERE t.estado = 'Aprobado';
   ```
   Las dos columnas tienen que coincidir.

## Verificación de seguridad

| Prueba | Resultado esperado |
|---|---|
| `GET /turnos` sin token | 401 |
| Paciente llama a `GET /personas` | 403 |
| Paciente abre `admin.html` | Lo devuelve al login |
| Contraseña en la tabla `usuario` | Se ve como hash `$2a$10$…`, nunca en texto |
