@echo off
chcp 65001 >nul
title Azm
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed. Opening the download page...
  start "" https://nodejs.org/en/download
  echo Install Node.js LTS, then double-click start-azm.bat again.
  pause
  exit /b 1
)
echo Node:
node -v
if not exist node_modules (
  echo.
  echo Installing packages. The first time takes a few minutes...
  call npm install --no-fund --no-audit
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
echo.
echo Starting Azm. Scan the QR code with your iPhone camera to open it in Expo Go.
call npx expo start %*
pause
