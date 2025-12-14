# React Native Expo Android Build Fix Script
# Fixes Kotlin/KSP version mismatch and cleans all caches
# Compatible with Expo SDK 54 and React Native 0.76.6

param(
    [switch]$SkipClean = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# Color functions for better output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }

Write-Info "🚀 React Native Expo Android Build Fix Script"
Write-Info "================================================"

# Check if we're in the correct directory
if (-not (Test-Path "app/package.json")) {
    Write-Error "❌ Please run this script from the RA-_APP-_4 root directory"
    exit 1
}

# Step 1: Update Android Gradle Plugin and Kotlin versions
Write-Info "📝 Step 1: Updating Android build configuration..."

$buildGradlePath = "app/android/build.gradle"
$buildGradleContent = Get-Content $buildGradlePath -Raw

# Update Kotlin version to 2.0.21 (compatible with RN 0.76.6)
$buildGradleContent = $buildGradleContent -replace "kotlinVersion = '[^']*'", "kotlinVersion = '2.0.21'"

# Update Android Gradle Plugin to 8.7.3
$buildGradleContent = $buildGradleContent -replace "classpath\('com\.android\.tools\.build:gradle:[^']*'\)", "classpath('com.android.tools.build:gradle:8.7.3')"

Set-Content $buildGradlePath $buildGradleContent
Write-Success "✅ Updated Kotlin to 2.0.21 and Android Gradle Plugin to 8.7.3"

# Step 2: Add KSP plugin configuration if needed
$appBuildGradlePath = "app/android/app/build.gradle"
$appBuildGradleContent = Get-Content $appBuildGradlePath -Raw

# Check if KSP plugin is already configured
if ($appBuildGradleContent -notmatch 'com\.google\.devtools\.ksp') {
    Write-Info "📝 Adding KSP plugin configuration..."
    
    # Add KSP plugin after Kotlin plugin
    $appBuildGradleContent = $appBuildGradleContent -replace 'apply plugin: "org\.jetbrains\.kotlin\.android"', "apply plugin: `"org.jetbrains.kotlin.android`"`napply plugin: `"com.google.devtools.ksp`""
    
    Set-Content $appBuildGradlePath $appBuildGradleContent
    Write-Success "✅ Added KSP plugin configuration"
}

# Step 3: Update root build.gradle with KSP classpath
$rootBuildGradleContent = Get-Content $buildGradlePath -Raw
if ($rootBuildGradleContent -notmatch 'com\.google\.devtools\.ksp') {
    Write-Info "📝 Adding KSP classpath to root build.gradle..."
    
    $rootBuildGradleContent = $rootBuildGradleContent -replace 'classpath\("org\.jetbrains\.kotlin:kotlin-gradle-plugin:\$kotlinVersion"\)', "classpath(`"org.jetbrains.kotlin:kotlin-gradle-plugin:`$kotlinVersion`")`n        classpath(`"com.google.devtools.ksp:com.google.devtools.ksp.gradle.plugin:2.0.21-1.0.28`")"
    
    Set-Content $buildGradlePath $rootBuildGradleContent
    Write-Success "✅ Added KSP classpath"
}

if (-not $SkipClean) {
    # Step 4: Clean all caches and builds
    Write-Info "🧹 Step 4: Cleaning all caches and builds..."
    
    # Navigate to app directory
    Push-Location "app"
    
    try {
        # Stop Metro bundler if running
        Write-Info "🛑 Stopping Metro bundler..."
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Clean npm cache
        Write-Info "🧹 Cleaning npm cache..."
        npm cache clean --force
        
        # Remove node_modules
        Write-Info "🗑️ Removing node_modules..."
        if (Test-Path "node_modules") {
            Remove-Item "node_modules" -Recurse -Force
        }
        
        # Remove package-lock.json
        Write-Info "🗑️ Removing package-lock.json..."
        if (Test-Path "package-lock.json") {
            Remove-Item "package-lock.json" -Force
        }
        
        # Clean Android builds
        Write-Info "🧹 Cleaning Android builds..."
        Push-Location "android"
        
        # Clean Gradle
        if (Test-Path "gradlew.bat") {
            .\gradlew.bat clean
        } else {
            Write-Warning "⚠️ gradlew.bat not found, skipping Gradle clean"
        }
        
        # Remove Android build directories
        $androidCleanDirs = @("build", ".gradle", "app/build", "app/.cxx")
        foreach ($dir in $androidCleanDirs) {
            if (Test-Path $dir) {
                Write-Info "🗑️ Removing $dir..."
                Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        
        Pop-Location # Back to app directory
        
        # Clean Metro cache
        Write-Info "🧹 Clearing Metro cache..."
        npx expo start --clear
        Start-Sleep -Seconds 2
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Clean React Native cache
        Write-Info "🧹 Clearing React Native cache..."
        npx react-native clean
        
        Write-Success "✅ All caches and builds cleaned"
        
    } finally {
        Pop-Location # Back to root directory
    }
}

# Step 5: Install dependencies
Write-Info "📦 Step 5: Installing dependencies..."
Push-Location "app"

try {
    npm install
    Write-Success "✅ Dependencies installed"
} finally {
    Pop-Location
}

# Step 6: Prebuild Android
Write-Info "🔨 Step 6: Prebuilding Android..."
Push-Location "app"

try {
    npx expo prebuild --platform android --clean
    Write-Success "✅ Android prebuild completed"
} finally {
    Pop-Location
}

# Step 7: Build Android
Write-Info "🏗️ Step 7: Building Android app..."
Push-Location "app"

try {
    if ($Verbose) {
        npx expo run:android --variant debug --verbose
    } else {
        npx expo run:android --variant debug
    }
    Write-Success "✅ Android build completed successfully!"
} catch {
    Write-Error "❌ Android build failed: $($_.Exception.Message)"
    Write-Info "💡 Try running with -Verbose flag for more details"
    Write-Info "💡 Or run manually: cd app; npx expo run:android --variant debug --verbose"
} finally {
    Pop-Location
}

Write-Success "🎉 Build fix script completed!"
Write-Info "📱 If build was successful, your app should be running on the connected Android device/emulator"
Write-Info ""
Write-Info "🔧 Manual commands for future reference:"
Write-Info "  Clean and rebuild: cd app; npx expo prebuild --platform android --clean"
Write-Info "  Run Android: cd app; npx expo run:android"
Write-Info "  Clear Metro cache: cd app; npx expo start --clear"