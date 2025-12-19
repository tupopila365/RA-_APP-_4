# Quick ADB Commands - Copy and paste these into PowerShell

# Set up ADB alias for this session
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Set-Alias -Name adb -Value $adbPath -Scope Global -ErrorAction SilentlyContinue
    Write-Host "✅ ADB alias set for this session" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can use: adb devices" -ForegroundColor Cyan
    Write-Host "Or: adb reverse tcp:5000 tcp:5000" -ForegroundColor Cyan
} else {
    Write-Host "❌ ADB not found!" -ForegroundColor Red
}

# Common ADB commands:
Write-Host ""
Write-Host "Common ADB Commands:" -ForegroundColor Yellow
Write-Host "  adb devices                    - List connected devices"
Write-Host "  adb reverse tcp:5000 tcp:5000  - Set up port forwarding"
Write-Host "  adb reverse --list             - Show active port forwards"
Write-Host "  adb reverse --remove tcp:5000  - Remove port forwarding"




