#!/usr/bin/env bash
# Mac / Linux: instala API y CLIENT. La base se crea sola al iniciar la API.
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Instalá Node.js desde https://nodejs.org"; exit 1; }
(cd API && npm install)
(cd CLIENT && npm install)
echo "Listo. Revisá DB_PASSWORD en API/.env y ejecutá ./iniciar.sh"
