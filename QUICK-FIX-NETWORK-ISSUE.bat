@echo off
echo ============================================================
echo   QUICK FIX: Network Connection Issue
echo ============================================================
echo.
echo   Problem: Mobile app can't connect to backend API
echo   Solution: Start backend and check network configuration
echo.

REM Check if backend is running
echo [1/4] Checking if backend is running on port 5000...
netstat -an | findstr :5000 >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend is running on port 5000
) else (
    echo    [ISSUE] Backend is NOT running on port 5000
    echo    Starting backend now...
    cd backend
    if not exist "node_modules" (
        echo    Installing dependencies...
        call npm install
    )
    start "Backend API" cmd /k "npm run dev"
    echo    [OK] Backend starting... (wait 10 seconds)
    timeout /t 10 /nobreak >NUL
)
echo.

REM Check MongoDB
echo [2/4] Checking MongoDB connection...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    [OK] MongoDB is running
) else (
    echo    [WARNING] MongoDB might not be running
    echo    If you're using MongoDB Atlas, this is normal
)
echo.

REM Test backend API
echo [3/4] Testing backend API connection...
curl -s http://localhost:5000/api/health >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend API is responding
) else (
    echo    [ISSUE] Backend API is not responding
    echo    Trying to start backend again...
    cd backend 2>NUL || cd ..\backend 2>NUL || cd RA-_APP-_4\backend
    start "Backend API" cmd /k "npm run dev"
    echo    [INFO] Backend starting in new window
)
echo.

REM Network configuration check
echo [4/4] Network Configuration Check...
echo    Your computer's IP addresses:
ipconfig | findstr /i "IPv4"
echo.
echo    For mobile device connection:
echo    - USB: Use 'adb reverse tcp:5000 tcp:5000' then use localhost
echo    - WiFi: Use your computer's IP address (shown above)
echo    - Ngrok: Run start-backend-with-ngrok.bat for external access
echo.

echo ============================================================
echo   NEXT STEPS:
echo ============================================================
echo.
echo   1. Make sure backend is running (check the new window)
echo   2. If using physical device on WiFi:
echo      - Update app/config/env.js with your IP address
echo      - Or run: start-backend-with-ngrok.bat
echo.
echo   3. If using USB connection:
echo      - Run: adb reverse tcp:5000 tcp:5000
echo      - Keep localhost in app/config/env.js
echo.
echo   4. Restart your mobile app after making changes
echo.
pause