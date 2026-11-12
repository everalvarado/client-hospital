@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "API\node_modules" (
  echo Primero ejecuta 1-INSTALAR.bat
  pause
  exit /b 1
)
echo Abriendo dos ventanas: API (puerto 3001) y CLIENT (puerto 5173).
echo Para detener el sistema, cerra esas dos ventanas.
start "API - Hospital (puerto 3001)" cmd /k "cd /d "%~dp0API" && npm run dev"
timeout /t 4 >nul
start "CLIENT - Hospital (puerto 5173)" cmd /k "cd /d "%~dp0CLIENT" && npm run dev"
