@echo off
echo ============================================================
echo   RAG SERVICE (CHATBOT) - STARTUP
echo ============================================================
echo.

REM Check if Ollama is running
echo [1/4] Checking Ollama...
curl -s http://localhost:11434/api/tags >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Ollama is running
) else (
    echo    [ERROR] Ollama is not running!
    echo    Please start Ollama first: ollama serve
    echo.
    pause
    exit /b 1
)
echo.

REM Check if models are available
echo [2/4] Checking Ollama models...
curl -s http://localhost:11434/api/tags | findstr "nomic-embed-text:latest" >NUL
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Embedding model found
) else (
    echo    [WARNING] Embedding model not found
    echo    Run: ollama pull nomic-embed-text:latest
)

curl -s http://localhost:11434/api/tags | findstr "llama3.2:1b" >NUL
if %ERRORLEVEL% EQU 0 (
    echo    [OK] LLM model found
) else (
    echo    [WARNING] LLM model not found
    echo    Run: ollama pull llama3.2:1b
)
echo.

REM Check Python virtual environment
echo [3/4] Checking Python environment...
cd rag-service
if not exist "venv" (
    echo    [WARNING] Virtual environment not found!
    echo    Please run SETUP-PYTHON-312.bat first
    echo.
    choice /C YN /M "Do you want to set it up now"
    if errorlevel 2 exit /b 1
    call SETUP-PYTHON-312.bat
    if %ERRORLEVEL% NEQ 0 exit /b 1
)

if not exist "venv\Scripts\activate.bat" (
    echo    [ERROR] Virtual environment not properly created
    echo    Please run: SETUP-PYTHON-312.bat
    pause
    exit /b 1
)

echo    [OK] Virtual environment ready
echo.

REM Install dependencies if needed
if not exist "venv\Lib\site-packages\fastapi" (
    echo    Installing Python dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    echo    [OK] Dependencies installed
) else (
    echo    [OK] Dependencies already installed
)
echo.

REM Start RAG service
echo [4/4] Starting RAG Service...
echo.
echo    Service will start on http://localhost:8001
echo    Press Ctrl+C to stop
echo.
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
