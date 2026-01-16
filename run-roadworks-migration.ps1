#!/usr/bin/env pwsh

Write-Host "Running roadworks schema migration..." -ForegroundColor Green

# Change to backend directory
Set-Location "backend"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found in backend directory" -ForegroundColor Red
    Write-Host "Please ensure the backend .env file exists with MongoDB connection details" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Check if MongoDB connection string is set
if (-not $env:MONGODB_URI) {
    Write-Host "Error: MONGODB_URI not found in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "MongoDB URI: $($env:MONGODB_URI.Substring(0, 20))..." -ForegroundColor Cyan

# Run the migration
Write-Host "Executing migration..." -ForegroundColor Yellow

try {
    # Use ts-node to run the TypeScript migration directly
    npx ts-node src/migrations/002-update-roadworks-schema.ts up
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Changes made:" -ForegroundColor Cyan
        Write-Host "• Added 'region' field to all roadworks (required)" -ForegroundColor White
        Write-Host "• Added 'published' field (defaults based on status)" -ForegroundColor White
        Write-Host "• Added 'priority' field (defaults based on status)" -ForegroundColor White
        Write-Host "• Updated status values to new enum" -ForegroundColor White
        Write-Host "• Created new database indexes" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now restart your backend server to use the updated schema." -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Migration failed with error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Return to original directory
Set-Location ".."

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend server: npm run dev (in backend directory)" -ForegroundColor White
Write-Host "2. Test the admin panel road status functionality" -ForegroundColor White
Write-Host "3. Test the mobile app road status screen" -ForegroundColor White