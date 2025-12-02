@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Ollama Models Setup Script
echo ========================================
echo.
echo This script will:
echo 1. Check if Ollama is running
echo 2. List currently installed models
echo 3. Install required models if missing
echo 4. Verify installation
echo.
pause

REM Check if Ollama is running
echo.
echo [Step 1] Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Ollama is NOT running
    echo.
    echo Please start Ollama first:
    echo   1. Open a new terminal
    echo   2. Run: ollama serve
    echo   3. Keep that terminal open
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)
echo ✓ Ollama is running
echo.

REM List current models
echo [Step 2] Listing currently installed models...
ollama list
echo.

REM Check if nomic-embed-text:latest is installed
echo [Step 3] Checking for nomic-embed-text:latest model...
ollama list | findstr /C:"nomic-embed-text:latest" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ nomic-embed-text:latest not found
    echo.
    echo Installing nomic-embed-text:latest (274 MB)...
    echo This may take a few minutes...
    ollama pull nomic-embed-text:latest
    if %errorlevel% neq 0 (
        echo ✗ Failed to install nomic-embed-text:latest
        pause
        exit /b 1
    )
    echo ✓ nomic-embed-text:latest installed successfully
) else (
    echo ✓ nomic-embed-text:latest is already installed
)
echo.

REM Check if llama3.2:1b is installed
echo [Step 4] Checking for llama3.2:1b model...
ollama list | findstr /C:"llama3.2:1b" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ llama3.2:1b not found
    echo.
    echo Installing llama3.2:1b (4.7 GB)...
    echo This will take several minutes depending on your internet speed...
    ollama pull llama3.2:1b
    if %errorlevel% neq 0 (
        echo ✗ Failed to install llama3.2:1b
        pause
        exit /b 1
    )
    echo ✓ llama3.2:1b installed successfully
) else (
    echo ✓ llama3.2:1b is already installed
)
echo.

REM Verify installation
echo [Step 5] Verifying installation...
echo.
echo Final model list:
ollama list
echo.

REM Test models
echo [Step 6] Testing models...
echo.
echo Testing nomic-embed-text:latest...
echo test | ollama run nomic-embed-text:latest >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ nomic-embed-text:latest is working
) else (
    echo ⚠ nomic-embed-text:latest test failed
)

echo.
echo Testing llama3.2:1b...
echo Hello | ollama run llama3.2:1b >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ llama3.2:1b is working
) else (
    echo ⚠ llama3.2:1b test failed
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start your RAG service:
echo    cd RA-_APP-_4\rag-service
echo    venv\Scripts\activate
echo    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
echo.
echo 2. Check RAG service health:
echo    curl http://localhost:8001/health
echo.
echo 3. Check model status:
echo    curl http://localhost:8001/api/models/status
echo.
pause
