@echo off
echo ========================================
echo REBUILDING APP AFTER CHATBOT FIX
echo ========================================

echo.
echo Step 1: Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Step 2: Cleaning cache and node_modules...
cd app
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
npm cache clean --force

echo.
echo Step 3: Installing dependencies (including AsyncStorage)...
npm install

echo.
echo Step 4: Clearing Expo cache...
npx expo install --fix
npx expo start --clear --reset-cache

echo.
echo ========================================
echo REBUILD COMPLETE!
echo ========================================
echo.
echo The app should now start without ExpoCrypto errors.
echo If you still see issues, try:
echo 1. Close this terminal
echo 2. Run: npx expo run:android (for Android)
echo 3. Or: npx expo run:ios (for iOS)
echo.
pause