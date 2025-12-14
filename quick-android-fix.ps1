# Quick Android Build Fix - Minimal Version
# Fixes Kotlin/KSP versions and does essential cleaning

Write-Host "🚀 Quick Android Fix Starting..." -ForegroundColor Cyan

# Check directory
if (-not (Test-Path "app/package.json")) {
    Write-Host "❌ Run from RA-_APP-_4 root directory" -ForegroundColor Red
    exit 1
}

# Navigate to app
Set-Location "app"

Write-Host "🧹 Cleaning caches..." -ForegroundColor Yellow

# Clean npm and Metro
npm cache clean --force
npx expo start --clear &
Start-Sleep 3
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Clean Android
Set-Location "android"
if (Test-Path "gradlew.bat") {
    .\gradlew.bat clean
}

# Remove build dirs
Remove-Item "build", ".gradle", "app/build" -Recurse -Force -ErrorAction SilentlyContinue

Set-Location ".." # Back to app

# Reinstall and prebuild
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Remove-Item "node_modules", "package-lock.json" -Recurse -Force -ErrorAction SilentlyContinue
npm install

Write-Host "🔨 Prebuilding Android..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

Write-Host "🏗️ Building Android..." -ForegroundColor Yellow
npx expo run:android --variant debug

Write-Host "✅ Quick fix completed!" -ForegroundColor Green