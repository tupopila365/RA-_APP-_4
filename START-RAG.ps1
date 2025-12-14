Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RAG SERVICE (CHATBOT) - STARTUP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is running
Write-Host "[1/4] Checking Ollama..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   [OK] Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Ollama is not running!" -ForegroundColor Red
    Write-Host "   Please start Ollama first: ollama serve" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}
Write-Host ""

# Check if models are available
Write-Host "[2/4] Checking Ollama models..." -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
    $models = $tags.models.name
    
    if ($models -contains "nomic-embed-text:latest") {
        Write-Host "   [OK] Embedding model found" -ForegroundColor Green
    } else {
        Write-Host "   [WARNING] Embedding model not found" -ForegroundColor Yellow
        Write-Host "   Run: ollama pull nomic-embed-text:latest" -ForegroundColor Yellow
    }
    
    if ($models -contains "llama3.2:1b") {
        Write-Host "   [OK] LLM model found" -ForegroundColor Green
    } else {
        Write-Host "   [WARNING] LLM model not found" -ForegroundColor Yellow
        Write-Host "   Run: ollama pull llama3.2:1b" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [WARNING] Could not check models" -ForegroundColor Yellow
}
Write-Host ""

# Check Python virtual environment
Write-Host "[3/4] Checking Python environment..." -ForegroundColor Yellow
Set-Location rag-service

if (-not (Test-Path "venv")) {
    Write-Host "   [WARNING] Virtual environment not found!" -ForegroundColor Yellow
    Write-Host "   Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Failed to create virtual environment" -ForegroundColor Red
        Write-Host "   Make sure Python 3.12 is installed" -ForegroundColor Yellow
        pause
        exit 1
    }
}

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "   [ERROR] Virtual environment not properly created" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "   [OK] Virtual environment ready" -ForegroundColor Green
Write-Host ""

# Activate virtual environment and install dependencies
Write-Host "   Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Check if dependencies are installed
if (-not (Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "   Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Failed to install dependencies" -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "   [OK] Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Start RAG service
Write-Host "[4/4] Starting RAG Service..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Service will start on http://localhost:8001" -ForegroundColor Cyan
Write-Host "   API docs available at http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
