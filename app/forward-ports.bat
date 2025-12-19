@echo off
echo Setting up Android port forwarding...
echo.

REM Try to find adb in common Android SDK locations
set ADB_PATH=

REM Check Android SDK in AppData
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
)

REM Check Android SDK in Program Files
if exist "%ProgramFiles%\Android\android-sdk\platform-tools\adb.exe" (
    set ADB_PATH=%ProgramFiles%\Android\android-sdk\platform-tools\adb.exe
)

REM Check if adb is in PATH
where adb >nul 2>&1
if %ERRORLEVEL% == 0 (
    set ADB_PATH=adb
)

if "%ADB_PATH%"=="" (
    echo ERROR: ADB not found!
    echo.
    echo Please install Android Studio and add platform-tools to your PATH, or
    echo update this script with the correct path to adb.exe
    echo.
    echo Common locations:
    echo   %LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
    echo   %ProgramFiles%\Android\android-sdk\platform-tools\adb.exe
    pause
    exit /b 1
)

echo Found ADB at: %ADB_PATH%
echo.

REM Forward backend port (5000)
echo Forwarding port 5000 (Backend API)...
"%ADB_PATH%" reverse tcp:5000 tcp:5000
if %ERRORLEVEL% == 0 (
    echo [OK] Port 5000 forwarded successfully
) else (
    echo [ERROR] Failed to forward port 5000
    echo Make sure your Android device/emulator is connected and USB debugging is enabled
)

echo.
echo Port forwarding setup complete!
echo.
echo Your app can now connect to:
echo   http://localhost:5000/api
echo.
pause

