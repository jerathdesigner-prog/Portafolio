@echo off
setlocal
cd /d "%~dp0"
title Icono personalizado Jerath Moreira
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Se necesita Node.js para instalar el favicon.
  pause
  exit /b 1
)
echo Instalando el favicon personalizado...
node tools\instalar_mi_favicon.cjs
if errorlevel 1 (
  echo ERROR: El favicon no pudo instalarse.
  pause
  exit /b 1
)
echo.
echo Listo. Para publicarlo ejecuta ACTUALIZAR_CLOUDFLARE_CORREGIDO.bat
pause
