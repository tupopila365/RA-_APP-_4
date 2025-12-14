# Step-by-Step Android Fix
# Handles each issue individually

Write-Host "🔧 Android Build Fix - Step by Step" -ForegroundColor Cyan

# Check directory
if (-not (Test-Path "app\package.json")) {
    Write-Host "❌ Run from RA-_APP-_4 root directory" -ForegroundColor Red
    exit 1
}

Set-Location "app"

Write-Host "🛑 Step 1: Stop all processes" -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "🧹 Step 2: Clean npm cache" -ForegroundColor Yellow
npm cache clean --force

Write-Host "🗑️ Step 3: Remove node_modules" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
    Write-Host "   ✅ node_modules removed" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "   ✅ package-lock.json removed" -ForegroundColor Green
}

Write-Host "📦 Step 4: Install dependencies" -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Step 5: Clean Android builds" -ForegroundColor Yellow
Set-Location "android"

# Clean with gradlew
if (Test-Path "gradlew.bat") {
    Write-Host "   - Running gradlew clean..." -ForegroundColor Gray
    .\gradlew.bat clean --no-daemon
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Gradle clean successful" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Gradle clean had issues, continuing..." -ForegroundColor Yellow
    }
}

# Remove build directories
$dirs = @("build", ".gradle", "app\build", "app\.cxx")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removed $dir" -ForegroundColor Green
    }
}

Set-Location ".." # Back to app

Write-Host "🔨 Step 6: Prebuild Android" -ForegroundColor Yellow
npx expo prebuild --platform android --clean
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prebuild successful" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prebuild failed" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "📱 Step 7: Check for Android device/emulator" -ForegroundColor Yellow
$adbCheck = & adb devices 2>$null
if ($adbCheck -match "device$") {
    Write-Host "   ✅ Android device/emulator found" -ForegroundColor Green
    
    Write-Host "🏗️ Step 8: Build and run Android" -ForegroundColor Yellow
    npx expo run:android --variant debug
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 SUCCESS! Android app built and running!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed. Try running manually:" -ForegroundColor Red
        Write-Host "   cd app" -ForegroundColor Gray
        Write-Host "   npx expo run:android --variant debug --verbose" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️ No Android device/emulator detected" -ForegroundColor Yellow
    Write-Host "   📋 To complete the setup:" -ForegroundColor Cyan
    Write-Host "   1. Connect an Android device with USB debugging enabled, OR" -ForegroundColor Gray
    Write-Host "   2. Start an Android emulator from Android Studio" -ForegroundColor Gray
    Write-Host "   3. Then run: npx expo run:android" -ForegroundColor Gray
}

Set-Location ".." # Back to root