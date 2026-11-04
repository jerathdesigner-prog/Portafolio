@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Jerath Moreira - Publicar en Cloudflare
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PUBLICAR_CLOUDFLARE.ps1"
echo.
if errorlevel 1 (
  echo Revisa el error de arriba. No hace falta enviar claves a ChatGPT.
)
pause
