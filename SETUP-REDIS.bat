@echo off
echo ========================================
echo SETTING UP REDIS FOR RAG SERVICE
echo ========================================

echo.
echo Step 1: Checking if Redis is installed...
redis-server --version 2>nul
if %errorlevel% neq 0 (
    echo Redis is not installed or not in PATH
    echo.
    echo Installing Redis using Chocolatey...
    choco install redis-64 -y
    if %errorlevel% neq 0 (
        echo Failed to install Redis with Chocolatey
        echo.
        echo Please install Redis manually:
        echo 1. Download Redis from: https://github.com/microsoftarchive/redis/releases
        echo 2. Or use WSL: wsl --install then sudo apt install redis-server
        echo 3. Or use Docker: docker run -d -p 6379:6379 redis:alpine
        pause
        exit /b 1
    )
) else (
    echo Redis is already installed
)

echo.
echo Step 2: Starting Redis server...
start "Redis Server" redis-server

echo.
echo Step 3: Waiting for Redis to start...
timeout /t 3 /nobreak >nul

echo.
echo Step 4: Testing Redis connection...
redis-cli ping
if %errorlevel% neq 0 (
    echo Failed to connect to Redis
    echo Trying to start Redis service...
    net start redis
    timeout /t 2 /nobreak >nul
    redis-cli ping
    if %errorlevel% neq 0 (
        echo Redis is still not responding
        echo Please check Redis installation
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo REDIS SETUP COMPLETE!
echo ========================================
echo.
echo Redis is running on localhost:6379
echo You can now start the RAG service
echo.
pause