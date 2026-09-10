@echo off
setlocal
cd /d "%~dp0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist .turbo rmdir /s /q .turbo
if exist .swc rmdir /s /q .swc
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if not exist node_modules\next\package.json (
  call npm install --no-audit --no-fund
  if errorlevel 1 exit /b 1
)
set NEXT_PUBLIC_SITE_URL=https://valie1.github.io
call npm run build:pages
if errorlevel 1 exit /b 1
call npm run preview:pages
