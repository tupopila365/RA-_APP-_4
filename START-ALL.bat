@echo off
echo ============================================================
echo   ROADS AUTHORITY APPLICATION - COMPLETE STARTUP
echo ============================================================
echo.

REM Check if MongoDB is running
echo [1/6] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    [OK] MongoDB is running
) else (
    echo    [WARNING] MongoDB is not running!
    echo    Please start MongoDB first or use MongoDB Atlas
    echo.
    choice /C YN /M "Do you want to continue anyway"
    if errorlevel 2 exit /b
)
echo.

REM Check if Ollama is running (for chatbot)
echo [2/6] Checking Ollama (for chatbot)...
curl -s http://localhost:11434/api/tags >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Ollama is running
) else (
    echo    [INFO] Ollama is not running - chatbot will not work
    echo    To enable chatbot, run: ollama serve
)
echo.

REM Start Backend
echo [3/6] Starting Backend API...
cd backend
if not exist "node_modules" (
    echo    Installing backend dependencies...
    call npm install
)
if not exist ".env" (
    echo    [WARNING] No .env file found!
    echo    Copying from .env.example...
    copy .env.example .env
    echo    Please edit backend\.env with your configuration
    pause
)
start "Backend API" cmd /k "npm run dev"
echo    [OK] Backend starting on http://localhost:5000
echo.

REM Wait for backend to start
echo [4/6] Waiting for backend to be ready...
timeout /t 5 /nobreak >NUL
echo    [OK] Backend should be ready
echo.

REM Start Admin Panel
echo [5/6] Starting Admin Panel...
cd ..\admin
if not exist "node_modules" (
    echo    Installing admin dependencies...
    call npm install
)
start "Admin Panel" cmd /k "npm run dev"
echo    [OK] Admin Panel starting on http://localhost:5173
echo.

REM Start Mobile App
echo [6/6] Starting Mobile App...
cd ..\app
if not exist "node_modules" (
    echo    Installing mobile app dependencies...
    call npm install
)
start "Mobile App" cmd /k "npm start"
echo    [OK] Mobile App starting (Expo DevTools will open)
echo.

echo ============================================================
echo   ALL SERVICES STARTED!
echo ============================================================
echo.
echo   Backend API:    http://localhost:5000
echo   Admin Panel:    http://localhost:5173
echo   Mobile App:     Check Expo DevTools (opens in browser)
echo.
echo   Optional Services:
echo   - RAG Service:  Run START-RAG.bat for chatbot
echo   - MongoDB:      Make sure it's running
echo   - Ollama:       Run 'ollama serve' for chatbot
echo.
echo   Press any key to open service URLs...
pause >NUL

REM Open URLs in browser
start http://localhost:5000/api/health
start http://localhost:5173
echo.
echo   Services are running in separate windows.
echo   Close those windows to stop the services.
echo.
pause
