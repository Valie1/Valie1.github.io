@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules\next\package.json call npm install --no-audit --no-fund
call npm run dev:portfolio
