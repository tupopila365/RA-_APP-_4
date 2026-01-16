@echo off
echo ========================================
echo Refresh Mobile App - Clear Cache
echo ========================================
echo.
echo This will clear the Metro bundler cache
echo and restart the Expo development server.
echo.
echo Make sure to:
echo 1. Close any running Metro bundler (Ctrl+C)
echo 2. Reload the app on your device after this completes
echo.
pause

echo.
echo Navigating to app folder...
cd app

echo.
echo Clearing Metro bundler cache...
echo.

REM Try Expo CLI first
npx expo start -c

REM If that fails, try npm
if errorlevel 1 (
    echo.
    echo Expo CLI failed, trying npm...
    npm start -- --clear
)

echo.
echo ========================================
echo Cache cleared and server restarted!
echo ========================================
echo.
echo Next steps:
echo 1. Wait for QR code to appear
echo 2. On your device:
echo    - Shake device
echo    - Tap "Reload"
echo    OR
echo    - Scan QR code again
echo.
echo 3. Go to Track PLN Application
echo 4. You should see the new progress bar!
echo.
pause
