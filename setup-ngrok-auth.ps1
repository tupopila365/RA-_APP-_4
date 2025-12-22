# Setup Ngrok Auth Token Script
# This script helps you configure ngrok with your auth token

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ngrok Auth Token Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ Ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: .\install-ngrok.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ngrok is installed" -ForegroundColor Green
Write-Host ""
Write-Host "To get your ngrok auth token:" -ForegroundColor Yellow
Write-Host "1. Go to: https://ngrok.com/signup (create free account if needed)" -ForegroundColor White
Write-Host "2. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
Write-Host "3. Copy your auth token" -ForegroundColor White
Write-Host ""

$authToken = Read-Host "Paste your ngrok auth token here"

if ([string]::IsNullOrWhiteSpace($authToken)) {
    Write-Host "❌ No token provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuring ngrok with your auth token..." -ForegroundColor Cyan
ngrok config add-authtoken $authToken

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Ngrok configured successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now start ngrok with:" -ForegroundColor Yellow
    Write-Host "  ngrok http 5000" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the startup script:" -ForegroundColor Yellow
    Write-Host "  .\start-backend-with-ngrok.bat" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to configure ngrok. Please check your token." -ForegroundColor Red
    Write-Host "You can also run manually: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Yellow
}

