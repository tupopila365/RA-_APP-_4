# PLN PDF Generation - Quick Start Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PLN PDF Generation - Quick Start Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing PDF Generation Components..." -ForegroundColor Yellow
node test-pdf-generation-direct.js
Write-Host ""

Write-Host "2. Checking Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Installing backend dependencies..." -ForegroundColor Red
    npm install
}
Write-Host ""

Write-Host "3. Backend Server Status..." -ForegroundColor Yellow
Write-Host "ℹ️  To start backend server, run: npm run dev" -ForegroundColor Blue
Write-Host "ℹ️  Backend will run on http://localhost:3001" -ForegroundColor Blue
Write-Host ""

Write-Host "4. Testing Steps:" -ForegroundColor Yellow
Write-Host "   a) Start backend: npm run dev" -ForegroundColor White
Write-Host "   b) Submit PLN application via mobile app" -ForegroundColor White
Write-Host "   c) Open admin panel" -ForegroundColor White
Write-Host "   d) Go to PLN Applications" -ForegroundColor White
Write-Host "   e) Click 'Download Application Form (PDF)'" -ForegroundColor White
Write-Host ""

Write-Host "5. Alternative Testing:" -ForegroundColor Yellow
Write-Host "   Run: node test-pdf-api-endpoint.js" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Your PLN PDF generation is ready to use!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Set-Location ..