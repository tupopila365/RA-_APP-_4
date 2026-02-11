@echo off
echo ============================================================
echo   FIX: Connection Timeout (SocketTimeoutException)
echo ============================================================
echo.

cd /d "%~dp0"

echo This helps fix "There was a problem loading the project"
echo.
echo Choose an option:
echo.
echo   1. Start with LAN (phone on SAME WiFi as PC) - RECOMMENDED
echo   2. Restart tunnel with cache clear
echo   3. Setup USB connection (no tunnel needed)
echo   4. Exit
echo.

set /p choice="Enter 1, 2, 3 or 4: "

if "%choice%"=="1" goto lan
if "%choice%"=="2" goto tunnel
if "%choice%"=="3" goto usb
if "%choice%"=="4" goto end
echo Invalid choice.
goto end

:lan
echo.
echo Starting Expo with LAN mode...
echo Make sure phone and computer are on the same WiFi!
echo.
call npx expo start --lan
goto end

:tunnel
echo.
echo Clearing .expo cache...
if exist ".expo" rmdir /s /q .expo
echo.
echo Starting Expo with tunnel (cache cleared)...
echo Wait 30-60 seconds for the tunnel URL to appear.
echo.
call npx expo start --tunnel --clear
goto end

:usb
echo.
echo Connect your phone via USB and enable USB debugging.
echo.
echo Running: adb reverse tcp:8081 tcp:8081
adb reverse tcp:8081 tcp:8081
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] adb not found or phone not connected.
    echo Install Android SDK platform-tools or connect your phone.
    pause
    goto end
)
echo Port forwarded. Starting Expo (no tunnel)...
echo.
call npx expo start
goto end

:end
pause
