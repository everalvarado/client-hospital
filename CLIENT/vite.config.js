// Servidor del CLIENT. Es un sitio de varias páginas: una por rol.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const raiz = dirname(fileURLToPath(import.meta.url));
const pagina = (nombre) => resolve(raiz, nombre);

export default defineConfig({
  server: { port: 5173, open: true },
  preview: { port: 4173 },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: pagina('index.html'),
        admin: pagina('admin.html'),
        enfermero: pagina('enfermero.html'),
        medico: pagina('medico.html'),
        paciente: pagina('paciente.html'),
      },
    },
  },
});
