@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Azm - publish to Expo
cd /d "%~dp0"
set EAS_NO_VCS=1
set EAS=eas-cli@24.13.0
echo.
echo [1/4] Installing packages...
call npm install --no-fund --no-audit > publish-log.txt 2>&1
if errorlevel 1 (
  type publish-log.txt
  echo npm install failed.
  pause
  exit /b 1
)
echo [2/4] Checking your Expo login. The first time downloads EAS CLI and takes a few minutes...
call npx --yes %EAS% whoami >> publish-log.txt 2>&1
if errorlevel 1 (
  echo.
  echo A browser window will open. Create a free Expo account or sign in there, then come back here.
  call npx --yes %EAS% login
  if errorlevel 1 (
    echo Login did not finish. Double-click publish-azm.bat to try again.
    pause
    exit /b 1
  )
)
if not exist eas.local.json (
  echo [3/4] This folder is not linked to an Expo project yet.
  echo Run: npx eas-cli init  then put your owner and projectId in eas.local.json. See README.md
  pause
  exit /b 1
)
echo [3/4] Project linked.
echo [4/4] Publishing. This takes 1-2 minutes...
call npx --yes %EAS% update --channel main --message Azm --platform ios --environment production --non-interactive >> publish-log.txt 2>&1
findstr /c:"Update group ID" publish-log.txt >nul
if errorlevel 1 (
  type publish-log.txt
  echo.
  echo Publishing failed. The details are in publish-log.txt
  pause
  exit /b 1
)
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Content eas.local.json -Raw | ConvertFrom-Json).projectId"`) do set PID=%%i
set "QR=https://qr.expo.dev/eas-update?projectId=!PID!&runtimeVersion=exposdk:57.0.0&channel=main"
echo !QR!>expo-go-link.txt
echo.
echo Published. Scan the QR code that opens in your browser with your iPhone camera.
echo The link is also saved in expo-go-link.txt
start "" "!QR!"
pause
