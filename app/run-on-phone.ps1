# Script to run React Native app on connected physical device

Write-Host "Checking for connected devices..." -ForegroundColor Cyan
$devices = adb devices

if ($devices -match "device$") {
    Write-Host "`nDevice(s) found!" -ForegroundColor Green
    Write-Host $devices
    
    # Get device IDs
    $deviceLines = $devices | Select-String "device$"
    $deviceIds = $deviceLines | ForEach-Object { ($_ -split "\s+")[0] }
    
    if ($deviceIds.Count -eq 1) {
        Write-Host "`nRunning on device: $deviceIds" -ForegroundColor Green
        npx expo run:android --device
    } else {
        Write-Host "`nMultiple devices found. Please specify device ID:" -ForegroundColor Yellow
        $deviceIds | ForEach-Object { Write-Host "  - $_" }
        Write-Host "`nRun: npx expo run:android --device-id DEVICE_ID" -ForegroundColor Yellow
    }
} else {
    Write-Host "`nNo physical devices found!" -ForegroundColor Red
    Write-Host "`nPlease:" -ForegroundColor Yellow
    Write-Host "1. Connect your phone via USB"
    Write-Host "2. Enable USB Debugging in Developer Options"
    Write-Host "3. Authorize the computer when prompted"
    Write-Host "4. Run this script again"
    Write-Host "`nCurrent devices:" -ForegroundColor Cyan
    Write-Host $devices
}


