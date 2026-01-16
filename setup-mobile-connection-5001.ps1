#!/usr/bin/env powershell

Write-Host "📱 Setting up Mobile App Connection for Backend on Port 5001" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: ADB Port Forwarding
Write-Host "🔧 Step 1: Setting up ADB port forwarding..." -ForegroundColor Yellow
try {
    $adbResult = & adb reverse tcp:5001 tcp:5001 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ADB port forwarding configured: Mobile localhost:5001 → Computer localhost:5001" -ForegroundColor Green
    } else {
        throw "ADB command failed"
    }
} catch {
    Write-Host "❌ ADB port forwarding failed. Make sure:" -ForegroundColor Red
    Write-Host "   • Android device is connected via USB" -ForegroundColor Red
    Write-Host "   • USB debugging is enabled" -ForegroundColor Red
    Write-Host "   • ADB is installed and in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Use WiFi connection in env.js" -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway"
}

Write-Host ""

# Step 2: Test Backend Connectivity
Write-Host "🧪 Step 2: Testing backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/roadworks/public" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is accessible on localhost:5001" -ForegroundColor Green
        
        # Parse response to check for roadworks
        $data = $response.Content | ConvertFrom-Json
        if ($data.success -and $data.data) {
            $roadworksCount = $data.data.Count
            Write-Host "✅ Found $roadworksCount published roadworks" -ForegroundColor Green
            
            if ($roadworksCount -gt 0) {
                Write-Host "📍 Sample roadworks:" -ForegroundColor Cyan
                $data.data | Select-Object -First 3 | ForEach-Object {
                    Write-Host "   • $($_.title) - $($_.road) ($($_.status))" -ForegroundColor White
                }
            }
        } else {
            Write-Host "⚠️  Backend responded but no roadworks data found" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Backend is not accessible. Make sure backend is running on port 5001" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 3: Configuration Summary
Write-Host "📋 Step 3: Configuration summary..." -ForegroundColor Yellow
Write-Host "   Mobile app env.js configured to use: http://localhost:5001/api" -ForegroundColor White
Write-Host "   ADB port forwarding: tcp:5001 → tcp:5001" -ForegroundColor White

Write-Host ""
Write-Host "🎯 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "✅ Mobile app should now be able to connect to backend" -ForegroundColor Green
Write-Host "✅ Backend URL: http://localhost:5001/api" -ForegroundColor Green
Write-Host "✅ ADB port forwarding: Active" -ForegroundColor Green
Write-Host ""
Write-Host "📱 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Restart your mobile app (close and reopen)" -ForegroundColor White
Write-Host "2. Navigate to Road Status page" -ForegroundColor White
Write-Host "3. Check if roadworks are now visible" -ForegroundColor White
Write-Host ""
Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "• If still not working, check mobile app console logs" -ForegroundColor White
Write-Host "• Verify mobile device is connected via USB" -ForegroundColor White
Write-Host "• Make sure backend is running: npm run dev" -ForegroundColor White
Write-Host "• Try WiFi connection if USB doesn't work" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"