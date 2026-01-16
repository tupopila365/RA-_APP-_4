#!/usr/bin/env pwsh

Write-Host "🔧 Fixing Metro Bundler Issues..." -ForegroundColor Cyan

# Navigate to app directory
Set-Location "app"

Write-Host "1. Stopping any running Metro processes..." -ForegroundColor Yellow
# Kill any existing Metro processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "2. Clearing Metro cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "3. If that doesn't work, trying nuclear option..." -ForegroundColor Yellow
Write-Host "   - Clearing npm cache" -ForegroundColor Gray
npm cache clean --force

Write-Host "   - Removing node_modules" -ForegroundColor Gray
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue

Write-Host "   - Removing package-lock.json" -ForegroundColor Gray
Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue

Write-Host "   - Reinstalling dependencies" -ForegroundColor Gray
npm install

Write-Host "4. Starting Expo with fresh cache..." -ForegroundColor Yellow
npx expo start --clear --reset-cache

Write-Host "✅ Metro bundler should now be working!" -ForegroundColor Green
Write-Host "📱 Scan the QR code with Expo Go app on your phone" -ForegroundColor Cyan