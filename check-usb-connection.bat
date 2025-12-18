@echo off
echo ========================================
echo USB Connection Status Check
echo ========================================
echo.

REM Check if ADB is available
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] ADB not found in PATH
    echo Install ADB to use USB connection
    goto :end
)

echo [1] Checking connected devices...
adb devices
echo.

echo [2] Checking port forwarding...
adb reverse --list
echo.

echo [3] Testing backend connection...
curl -s http://localhost:5000/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backend is accessible on localhost:5000
) else (
    echo [WARNING] Backend not accessible on localhost:5000
    echo Make sure backend is running: cd backend ^&^& npm run dev
)
echo.

:end
pause



