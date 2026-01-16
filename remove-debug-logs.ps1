Write-Host "Removing debug logging calls that cause 7243 connection errors..." -ForegroundColor Green

$files = @(
    "backend/src/modules/pln/pln.controller.ts",
    "app/services/plnService.js", 
    "admin/src/services/auth.service.ts",
    "admin/src/services/api.ts",
    "admin/src/components/Auth/LoginForm.tsx"
)

foreach ($file in $files) {
    $fullPath = $file
    if (Test-Path $fullPath) {
        Write-Host "Cleaning $file..." -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        $pattern = '(?s)\s*// #region agent log.*?// #endregion\s*'
        $cleanContent = $content -replace $pattern, ''
        Set-Content $fullPath $cleanContent -NoNewline
        
        Write-Host "Cleaned $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Debug logging cleanup complete!" -ForegroundColor Green
Write-Host "The 7243 connection errors should now be resolved." -ForegroundColor Cyan