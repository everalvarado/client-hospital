# CLIENT · Turnero Hospitalario

Frontend en **HTML + CSS + JavaScript**, servido con **Vite**.

```
CLIENT/
├── .env               ← VITE_API_URL (dirección de la API)
├── package.json
├── vite.config.js     ← servidor del CLIENT (varias páginas)
├── render.yaml        ← despliegue como sitio estático en Render
├── index.html         ← login con los 4 roles
├── admin.html  enfermero.html  medico.html  paciente.html
└── public/
    ├── css/styles.css
    └── js/  config.js (modo demo, URL de la API) · api.js (conexión) · un .js por rol
```

## Uso local
```bash
npm install
npm run dev       # http://localhost:5173  (la API tiene que estar corriendo en el 3001)
```
