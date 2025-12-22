# Install Ngrok Script
# This script helps you install ngrok on Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ngrok Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is already installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if ($ngrokInstalled) {
    Write-Host "✅ Ngrok is already installed!" -ForegroundColor Green
    ngrok version
    Write-Host ""
    Write-Host "You can skip to step 2: Getting your auth token" -ForegroundColor Yellow
    exit 0
}

Write-Host "Ngrok is not installed. Choose installation method:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Using Chocolatey (Recommended)" -ForegroundColor Cyan
Write-Host "  Run: choco install ngrok" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Manual Download" -ForegroundColor Cyan
Write-Host "  1. Go to: https://ngrok.com/download" -ForegroundColor White
Write-Host "  2. Download Windows version" -ForegroundColor White
Write-Host "  3. Extract to C:\ngrok" -ForegroundColor White
Write-Host "  4. Add C:\ngrok to your PATH" -ForegroundColor White
Write-Host ""

$installChoice = Read-Host "Do you want to install via Chocolatey now? (y/n)"

if ($installChoice -eq 'y' -or $installChoice -eq 'Y') {
    # Check if Chocolatey is installed
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    
    if (-not $chocoInstalled) {
        Write-Host "❌ Chocolatey is not installed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Install Chocolatey first:" -ForegroundColor Yellow
        Write-Host "  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor White
        Write-Host ""
        Write-Host "Or download ngrok manually from: https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Installing ngrok via Chocolatey..." -ForegroundColor Cyan
    choco install ngrok -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ngrok installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next step: Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Yellow
        Write-Host "Then run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Installation failed. Please install manually." -ForegroundColor Red
    }
} else {
    Write-Host "Please install ngrok manually from: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation, run this script again to continue setup." -ForegroundColor Yellow
}

