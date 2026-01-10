@echo off
echo ========================================
echo PLN PDF Generation - Quick Start Guide
echo ========================================
echo.

echo 1. Testing PDF Generation Components...
node test-pdf-generation-direct.js
echo.

echo 2. Checking Backend Dependencies...
cd backend
if exist "node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Installing backend dependencies...
    npm install
)
echo.

echo 3. Starting Backend Server...
echo ℹ️  Starting backend in development mode...
echo ℹ️  Press Ctrl+C to stop the server when done testing
echo.
start cmd /k "npm run dev"

echo.
echo 4. Wait for backend to start, then:
echo    - Open admin panel in browser
echo    - Submit a PLN application via mobile app
echo    - Go to PLN Applications in admin panel
echo    - Click "Download Application Form (PDF)"
echo.

echo 5. Alternative: Test API endpoint directly
echo    Run: node test-pdf-api-endpoint.js
echo.

echo ========================================
echo Your PLN PDF generation is ready to use!
echo ========================================
pause