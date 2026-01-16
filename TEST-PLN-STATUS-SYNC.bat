@echo off
echo ========================================
echo PLN Status Sync Testing Suite
echo ========================================
echo.
echo Note: These scripts require backend dependencies
echo Make sure you have run 'npm install' in the backend folder
echo.

:menu
echo Select an option:
echo.
echo 1. Run Diagnostic (Check current status)
echo 2. Test Refresh Functionality
echo 3. Both (Diagnostic + Test)
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto diagnostic
if "%choice%"=="2" goto test
if "%choice%"=="3" goto both
if "%choice%"=="4" goto end
echo Invalid choice. Please try again.
echo.
goto menu

:diagnostic
echo.
echo Running diagnostic...
echo.
cd backend
node ../diagnose-pln-status-sync.js
cd ..
echo.
pause
goto menu

:test
echo.
echo Running refresh test...
echo.
cd backend
node ../test-pln-status-refresh.js
cd ..
echo.
pause
goto menu

:both
echo.
echo Running diagnostic...
echo.
cd backend
node ../diagnose-pln-status-sync.js
echo.
echo ========================================
echo.
echo Running refresh test...
echo.
node ../test-pln-status-refresh.js
cd ..
echo.
pause
goto menu

:end
echo.
echo Exiting...
exit /b 0
