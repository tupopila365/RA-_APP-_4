@echo off
echo ========================================
echo USB Connection Setup for Expo
echo ========================================
echo.

REM Check for ADB in common locations
set ADB_PATH=
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe
) else (
    where adb >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set ADB_PATH=adb
    )
)

if "%ADB_PATH%"=="" (
    echo [ERROR] ADB not found
    echo.
    echo Please install ADB:
    echo 1. Download from: https://developer.android.com/studio/releases/platform-tools
    echo 2. Extract to C:\platform-tools
    echo 3. Add C:\platform-tools to your PATH
    echo.
    echo OR install Android Studio (includes ADB)
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking for connected devices...
"%ADB_PATH%" devices
echo.

echo [2/3] Setting up port forwarding...
"%ADB_PATH%" reverse tcp:5000 tcp:5000
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Port forwarding set up!
    echo Phone can now access localhost:5000
) else (
    echo [ERROR] Failed to set up port forwarding
    echo Make sure:
    echo - Phone is connected via USB
    echo - USB debugging is enabled
    echo - You authorized USB debugging on phone
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying port forwarding...
"%ADB_PATH%" reverse --list
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure env.js uses: http://localhost:5000/api
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start Expo: cd app ^&^& npx expo start --android
echo.
echo Note: Port forwarding stays active until you disconnect USB
echo.
pause

