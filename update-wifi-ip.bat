@echo off
echo.
echo ========================================
echo   Auto WiFi IP Configuration Updater
echo ========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js first
    pause
    exit /b 1
)

REM Run the auto-update script
echo 🔍 Detecting and updating WiFi IP configuration...
echo.

node auto-update-wifi-ip.js %*

echo.
echo ========================================
echo   Update Complete
echo ========================================
echo.
echo 💡 Next steps:
echo    1. Restart your mobile app (Expo)
echo    2. Make sure your backend is running
echo    3. Test the connection
echo.
pause