@echo off
echo ============================================================
echo   START EXPO FOR PHONE ACCESS
echo ============================================================
echo.

REM Get current IP address
echo Detecting your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do set CURRENT_IP=%%b
    goto :ip_found
)
:ip_found
set CURRENT_IP=%CURRENT_IP:~1%
echo Your IP address: %CURRENT_IP%
echo.

REM Check if backend is running
echo Checking if backend is running...
netstat -an | findstr :5000 >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Backend is NOT running on port 5000
    echo Starting backend now...
    cd backend
    if not exist "node_modules" (
        echo Installing dependencies...
        call npm install
    )
    start "Backend API" cmd /k "npm run dev"
    echo Backend starting in new window (wait 10 seconds...)
    timeout /t 10 /nobreak >NUL
    cd ..
) else (
    echo [OK] Backend is running
)
echo.

REM Update IP in env.js if needed
echo Checking mobile app configuration...
cd app
if exist "config\env.js" (
    findstr /C:"API_BASE_URL" config\env.js | findstr /C:"%CURRENT_IP%" >NUL 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Updating env.js with current IP address...
        powershell -Command "(Get-Content 'config\env.js') -replace 'API_BASE_URL: ''http://[0-9.]+:5000/api''', 'API_BASE_URL: ''http://%CURRENT_IP%:5000/api''' | Set-Content 'config\env.js'"
        echo [OK] Configuration updated
    ) else (
        echo [OK] Configuration already uses current IP
    )
) else (
    echo [ERROR] env.js file not found!
    pause
    exit /b 1
)
echo.

echo ============================================================
echo   STARTING EXPO DEV SERVER
echo ============================================================
echo.
echo Starting Expo with LAN mode (accessible from phone on same WiFi)...
echo.
echo IMPORTANT:
echo - Make sure phone and computer are on the same WiFi network
echo - Scan the QR code with Expo Go app
echo - If QR code doesn't work, try tunnel mode: npx expo start --tunnel
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

REM Start Expo with LAN mode
npx expo start --lan

