@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Jerath Moreira - Actualizar portafolio
echo ================================================
echo  ACTUALIZAR PORTAFOLIO JERATH MOREIRA
echo ================================================
echo.
if not exist "wrangler.jsonc" (
  echo ERROR: Extrae este ZIP encima de tu carpeta original
  echo Jerath_Cloudflare_Workers_CMS que contiene wrangler.jsonc.
  pause
  exit /b 1
)
if not exist "worker\index.mjs" (
  echo ERROR: Falta el backend original worker\index.mjs.
  pause
  exit /b 1
)
where npx.cmd >nul 2>&1
if errorlevel 1 (
  echo ERROR: Instala Node.js para usar npx.
  pause
  exit /b 1
)
echo Actualizando solo los archivos de la web.
echo No elimina ni reinicia D1 ni R2.
echo.
call npm.cmd install
if errorlevel 1 (
  echo ERROR: No se pudieron instalar las dependencias.
  pause
  exit /b 1
)
call npx.cmd wrangler deploy
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" (
  echo ERROR: No se pudo publicar. Comprueba la sesion de Cloudflare.
) else (
  echo DESPLIEGUE COMPLETADO. Abre https://jerathmoreira.com/
  echo Si ves la version anterior, refresca con Ctrl+F5.
)
echo.
pause
exit /b %RESULT%
