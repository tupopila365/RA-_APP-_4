@echo off
echo ========================================
echo PLN Tracking Case-Insensitive Fix Test
echo ========================================
echo.

echo Step 1: Stopping backend...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting backend...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak

echo.
echo Step 3: Running test...
node test-pln-tracking-case-insensitive.js

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If all tests passed, the fix is working!
echo Users can now enter their Reference ID in any case.
echo.
pause
