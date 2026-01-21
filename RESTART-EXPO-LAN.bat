@echo off
echo ============================================================
echo   RESTARTING EXPO WITH LAN MODE
echo ============================================================
echo.
echo This will start Expo so your phone can access it.
echo.
echo IMPORTANT: Stop your current Expo server first (Ctrl+C)
echo.
pause

cd app
echo.
echo Starting Expo with LAN mode...
echo Make sure phone and computer are on the same WiFi!
echo.
npx expo start --lan

