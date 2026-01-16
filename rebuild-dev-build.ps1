#!/usr/bin/env pwsh

Write-Host "🔧 Rebuilding Development Build with Native Modules..." -ForegroundColor Cyan

# Navigate to app directory
Set-Location "app"

Write-Host "1. Stopping any running processes..." -ForegroundColor Yellow
npx kill-port 8081 -ErrorAction SilentlyContinue

Write-Host "2. Clearing all caches..." -ForegroundColor Yellow
npx expo start --clear
Start-Sleep -Seconds 2

Write-Host "3. Prebuild native directories..." -ForegroundColor Yellow
npx expo prebuild --clean

Write-Host "4. Building development build for Android..." -ForegroundColor Yellow
Write-Host "   This will take several minutes..." -ForegroundColor Gray
npx expo run:android

Write-Host "✅ Development build complete!" -ForegroundColor Green
Write-Host "📱 The app should now have all native modules working" -ForegroundColor Cyan