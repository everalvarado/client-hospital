#!/usr/bin/env bash
# Mac / Linux: inicia API (3001) y CLIENT (5173). Ctrl+C detiene los dos.
cd "$(dirname "$0")"
[ -d API/node_modules ] || { echo "Primero ejecutá ./instalar.sh"; exit 1; }
(cd API && npm run dev) &
API_PID=$!
trap 'kill $API_PID 2>/dev/null' EXIT
sleep 3
cd CLIENT && npm run dev
