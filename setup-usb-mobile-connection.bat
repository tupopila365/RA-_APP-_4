@echo off
echo ============================================================
echo  MOBILE APP USB CONNECTION SETUP
echo ============================================================
echo.
echo This script will:
echo 1. Check if ADB is available
echo 2. Set up USB port forwarding for mobile app
echo 3. Update mobile app configuration
echo.

REM Check if ADB is available
echo [1/3] Checking ADB availability...
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ADB not found! Please install Android SDK Platform Tools
    echo    Download from: https://developer.android.com/studio/releases/platform-tools
    echo    Or install Android Studio
    pause
    exit /b 1
)
echo ✅ ADB is available

REM Check if device is connected
echo.
echo [2/3] Checking connected devices...
adb devices
echo.
echo Make sure your phone is:
echo - Connected via USB cable
echo - USB Debugging enabled (Developer Options)
echo - Device shows as "device" (not "unauthorized")
echo.
pause

REM Set up port forwarding
echo [3/3] Setting up port forwarding...
echo Forwarding phone port 5000 to computer port 5000...
adb reverse tcp:5000 tcp:5000
if %errorlevel% equ 0 (
    echo ✅ Port forwarding successful!
) else (
    echo ❌ Port forwarding failed. Check USB connection and try again.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  SETUP COMPLETE!
echo ============================================================
echo.
echo Next steps:
echo 1. Update your mobile app configuration:
echo    File: app/config/env.js
echo    Change: API_BASE_URL: 'http://localhost:5000/api',
echo.
echo 2. Restart your Expo app:
echo    - Press 'R' in the Expo terminal, or
echo    - Shake your device and select "Reload"
echo.
echo 3. Test the chatbot in your mobile app
echo.
echo ✅ Your phone can now access the backend via USB!
echo.
pause