# PowerShell version of rebuild script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REBUILDING APP AFTER CHATBOT FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 1: Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "expo" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "Step 2: Cleaning cache and node_modules..." -ForegroundColor Yellow
Set-Location app
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }
npm cache clean --force

Write-Host ""
Write-Host "Step 3: Installing dependencies (including AsyncStorage)..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Step 4: Clearing Expo cache and starting..." -ForegroundColor Yellow
npx expo install --fix
npx expo start --clear --reset-cache

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "REBUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The app should now start without ExpoCrypto errors." -ForegroundColor Green
Write-Host "If you still see issues, try:" -ForegroundColor Yellow
Write-Host "1. Close this terminal" -ForegroundColor White
Write-Host "2. Run: npx expo run:android (for Android)" -ForegroundColor White
Write-Host "3. Or: npx expo run:ios (for iOS)" -ForegroundColor White