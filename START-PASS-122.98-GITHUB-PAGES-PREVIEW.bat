@echo off
setlocal
cd /d "%~dp0"
echo.
echo VALIE PASS 122.98 - GITHUB PAGES PREVIEW
echo ===========================================
echo.
if not exist node_modules\next\package.json (
  echo Installing dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 goto :fail
)
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
call npm run typecheck
if errorlevel 1 goto :fail
call npm run build:pages
if errorlevel 1 goto :fail
call npm run github-pages:audit
if errorlevel 1 goto :fail
echo.
echo Build verified. Opening static preview at http://localhost:3000
echo Press Ctrl+C to stop.
echo.
start "" http://localhost:3000
call npm run preview:pages
goto :eof
:fail
echo.
echo PASS 122.98 preview/build failed. Read the error above.
pause
exit /b 1
