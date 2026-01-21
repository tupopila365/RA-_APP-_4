@echo off
echo ============================================================
echo   FIX: Mobile App Phone Access in Development Mode
echo ============================================================
echo.

REM Get current IP address
echo [1/6] Detecting your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do set CURRENT_IP=%%b
    goto :ip_found
)
:ip_found
set CURRENT_IP=%CURRENT_IP:~1%
echo    Your IP address: %CURRENT_IP%
echo.

REM Check if backend is running
echo [2/6] Checking if backend is running...
netstat -an | findstr :5000 >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend is running on port 5000
) else (
    echo    [WARNING] Backend is NOT running on port 5000
    echo    Starting backend now...
    cd backend
    if not exist "node_modules" (
        echo    Installing dependencies...
        call npm install
    )
    start "Backend API" cmd /k "npm run dev"
    echo    [INFO] Backend starting in new window (wait 10 seconds...)
    timeout /t 10 /nobreak >NUL
    cd ..
)
echo.

REM Check current env.js configuration
echo [3/6] Checking mobile app configuration...
if exist "app\config\env.js" (
    findstr /C:"API_BASE_URL" app\config\env.js | findstr /C:"%CURRENT_IP%" >NUL 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Configuration already uses current IP: %CURRENT_IP%
    ) else (
        echo    [WARNING] Configuration might not match current IP
        echo    Current config in env.js:
        findstr /C:"API_BASE_URL" app\config\env.js
        echo.
        echo    Should be: API_BASE_URL: 'http://%CURRENT_IP%:5000/api',
    )
) else (
    echo    [ERROR] env.js file not found!
)
echo.

REM Check if Expo is running
echo [4/6] Checking if Expo dev server is running...
netstat -an | findstr :8081 >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Expo dev server is running on port 8081
) else (
    echo    [INFO] Expo dev server is not running
    echo    You need to start it with: cd app ^&^& npm start
)
echo.

REM Test backend accessibility
echo [5/6] Testing backend accessibility...
curl -s http://localhost:5000/api/health >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend is accessible from localhost
) else (
    echo    [WARNING] Backend might not be responding
)
echo.

REM Network connectivity check
echo [6/6] Network Configuration Summary...
echo.
echo ============================================================
echo   DIAGNOSIS COMPLETE
echo ============================================================
echo.
echo Your computer's IP: %CURRENT_IP%
echo.
echo ============================================================
echo   SOLUTIONS (Try in order):
echo ============================================================
echo.
echo SOLUTION 1: Start Expo with LAN mode (Recommended)
echo ----------------------------------------
echo 1. Stop current Expo server (Ctrl+C if running)
echo 2. Run this command:
echo    cd app
echo    npx expo start --lan
echo.
echo 3. Scan the QR code with Expo Go app
echo 4. Make sure phone and computer are on same WiFi
echo.
echo SOLUTION 2: Use USB Connection (Bypasses WiFi issues)
echo ----------------------------------------
echo 1. Connect phone via USB
echo 2. Enable USB Debugging on phone
echo 3. Run: setup-usb-mobile-connection.bat
echo 4. Update app/config/env.js to use: localhost:5000
echo 5. Start Expo: cd app ^&^& npx expo start
echo.
echo SOLUTION 3: Use Tunnel Mode (Works from any network)
echo ----------------------------------------
echo 1. Stop current Expo server
echo 2. Run: cd app ^&^& npx expo start --tunnel
echo 3. This creates a public URL (slower but works anywhere)
echo.
echo SOLUTION 4: Update IP Address Manually
echo ----------------------------------------
echo 1. Edit: app\config\env.js
echo 2. Change API_BASE_URL to: http://%CURRENT_IP%:5000/api
echo 3. Restart Expo: cd app ^&^& npx expo start --lan
echo.
echo ============================================================
echo   FIREWALL CHECK
echo ============================================================
echo.
echo If phone still can't connect, check Windows Firewall:
echo 1. Windows Security ^> Firewall ^& network protection
echo 2. Allow an app through firewall
echo 3. Find "Node.js" and check both Private and Public
echo 4. Also allow port 8081 (Expo) and 5000 (Backend)
echo.
echo ============================================================
echo   QUICK TEST
echo ============================================================
echo.
echo Test from phone browser:
echo   http://%CURRENT_IP%:5000/api/health
echo.
echo Should show: {"status":"ok"}
echo If this works, network is fine - issue is with Expo config
echo.
pause

