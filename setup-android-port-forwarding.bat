@echo off
REM ============================================
REM Android Port Forwarding Setup Script
REM ============================================
REM This script sets up ADB port forwarding for Android development
REM Forward localhost ports to Android device/emulator

echo ============================================
echo   Android Port Forwarding Setup
echo ============================================
echo.

REM Check if ADB is available
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] ADB not found in PATH
    echo Please install Android SDK Platform Tools
    echo Download from: https://developer.android.com/studio/releases/platform-tools
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking ADB connection...
adb devices
echo.

REM Check if device is connected
adb devices | findstr "device$" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] No Android device/emulator detected
    echo Please:
    echo   1. Connect your Android device via USB with USB debugging enabled
    echo   2. OR start an Android emulator
    echo   3. Then run this script again
    echo.
    pause
    exit /b 1
)

echo [2/4] Removing existing port forwards (if any)...
adb reverse --remove-all
echo.

echo [3/4] Setting up port forwards...
echo.

REM Backend API Port (5000)
echo   Forwarding Backend API: localhost:5000
adb reverse tcp:5000 tcp:5000
if %ERRORLEVEL% EQU 0 (
    echo     [OK] Backend API forwarded successfully
) else (
    echo     [ERROR] Failed to forward Backend API port
)

REM RAG Service Port (8001)
echo   Forwarding RAG Service: localhost:8001
adb reverse tcp:8001 tcp:8001
if %ERRORLEVEL% EQU 0 (
    echo     [OK] RAG Service forwarded successfully
) else (
    echo     [ERROR] Failed to forward RAG Service port
)

REM Ollama Port (11434) - if needed for direct access
echo   Forwarding Ollama: localhost:11434
adb reverse tcp:11434 tcp:11434
if %ERRORLEVEL% EQU 0 (
    echo     [OK] Ollama forwarded successfully
) else (
    echo     [WARNING] Failed to forward Ollama port (may not be needed)
)

echo.
echo [4/4] Verifying port forwards...
adb reverse --list
echo.

echo ============================================
echo   Port Forwarding Complete!
echo ============================================
echo.
echo Your Android app can now access:
echo   - Backend API: http://localhost:5000/api
echo   - RAG Service: http://localhost:8001
echo   - Ollama: http://localhost:11434
echo.
echo NOTE: Port forwards are active until you:
echo   1. Disconnect your device
echo   2. Run: adb reverse --remove-all
echo   3. Restart ADB server
echo.
echo To verify, check your Android app can connect to the backend.
echo.
pause

