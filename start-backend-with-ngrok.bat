@echo off
echo ========================================
echo Starting Backend with Ngrok Tunnel
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ngrok is not installed!
    echo.
    echo Please install ngrok first:
    echo   1. Run: .\install-ngrok.ps1
    echo   2. Or download from: https://ngrok.com/download
    echo.
    pause
    exit /b 1
)

REM Change to backend directory
cd /d "%~dp0backend"

REM Check if backend dependencies are installed
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo [1/3] Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo [2/3] Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo [3/3] Starting ngrok tunnel...
echo.
echo ========================================
echo IMPORTANT: Copy the HTTPS URL below!
echo ========================================
echo.
echo The ngrok URL will look like: https://abc123.ngrok-free.app
echo.
echo After ngrok starts, you'll need to:
echo   1. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
echo   2. Update app/config/env.js with this URL
echo   3. Restart your Expo app
echo.
echo ========================================
echo.

REM Start ngrok
ngrok http 5000

pause

