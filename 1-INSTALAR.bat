@echo off
chcp 65001 >nul
title Hospital - Instalacion
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [X] No se encontro Node.js. Instalalo desde https://nodejs.org y volve a ejecutar este archivo.
  pause
  exit /b 1
)

echo === 1/2 Instalando la API ===
cd /d "%~dp0API"
call npm install
if errorlevel 1 goto error

echo.
echo === 2/2 Instalando el CLIENT ===
cd /d "%~dp0CLIENT"
call npm install
if errorlevel 1 goto error

echo.
echo === Listo ===
echo Revisa que DB_PASSWORD en API\.env sea la contrasena de tu PostgreSQL.
echo La base hospital_db, las tablas y los usuarios se crean solos al iniciar la API.
echo Ahora ejecuta 2-INICIAR.bat
pause
exit /b 0

:error
echo [X] Fallo npm install. Revisa tu conexion a internet.
pause
exit /b 1
