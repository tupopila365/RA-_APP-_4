# Simple Android Build Fix Script
# Fixes Kotlin/KSP version mismatch for React Native Expo

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Android Build Fix..." -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "app/package.json")) {
    Write-Host "❌ Please run this script from the RA-_APP-_4 root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build configuration already updated by Kiro IDE" -ForegroundColor Green

# Navigate to app directory
Set-Location "app"

Write-Host "🧹 Cleaning caches and builds..." -ForegroundColor Yellow

# Stop any running Metro processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" -or $_.CommandLine -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean npm cache
Write-Host "  - Cleaning npm cache..." -ForegroundColor Gray
npm cache clean --force

# Remove node_modules and package-lock
Write-Host "  - Removing node_modules..." -ForegroundColor Gray
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}

# Clean Android builds
Write-Host "  - Cleaning Android builds..." -ForegroundColor Gray
Set-Location "android"

if (Test-Path "gradlew.bat") {
    .\gradlew.bat clean
} else {
    Write-Host "    ⚠️ gradlew.bat not found, skipping Gradle clean" -ForegroundColor Yellow
}

# Remove Android build directories
$androidDirs = @("build", ".gradle", "app/build", "app/.cxx")
foreach ($dir in $androidDirs) {
    if (Test-Path $dir) {
        Write-Host "    - Removing $dir..." -ForegroundColor Gray
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Set-Location ".." # Back to app directory

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Clear Metro cache
Write-Host "🧹 Clearing Metro cache..." -ForegroundColor Yellow
Start-Process -FilePath "npx" -ArgumentList "expo", "start", "--clear" -NoNewWindow -PassThru | Out-Null
Start-Sleep -Seconds 3
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Prebuild Android
Write-Host "🔨 Prebuilding Android..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

# Build Android
Write-Host "🏗️ Building Android app..." -ForegroundColor Yellow
try {
    npx expo run:android --variant debug
    Write-Host "✅ Android build completed successfully!" -ForegroundColor Green
    Write-Host "📱 Your app should be running on the connected Android device/emulator" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Android build failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "🔧 Try these manual commands:" -ForegroundColor Yellow
    Write-Host "  cd app" -ForegroundColor Gray
    Write-Host "  npx expo run:android --variant debug --verbose" -ForegroundColor Gray
    exit 1
}

Set-Location ".." # Back to root directory

Write-Host "" -ForegroundColor White
Write-Host "🎉 Build fix completed successfully!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 Quick reference for future builds:" -ForegroundColor Cyan
Write-Host "  cd app" -ForegroundColor Gray
Write-Host "  npx expo run:android" -ForegroundColor Gray
Write-Host "  npx expo start --clear  (to clear Metro cache)" -ForegroundColor Gray