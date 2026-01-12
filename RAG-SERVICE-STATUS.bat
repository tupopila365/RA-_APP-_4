@echo off
echo ========================================
echo RAG SERVICE STATUS CHECK
echo ========================================

echo.
echo Checking Redis...
redis-cli ping
if %errorlevel% neq 0 (
    echo ❌ Redis is not running
    echo Run: SETUP-REDIS.bat
) else (
    echo ✅ Redis is running
)

echo.
echo Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama is not running
    echo Start Ollama first
) else (
    echo ✅ Ollama is running
)

echo.
echo Checking RAG Service...
curl -s http://localhost:8001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ RAG Service is not running
    echo Start with: START-RAG.bat
) else (
    echo ✅ RAG Service is running
)

echo.
echo Checking Backend...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend is not running
    echo Start backend: cd backend && npm run dev
) else (
    echo ✅ Backend is running
)

echo.
echo ========================================
echo STATUS CHECK COMPLETE
echo ========================================
pause