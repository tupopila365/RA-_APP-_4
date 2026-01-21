@echo off
REM ============================================================
REM   AUTOMATIC FIREWALL FIX FOR NODE.JS AND EXPO
REM ============================================================
REM This script adds Windows Firewall rules to allow Node.js
REM and the required ports for development
REM
REM NOTE: Must be run as Administrator!

echo ============================================================
echo   AUTOMATIC FIREWALL FIX
echo ============================================================
echo.
echo This script will add firewall rules for:
echo - Node.js application
echo - Backend API (port 5000)
echo - Expo Dev Server (port 8081)
echo.
echo NOTE: This must be run as Administrator!
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [OK] Running as Administrator
echo.

REM Find Node.js executable
set NODE_PATH=
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('where node') do set NODE_PATH=%%i
    echo [OK] Found Node.js at: %NODE_PATH%
) else (
    echo [WARNING] Node.js not found in PATH
    echo Trying common locations...
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set NODE_PATH=%ProgramFiles%\nodejs\node.exe
        echo [OK] Found Node.js at: %NODE_PATH%
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set NODE_PATH=%ProgramFiles(x86)%\nodejs\node.exe
        echo [OK] Found Node.js at: %NODE_PATH%
    ) else (
        echo [ERROR] Could not find Node.js
        echo Please install Node.js or add it to PATH
        pause
        exit /b 1
    )
)
echo.

echo [1/4] Adding firewall rule for Node.js application...
if defined NODE_PATH (
    netsh advfirewall firewall delete rule name="Node.js" >nul 2>&1
    netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="%NODE_PATH%" enable=yes profile=private,public
    if %errorlevel% equ 0 (
        echo    [OK] Node.js firewall rule added
    ) else (
        echo    [ERROR] Failed to add Node.js firewall rule
    )
) else (
    echo    [SKIP] Node.js path not found
)
echo.

echo [2/4] Adding firewall rule for Backend API (port 5000)...
netsh advfirewall firewall delete rule name="Node.js Backend Port 5000" >nul 2>&1
netsh advfirewall firewall add rule name="Node.js Backend Port 5000" dir=in action=allow protocol=TCP localport=5000 enable=yes profile=private,public
if %errorlevel% equ 0 (
    echo    [OK] Port 5000 firewall rule added
) else (
    echo    [ERROR] Failed to add port 5000 firewall rule
)
echo.

echo [3/4] Adding firewall rule for Expo Dev Server (port 8081)...
netsh advfirewall firewall delete rule name="Expo Dev Server Port 8081" >nul 2>&1
netsh advfirewall firewall add rule name="Expo Dev Server Port 8081" dir=in action=allow protocol=TCP localport=8081 enable=yes profile=private,public
if %errorlevel% equ 0 (
    echo    [OK] Port 8081 firewall rule added
) else (
    echo    [ERROR] Failed to add port 8081 firewall rule
)
echo.

echo [4/4] Verifying firewall rules...
echo.
echo Checking Node.js rule:
netsh advfirewall firewall show rule name="Node.js" | findstr /i "Enabled.*Yes" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Node.js rule is active
) else (
    echo    [WARNING] Node.js rule might not be active
)

echo Checking port 5000 rule:
netsh advfirewall firewall show rule name="Node.js Backend Port 5000" | findstr /i "Enabled.*Yes" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Port 5000 rule is active
) else (
    echo    [WARNING] Port 5000 rule might not be active
)

echo Checking port 8081 rule:
netsh advfirewall firewall show rule name="Expo Dev Server Port 8081" | findstr /i "Enabled.*Yes" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Port 8081 rule is active
) else (
    echo    [WARNING] Port 8081 rule might not be active
)
echo.

echo ============================================================
echo   FIREWALL FIX COMPLETE
echo ============================================================
echo.
echo Firewall rules have been added.
echo.
echo NEXT STEPS:
echo 1. Test connection from phone browser:
echo    http://YOUR_IP:5000/api/health
echo.
echo 2. Restart Expo with LAN mode:
echo    cd app
echo    npx expo start --lan
echo.
echo 3. Scan QR code with Expo Go app
echo.
echo If it still doesn't work, run: TEST-FIREWALL.bat
echo.
pause

