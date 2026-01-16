@echo off
echo 🔧 Quick Metro Bundler Fix...

cd app

echo 1. Clearing Metro cache...
npx expo start --clear

echo.
echo ✅ If the issue persists, run fix-metro-bundler.ps1 for a complete reset
pause