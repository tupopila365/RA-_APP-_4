@echo off
echo ========================================
echo FIXING FONT, ICON, AND DISPLAY ISSUES
echo ========================================

echo.
echo Step 1: Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Step 2: Clearing all caches...
cd app
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
npm cache clean --force

echo.
echo Step 3: Clearing Metro bundler cache...
npx expo start --clear --reset-cache --no-dev --minify

echo.
echo ========================================
echo DISPLAY ISSUES FIX COMPLETE!
echo ========================================
echo.
echo If issues persist, try:
echo 1. Restart your device/emulator
echo 2. Check device accessibility settings
echo 3. Test on a different device
echo.
pause