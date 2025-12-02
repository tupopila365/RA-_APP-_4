@echo off
echo ============================================================
echo   RAG SERVICE VERIFICATION
echo ============================================================
echo.

REM 1. Check if RAG service is running on port 8001
echo [1/5] Checking RAG Service (Port 8001)...
curl -s http://localhost:8001/ >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] RAG Service is running on port 8001
) else (
    echo    [ERROR] RAG Service is NOT running on port 8001
    echo    Please start it with: START-RAG.bat
    set RAG_RUNNING=0
)
echo.

REM 2. Check if Ollama service is running
echo [2/5] Checking Ollama Service (Port 11434)...
curl -s http://localhost:11434/api/tags >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Ollama service is running
) else (
    echo    [ERROR] Ollama service is NOT running
    echo    Please start it with: ollama serve
    set OLLAMA_RUNNING=0
)
echo.

REM 3. Check if ChromaDB is accessible
echo [3/5] Checking ChromaDB Accessibility...
curl -s http://localhost:8001/health >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    Checking ChromaDB connection via health endpoint...
    curl -s http://localhost:8001/health | findstr "chromadb_connected" >NUL
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] ChromaDB is accessible
    ) else (
        echo    [WARNING] ChromaDB connection status unclear
    )
) else (
    echo    [ERROR] Cannot check ChromaDB (RAG service not responding)
)
echo.

REM 4. Check if embedding model is available
echo [4/5] Checking Embedding Model (nomic-embed-text:latest)...
curl -s http://localhost:11434/api/tags 2>NUL | findstr "nomic-embed-text:latest" >NUL
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Embedding model 'nomic-embed-text:latest' is available
) else (
    echo    [ERROR] Embedding model 'nomic-embed-text:latest' NOT found
    echo    Please run: ollama pull nomic-embed-text:latest
    set EMBED_MODEL=0
)
echo.

REM 5. Check if LLM model is available
echo [5/5] Checking LLM Model (llama3.2:1b)...
curl -s http://localhost:11434/api/tags 2>NUL | findstr "llama3.2:1b" >NUL
if %ERRORLEVEL% EQU 0 (
    echo    [OK] LLM model 'llama3.2:1b' is available
) else (
    echo    [ERROR] LLM model 'llama3.2:1b' NOT found
    echo    Please run: ollama pull llama3.2:1b
    set LLM_MODEL=0
)
echo.

echo ============================================================
echo   VERIFICATION SUMMARY
echo ============================================================
echo.

REM Check overall status
if defined RAG_RUNNING (
    echo [X] RAG Service - NOT RUNNING
    echo     Action: Run START-RAG.bat
    echo.
) else (
    echo [✓] RAG Service - RUNNING
)

if defined OLLAMA_RUNNING (
    echo [X] Ollama Service - NOT RUNNING
    echo     Action: Run 'ollama serve' in a separate terminal
    echo.
) else (
    echo [✓] Ollama Service - RUNNING
)

if defined EMBED_MODEL (
    echo [X] Embedding Model - NOT AVAILABLE
    echo     Action: Run 'ollama pull nomic-embed-text:latest'
    echo.
) else (
    echo [✓] Embedding Model - AVAILABLE
)

if defined LLM_MODEL (
    echo [X] LLM Model - NOT AVAILABLE
    echo     Action: Run 'ollama pull llama3.2:1b'
    echo.
) else (
    echo [✓] LLM Model - AVAILABLE
)

echo ============================================================
echo.

REM Provide detailed health check if RAG service is running
if not defined RAG_RUNNING (
    echo Detailed Health Check:
    echo.
    curl -s http://localhost:8001/health
    echo.
    echo.
)

if defined RAG_RUNNING (
    echo RESULT: VERIFICATION FAILED
    echo Please start the required services and try again.
    exit /b 1
)

if defined OLLAMA_RUNNING (
    echo RESULT: VERIFICATION FAILED
    echo Please start the required services and try again.
    exit /b 1
)

if defined EMBED_MODEL (
    echo RESULT: VERIFICATION FAILED
    echo Please pull the required models and try again.
    exit /b 1
)

if defined LLM_MODEL (
    echo RESULT: VERIFICATION FAILED
    echo Please pull the required models and try again.
    exit /b 1
)

echo RESULT: ALL CHECKS PASSED ✓
echo The RAG service is ready to use!
echo.
pause
