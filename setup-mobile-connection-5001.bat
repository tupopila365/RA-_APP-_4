@echo off
echo 📱 Setting up Mobile App Connection for Backend on Port 5001
echo ================================================================

echo.
echo 🔧 Step 1: Setting up ADB port forwarding...
adb reverse tcp:5001 tcp:5001
if %errorlevel% equ 0 (
    echo ✅ ADB port forwarding configured: Mobile localhost:5001 → Computer localhost:5001
) else (
    echo ❌ ADB port forwarding failed. Make sure:
    echo    • Android device is connected via USB
    echo    • USB debugging is enabled
    echo    • ADB is installed and in PATH
    echo.
    echo 💡 Alternative: Use WiFi connection in env.js
    pause
    exit /b 1
)

echo.
echo 🧪 Step 2: Testing backend connectivity...
curl -s -o nul -w "Backend Status: %%{http_code}\n" http://localhost:5001/api/roadworks/public
if %errorlevel% equ 0 (
    echo ✅ Backend is accessible on localhost:5001
) else (
    echo ❌ Backend is not accessible. Make sure backend is running on port 5001
    pause
    exit /b 1
)

echo.
echo 📊 Step 3: Checking roadworks data...
echo Fetching roadworks from backend...
curl -s http://localhost:5001/api/roadworks/public | findstr "success"
if %errorlevel% equ 0 (
    echo ✅ Roadworks data is available
) else (
    echo ⚠️  Could not verify roadworks data
)

echo.
echo 🎯 SETUP COMPLETE!
echo ================================================================
echo ✅ Mobile app should now be able to connect to backend
echo ✅ Backend URL: http://localhost:5001/api
echo ✅ ADB port forwarding: Active
echo.
echo 📱 NEXT STEPS:
echo 1. Restart your mobile app (close and reopen)
echo 2. Navigate to Road Status page
echo 3. Check if roadworks are now visible
echo.
echo 🔧 TROUBLESHOOTING:
echo • If still not working, check mobile app console logs
echo • Verify mobile device is connected via USB
echo • Make sure backend is running: npm run dev
echo.
pause