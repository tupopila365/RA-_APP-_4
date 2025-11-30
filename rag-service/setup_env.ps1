# Setup script for RAG Service Python environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RAG Service Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python 3.11 is available
Write-Host "[1/6] Checking for Python 3.11..." -ForegroundColor Yellow
try {
    $pythonVersion = & py -3.11 --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Python 3.11 not found"
    }
    Write-Host "Python 3.11 found!" -ForegroundColor Green
    Write-Host $pythonVersion -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "ERROR: Python 3.11 not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.11 from:" -ForegroundColor Yellow
    Write-Host "https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use one of these methods:" -ForegroundColor Yellow
    Write-Host "  - Chocolatey: choco install python311" -ForegroundColor Gray
    Write-Host "  - winget: winget install Python.Python.3.11" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment already exists
if (Test-Path "venv") {
    Write-Host "[2/6] Virtual environment already exists." -ForegroundColor Yellow
    $recreate = Read-Host "Do you want to recreate it? (Y/N)"
    if ($recreate -eq "Y" -or $recreate -eq "y") {
        Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force venv
    }
    else {
        Write-Host "Using existing virtual environment." -ForegroundColor Green
        Write-Host ""
        goto activate
    }
}

# Create virtual environment
Write-Host "[2/6] Creating virtual environment..." -ForegroundColor Yellow
& py -3.11 -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create virtual environment!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Virtual environment created successfully!" -ForegroundColor Green
Write-Host ""

# Activate virtual environment
:activate
Write-Host "[3/6] Activating virtual environment..." -ForegroundColor Yellow

# Check if script execution is allowed
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "WARNING: PowerShell execution policy is Restricted." -ForegroundColor Yellow
    Write-Host "Attempting to enable script execution for current user..." -ForegroundColor Yellow
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "Execution policy updated successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to update execution policy." -ForegroundColor Red
        Write-Host "Please run this command manually:" -ForegroundColor Yellow
        Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
        Read-Host "Press Enter to exit"
        exit 1
    }
}

& .\venv\Scripts\Activate.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to activate virtual environment!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Virtual environment activated!" -ForegroundColor Green
Write-Host ""

# Verify Python version
Write-Host "[4/6] Verifying Python version..." -ForegroundColor Yellow
& python --version
Write-Host ""

# Upgrade pip
Write-Host "[5/6] Upgrading pip..." -ForegroundColor Yellow
& python -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Failed to upgrade pip, continuing anyway..." -ForegroundColor Yellow
}
Write-Host ""

# Install dependencies
Write-Host "[6/6] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
& pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try installing with binary-only flag:" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt --only-binary :all:" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Verify installation
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying installation..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
& python -c "import fastapi; import chromadb; import ollama; import pytest; print('✓ All core dependencies installed successfully!')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Some dependencies may not have installed correctly." -ForegroundColor Yellow
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}
else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Setup completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Virtual environment is now active." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To run the service:" -ForegroundColor Yellow
    Write-Host "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8001" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To run tests:" -ForegroundColor Yellow
    Write-Host "  pytest tests/ -v" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To deactivate the virtual environment:" -ForegroundColor Yellow
    Write-Host "  deactivate" -ForegroundColor Gray
    Write-Host ""
}

Read-Host "Press Enter to exit"
