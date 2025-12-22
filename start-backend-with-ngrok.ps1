# Start Backend with Ngrok Tunnel (PowerShell version)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend with Ngrok Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ Ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok first:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\install-ngrok.ps1" -ForegroundColor White
    Write-Host "  2. Or download from: https://ngrok.com/download" -ForegroundColor White
    exit 1
}

# Change to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "[1/3] Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

Write-Host "[2/3] Waiting for backend to start (5 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "IMPORTANT: Copy the HTTPS URL below!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "The ngrok URL will look like: https://abc123.ngrok-free.app" -ForegroundColor White
Write-Host ""
Write-Host "After ngrok starts, you'll need to:" -ForegroundColor Cyan
Write-Host "  1. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)" -ForegroundColor White
Write-Host "  2. Update app/config/env.js with this URL" -ForegroundColor White
Write-Host "  3. Restart your Expo app" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# Start ngrok
Write-Host "[3/3] Starting ngrok tunnel..." -ForegroundColor Cyan
ngrok http 5000

