# Fix Port 5000 Issue - Kill processes and restart backend
Write-Host "🔍 Checking for processes using port 5000..." -ForegroundColor Yellow

# Find and kill processes using port 5000
try {
    $connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "🔪 Killing process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "✅ Processes using port 5000 have been terminated" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No processes found using port 5000" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️  Could not check port 5000 usage: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Alternative method - kill by port using netstat
Write-Host "🔍 Double-checking with netstat..." -ForegroundColor Yellow
$netstatOutput = netstat -ano | findstr :5000
if ($netstatOutput) {
    $lines = $netstatOutput -split "`n"
    foreach ($line in $lines) {
        if ($line -match "LISTENING") {
            $parts = $line -split "\s+" | Where-Object { $_ -ne "" }
            if ($parts.Length -ge 5) {
                $pid = $parts[-1]
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "🔪 Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    Write-Host "⚠️  Could not kill process PID $pid" -ForegroundColor Yellow
                }
            }
        }
    }
}

# Wait a moment for processes to fully terminate
Start-Sleep -Seconds 2

# Check if port is now free
Write-Host "🔍 Verifying port 5000 is now free..." -ForegroundColor Yellow
$stillUsed = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($stillUsed) {
    Write-Host "❌ Port 5000 is still in use. You may need to restart your computer." -ForegroundColor Red
    Write-Host "🔍 Current processes using port 5000:" -ForegroundColor Yellow
    foreach ($conn in $stillUsed) {
        $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   - $($process.ProcessName) (PID: $($conn.OwningProcess))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Port 5000 is now free!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Now you can start the backend server:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📱 Or use the startup scripts:" -ForegroundColor Cyan
Write-Host "   .\START-ALL.bat" -ForegroundColor White