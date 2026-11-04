@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Jerath Moreira - Actualizar Cloudflare
echo ===============================================
echo   JERATH MOREIRA - ACTUALIZAR PORTAFOLIO
echo ===============================================
echo.
if not exist "wrangler.jsonc" (
  echo ERROR: No se encontro wrangler.jsonc.
  echo Coloca este BAT en la carpeta principal del proyecto original.
  pause
  exit /b 1
)
if not exist "worker\index.mjs" (
  echo ERROR: No se encontro worker\index.mjs.
  echo Comprueba que copiaste los archivos actualizados.
  pause
  exit /b 1
)
where npx.cmd >nul 2>&1
if errorlevel 1 (
  echo ERROR: No se encontro npx. Comprueba Node.js o abre un CMD nuevo.
  pause
  exit /b 1
)
echo Publicando los archivos actuales en Cloudflare Workers...
echo No se restablecera la base D1 ni se borrara el bucket R2.
echo.
call npm.cmd install
if errorlevel 1 (
  echo ERROR: No se pudieron instalar las dependencias.
  pause
  exit /b 1
)
call npx.cmd wrangler deploy
set "DEPLOY_RESULT=%ERRORLEVEL%"
echo.
if not "%DEPLOY_RESULT%"=="0" (
  echo ERROR: No se pudo publicar la actualizacion.
  echo Copia o fotografia el error completo para revisarlo.
) else (
  echo PUBLICACION COMPLETADA.
  echo Abre https://jerathmoreira.com y pulsa Ctrl+F5.
)
echo.
pause
exit /b %DEPLOY_RESULT%
