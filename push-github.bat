@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Azm - push to GitHub
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed.
  pause
  exit /b 1
)
where gh >nul 2>nul
if errorlevel 1 (
  echo GitHub CLI is not installed.
  pause
  exit /b 1
)
echo [1/4] Checking your GitHub login...
gh auth status >nul 2>nul
if errorlevel 1 (
  echo You are not signed in to GitHub CLI. Press Enter when asked, then approve in your browser.
  gh auth login --hostname github.com --git-protocol https --web
  if errorlevel 1 (
    echo GitHub sign-in did not finish.
    pause
    exit /b 1
  )
)
gh auth setup-git >nul 2>nul
echo [2/4] Preparing the git repository...
if not exist .git git init -b main >nul
set NEEDID=0
git config user.name >nul 2>nul
if errorlevel 1 set NEEDID=1
git config user.email >nul 2>nul
if errorlevel 1 set NEEDID=1
if "!NEEDID!"=="1" (
  for /f "delims=" %%u in ('gh api user --jq .login') do set GHUSER=%%u
  for /f "delims=" %%i in ('gh api user --jq .id') do set GHID=%%i
  git config user.name "!GHUSER!"
  git config user.email "!GHID!+!GHUSER!@users.noreply.github.com"
)
git add -A
git commit -q -m "Azm: personal workout app (Expo SDK 57)" >nul 2>nul
git rev-parse --verify HEAD >nul 2>nul
if errorlevel 1 (
  git commit -m "Azm: personal workout app (Expo SDK 57)"
  echo Could not create the first commit.
  pause
  exit /b 1
)
echo [3/4] Uploading to GitHub...
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  gh repo create azm --private --source . --remote origin --push
) else (
  git push -u origin main
)
if errorlevel 1 (
  echo Upload failed.
  pause
  exit /b 1
)
for /f "delims=" %%r in ('gh repo view --json url --jq .url') do set URL=%%r
echo !URL!>github-link.txt
echo [4/4] Done: !URL!
pause
