# PowerShell script to setup Redis for RAG service
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SETTING UP REDIS FOR RAG SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 1: Checking if Redis is installed..." -ForegroundColor Yellow

# Check if Redis is installed
try {
    $redisVersion = redis-server --version 2>$null
    if ($redisVersion) {
        Write-Host "Redis is already installed: $redisVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "Redis is not installed or not in PATH" -ForegroundColor Red
    
    # Try to install with Chocolatey
    Write-Host ""
    Write-Host "Attempting to install Redis using Chocolatey..." -ForegroundColor Yellow
    
    try {
        choco install redis-64 -y
        Write-Host "Redis installed successfully with Chocolatey" -ForegroundColor Green
    } catch {
        Write-Host "Failed to install Redis with Chocolatey" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Redis manually:" -ForegroundColor Yellow
        Write-Host "1. Download Redis from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor White
        Write-Host "2. Or use WSL: wsl --install then sudo apt install redis-server" -ForegroundColor White
        Write-Host "3. Or use Docker: docker run -d -p 6379:6379 redis:alpine" -ForegroundColor White
        Read-Host "Press Enter to continue after installing Redis"
    }
}

Write-Host ""
Write-Host "Step 2: Starting Redis server..." -ForegroundColor Yellow

# Try to start Redis server
try {
    Start-Process "redis-server" -WindowStyle Minimized
    Write-Host "Redis server started" -ForegroundColor Green
} catch {
    Write-Host "Failed to start Redis server directly" -ForegroundColor Red
    
    # Try to start as Windows service
    try {
        Start-Service -Name "Redis" -ErrorAction Stop
        Write-Host "Redis service started" -ForegroundColor Green
    } catch {
        Write-Host "Failed to start Redis service" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Step 3: Waiting for Redis to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Step 4: Testing Redis connection..." -ForegroundColor Yellow

try {
    $pingResult = redis-cli ping 2>$null
    if ($pingResult -eq "PONG") {
        Write-Host "✅ Redis is running and responding to ping" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis is not responding properly" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to Redis" -ForegroundColor Red
    Write-Host "Please check if Redis is installed and running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "REDIS SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Redis should be running on localhost:6379" -ForegroundColor White
Write-Host "You can now start the RAG service" -ForegroundColor White
Write-Host ""