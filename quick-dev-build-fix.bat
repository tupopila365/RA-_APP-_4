@echo off
echo 🔧 Quick Development Build Fix...

cd app

echo 1. Clearing Metro cache...
npx expo start --clear

echo.
echo 2. Rebuilding for Android...
npx expo run:android

echo.
echo ✅ Development build should now work with native modules
pause