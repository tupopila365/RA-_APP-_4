@echo off
echo ============================================================
echo   STARTING BACKEND API ONLY
echo ============================================================
echo.

REM Navigate to backend directory
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo Please edit backend\.env with your configuration
)

REM Start the backend
echo Starting backend API...
echo.
echo Backend will run on:
echo - Local: http://localhost:5000
echo - API: http://localhost:5000/api
echo.
echo Press Ctrl+C to stop the backend
echo.

npm run dev