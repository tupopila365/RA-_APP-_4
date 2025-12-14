# Clean and Build Android - Simple Script
# Use this after Kiro IDE has fixed the version compatibility

Write-Host "🚀 Clean and Build Android" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check directory
if (-not (Test-Path "app\package.json")) {
    Write-Host "❌ Run from RA-_APP-_4 root directory" -ForegroundColor Red
    exit 1
}

# Navigate to app
Set-Location "app"

Write-Host "🧹 Step 1: Cleaning..." -ForegroundColor Yellow

# Stop processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean npm
npm cache clean --force

# Remove directories
Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue

# Clean Android
Set-Location "android"
if (Test-Path "gradlew.bat") {
    .\gradlew.bat clean
}
Remove-Item "build", ".gradle", "app\build" -Recurse -Force -ErrorAction SilentlyContinue
Set-Location ".."

Write-Host "📦 Step 2: Installing..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Step 3: Prebuilding..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

Write-Host "🏗️ Step 4: Building..." -ForegroundColor Yellow
npx expo run:android --variant debug

Write-Host "✅ Done!" -ForegroundColor Green