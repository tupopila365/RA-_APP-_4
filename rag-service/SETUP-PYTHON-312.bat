@echo off
echo ============================================================
echo   RAG Service - Setup with Python 3.12
echo ============================================================
echo.

REM Check if Python 3.12 is available
py -3.12 --version >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python 3.12 not found!
    echo.
    echo Please install Python 3.12 from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo [OK] Python 3.12 found
py -3.12 --version
echo.

REM Remove old virtual environment
if exist "venv" (
    echo Removing old virtual environment...
    rmdir /s /q venv
    echo [OK] Old venv removed
    echo.
)

REM Create new virtual environment with Python 3.12
echo Creating new virtual environment with Python 3.12...
py -3.12 -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment created
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip
echo [OK] Pip upgraded
echo.

REM Install dependencies
echo Installing dependencies from requirements.txt...
echo.
echo Note: Installing NumPy 1.x (ChromaDB requires NumPy ^<2.0)
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Verify installation
echo Verifying installation...
python --version
python -c "import numpy; print('NumPy version:', numpy.__version__)"
python -c "import fastapi; print('FastAPI installed successfully')"
python -c "import chromadb; print('ChromaDB installed successfully')"
echo.

echo ============================================================
echo   SETUP COMPLETE!
echo ============================================================
echo.
echo Your RAG service is ready to run.
echo.
echo To start the service:
echo   1. Make sure Ollama is running: ollama serve
echo   2. Run: START-RAG.bat
echo.
pause
