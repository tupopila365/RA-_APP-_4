@echo off
echo ============================================================
echo   FIND YOUR IP ADDRESS FOR MOBILE APP
echo ============================================================
echo.

echo Your computer's IP addresses:
echo.

ipconfig | findstr /C:"IPv4 Address"

echo.
echo ============================================================
echo   INSTRUCTIONS
echo ============================================================
echo.
echo 1. Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi"
echo 2. Copy that IP address (e.g., 192.168.1.100)
echo 3. Open: app/config/env.js
echo 4. Update API_BASE_URL to: http://YOUR_IP:5000/api
echo 5. Save the file
echo 6. Restart Expo: npm start
echo 7. Scan QR code again
echo.
echo Example:
echo   API_BASE_URL: 'http://192.168.1.100:5000/api',
echo.
echo ============================================================
echo.
pause
