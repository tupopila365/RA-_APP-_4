@echo off
echo ============================================================
echo   FIX REACT VERSION ERROR AND RESTART
echo ============================================================
echo.
echo This will:
echo 1. Delete node_modules
echo 2. Delete package-lock.json
echo 3. Clear npm cache
echo 4. Install correct React version (18.3.1)
echo 5. Start Expo with clean cache
echo.
pause

echo.
echo [1/5] Deleting node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    [OK] node_modules deleted
) else (
    echo    [INFO] node_modules not found
)

echo.
echo [2/5] Deleting package-lock.json...
if exist package-lock.json (
    del /q package-lock.json
    echo    [OK] package-lock.json deleted
) else (
    echo    [INFO] package-lock.json not found
)

echo.
echo [3/5] Clearing npm cache...
call npm cache clean --force
echo    [OK] npm cache cleared

echo.
echo [4/5] Installing dependencies...
echo    This may take 5-10 minutes...
echo.
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo    [OK] Dependencies installed successfully
    echo.
    echo [5/5] Starting Expo with clean cache...
    echo.
    echo    When Expo starts:
    echo    1. Press 's' to switch to Expo Go
    echo    2. Open Expo Go app on your phone
    echo    3. Tap "Scan QR Code" in Expo Go
    echo    4. Scan the QR code from terminal
    echo.
    pause
    echo.
    call npx expo start -c
) else (
    echo.
    echo    [ERROR] Installation failed
    echo    Please check the error messages above
    echo.
    pause
)
