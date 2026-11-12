/* =============================================================
   CONFIGURACIÓN DEL FRONTEND
   ============================================================= */
window.CONFIG = {
  // Dirección de la API. Se toma de VITE_API_URL (archivo .env del CLIENT o
  // variable de entorno en Render). Si no está definida, usa la API local.
  API_URL: (() => {
    const meta = document.querySelector('meta[name="api-url"]');
    const url = meta ? meta.content.trim() : '';
    return url && !url.includes('%') ? url.replace(/\/+$/, '') : 'http://localhost:3001';
  })(),

  // Modo demo: en el login, al elegir un rol se autocompletan usuario y
  // contraseña de prueba y aparecen botones para elegir otro usuario.
  // Ponelo en false cuando el sistema se use con datos reales.
  MODO_DEMO: true,

  // Usuarios de prueba (los mismos que carga database/seed.sql)
  CUENTAS_DEMO: {
    admin: [['admin', 'admin123', 'Laura Gómez']],
    enfermero: [['enfermera', 'enfermera123', 'Marta Benítez']],
    medico: [['med001', 'med123', 'Dr. Carlos Fernández'], ['med002', 'med123', 'Dra. Ana Ríos'], ['med003', 'med123', 'Dr. Jorge Sosa'],
      ['med004', 'med123', 'Dra. Silvia Acuña'], ['med005', 'med123', 'Dr. Martín Ledesma']],
    paciente: [['juan', 'paciente123', 'Juan Pérez'], ['sofia', 'paciente123', 'Sofía López']],
  },
};
