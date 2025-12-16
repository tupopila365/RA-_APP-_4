# Nuclear Clean and Rebuild - Complete Reset
# This will completely clean everything and rebuild from scratch

Write-Host "🚨 NUCLEAR CLEAN AND REBUILD" -ForegroundColor Red
Write-Host "=============================" -ForegroundColor Red

# Check directory
if (-not (Test-Path "app\package.json")) {
    Write-Host "❌ Run from RA-_APP-_4 root directory" -ForegroundColor Red
    exit 1
}

Write-Host "🛑 Step 1: Kill all processes" -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 3

Write-Host "🧹 Step 2: Nuclear clean npm" -ForegroundColor Yellow
Set-Location "app"
npm cache clean --force
npm cache verify

Write-Host "🗑️ Step 3: Remove ALL build artifacts" -ForegroundColor Yellow
# Remove node_modules and locks
Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item "yarn.lock" -Force -ErrorAction SilentlyContinue

# Remove Metro cache
Remove-Item "$env:LOCALAPPDATA\Metro" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:TEMP\react-*" -Recurse -Force -ErrorAction SilentlyContinue

# Remove React Native cache
Remove-Item "$env:LOCALAPPDATA\Temp\react-native-*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🗑️ Step 4: Clean Android completely" -ForegroundColor Yellow
Set-Location "android"

# Clean Gradle
if (Test-Path "gradlew.bat") {
    .\gradlew.bat clean --no-daemon
}

# Remove ALL Android build artifacts
$androidDirs = @(
    "build", 
    ".gradle", 
    "app\build", 
    "app\.cxx",
    ".cxx",
    "app\src\main\assets\index.android.bundle",
    "app\src\main\res\drawable-*",
    "app\src\main\res\raw"
)

foreach ($dir in $androidDirs) {
    if (Test-Path $dir) {
        Write-Host "    - Removing $dir..." -ForegroundColor Gray
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Clean Gradle cache globally
Remove-Item "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue

Set-Location ".." # Back to app

Write-Host "🗑️ Step 5: Remove Expo cache" -ForegroundColor Yellow
Remove-Item "$env:USERPROFILE\.expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ".expo" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "📦 Step 6: Fresh install" -ForegroundColor Yellow
npm install --no-cache

Write-Host "🔨 Step 7: Complete prebuild" -ForegroundColor Yellow
npx expo prebuild --platform android --clean --clear

Write-Host "🏗️ Step 8: Build and install" -ForegroundColor Yellow
npx expo run:android --variant debug --no-bundler

Write-Host "✅ Nuclear rebuild complete!" -ForegroundColor Green
Set-Location ".." # Back to root