@echo off
echo ========================================
echo   CHATBOT IMPROVEMENTS SETUP
echo ========================================
echo.
echo This script will:
echo 1. Install Redis for caching
echo 2. Install Python dependencies for RAG service
echo 3. Start all services with improvements
echo.
pause

echo.
echo [1/4] Installing Redis...
echo.

REM Check if Redis is already installed
redis-server --version >nul 2>&1
if %errorlevel% == 0 (
    echo Redis is already installed!
) else (
    echo Installing Redis using Chocolatey...
    choco install redis-64 -y
    if %errorlevel% neq 0 (
        echo.
        echo WARNING: Failed to install Redis via Chocolatey.
        echo Please install Redis manually from: https://redis.io/download
        echo Or use Windows Subsystem for Linux (WSL)
        echo.
        pause
    )
)

echo.
echo [2/4] Installing Python dependencies for RAG service...
echo.
cd rag-service
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Python dependencies
    echo Please ensure Python and pip are installed
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Starting Redis server...
echo.
start "Redis Server" redis-server
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting all services...
echo.

REM Start backend
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

REM Start RAG service
echo Starting RAG service...
start "RAG Service" cmd /k "cd rag-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 5 /nobreak >nul

REM Start mobile app
echo Starting mobile app...
start "Mobile App" cmd /k "cd app && npx expo start"

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Services started:
echo - Redis Server (localhost:6379)
echo - Backend API (localhost:3000)
echo - RAG Service (localhost:8001)
echo - Mobile App (Expo Dev Server)
echo.
echo IMPROVEMENTS INCLUDED:
echo ✓ Redis caching for faster responses
echo ✓ Improved greeting responses with personality
echo ✓ Character-level streaming for smoother UX
echo ✓ Request timeouts (30s) for better reliability
echo ✓ Relevance filtering for higher quality answers
echo ✓ Quick reply suggestions after bot responses
echo ✓ Enhanced error messages with helpful guidance
echo ✓ Better typing indicators and progress feedback
echo.
echo Press any key to close this window...
pause >nul