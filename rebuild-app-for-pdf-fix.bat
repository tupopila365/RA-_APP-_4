@echo off
echo ========================================
echo Rebuilding App for PDF Viewer Fix
echo ========================================
echo.
echo This will rebuild the app with expo-intent-launcher
echo native module for proper PDF opening on Android.
echo.
pause

cd app

echo.
echo Step 1: Cleaning previous builds...
call npx expo prebuild --clean

echo.
echo Step 2: Building Android app...
call npx expo run:android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo The app should now open PDFs directly
echo in your default PDF viewer app.
echo.
pause
