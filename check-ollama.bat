@echo off
echo ========================================
echo Ollama Diagnostic Check
echo ========================================
echo.

echo [1] Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Ollama is running
) else (
    echo ✗ Ollama is NOT running
    echo   Run: ollama serve
    goto :end
)
echo.

echo [2] Listing installed models...
ollama list
echo.

echo [3] Checking API response...
curl -s http://localhost:11434/api/tags
echo.

echo [4] Testing RAG service health...
curl -s http://localhost:8001/health
echo.

:end
echo ========================================
echo Diagnostic complete
echo ========================================
pause
