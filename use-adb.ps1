# Quick ADB Helper Script
# Use this to run ADB commands without adding to PATH

$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (Test-Path $adbPath) {
    Write-Host "✅ Using ADB from: $adbPath" -ForegroundColor Green
    Write-Host ""
    
    # Run ADB with provided arguments
    & $adbPath $args
} else {
    Write-Host "❌ ADB not found!" -ForegroundColor Red
    Write-Host "Expected location: $adbPath" -ForegroundColor Yellow
    exit 1
}







