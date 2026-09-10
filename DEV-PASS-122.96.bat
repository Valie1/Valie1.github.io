@echo off
setlocal
cd /d "%~dp0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
call node scripts\clean-next-cache.mjs
if not exist node_modules\next\package.json call npm install --no-audit --no-fund
set NEXT_PUBLIC_SITE_URL=https://valie1.github.io
call npm run dev:portfolio
