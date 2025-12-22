# Add ADB to PATH (Permanent Solution)
# Run this script as Administrator for system-wide, or as user for user-only

$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools"

if (Test-Path "$adbPath\adb.exe") {
    Write-Host "✅ Found ADB at: $adbPath" -ForegroundColor Green
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    # Check if already in PATH
    if ($currentPath -notlike "*$adbPath*") {
        # Add to PATH
        $newPath = $currentPath + ";$adbPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        
        Write-Host "✅ Added ADB to PATH!" -ForegroundColor Green
        Write-Host "📝 You may need to restart PowerShell for changes to take effect" -ForegroundColor Yellow
        
        # Refresh PATH in current session
        $env:Path += ";$adbPath"
        Write-Host "✅ PATH updated in current session" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  ADB is already in PATH" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Test it with: adb devices" -ForegroundColor Cyan
} else {
    Write-Host "❌ ADB not found at: $adbPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android Studio or download platform-tools from:" -ForegroundColor Yellow
    Write-Host "https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Cyan
}







