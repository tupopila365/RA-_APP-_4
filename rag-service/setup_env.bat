@echo off
REM Setup script for RAG Service Python environment

echo ========================================
echo RAG Service Environment Setup
echo ========================================
echo.

REM Check if Python 3.11 is available
echo [1/6] Checking for Python 3.11...
py -3.11 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python 3.11 not found!
    echo.
    echo Please install Python 3.11 from:
    echo https://www.python.org/downloads/
    echo.
    echo Or use one of these methods:
    echo   - Chocolatey: choco install python311
    echo   - winget: winget install Python.Python.3.11
    echo.
    pause
    exit /b 1
)
echo Python 3.11 found!
py -3.11 --version
echo.

REM Check if virtual environment already exists
if exist "venv\" (
    echo [2/6] Virtual environment already exists.
    echo Do you want to recreate it? (Y/N)
    set /p recreate=
    if /i "%recreate%"=="Y" (
        echo Removing existing virtual environment...
        rmdir /s /q venv
    ) else (
        echo Using existing virtual environment.
        goto :activate
    )
)

REM Create virtual environment
echo [2/6] Creating virtual environment...
py -3.11 -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment!
    pause
    exit /b 1
)
echo Virtual environment created successfully!
echo.

:activate
REM Activate virtual environment
echo [3/6] Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment!
    pause
    exit /b 1
)
echo Virtual environment activated!
echo.

REM Verify Python version
echo [4/6] Verifying Python version...
python --version
echo.

REM Upgrade pip
echo [5/6] Upgrading pip...
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo WARNING: Failed to upgrade pip, continuing anyway...
)
echo.

REM Install dependencies
echo [6/6] Installing dependencies from requirements.txt...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo.
    echo Try installing with binary-only flag:
    echo   pip install -r requirements.txt --only-binary :all:
    echo.
    pause
    exit /b 1
)
echo.

REM Verify installation
echo ========================================
echo Verifying installation...
echo ========================================
python -c "import fastapi; import chromadb; import ollama; import pytest; print('✓ All core dependencies installed successfully!')"
if %errorlevel% neq 0 (
    echo WARNING: Some dependencies may not have installed correctly.
    echo Please check the error messages above.
) else (
    echo.
    echo ========================================
    echo Setup completed successfully!
    echo ========================================
    echo.
    echo Virtual environment is now active.
    echo.
    echo To run the service:
    echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
    echo.
    echo To run tests:
    echo   pytest tests/ -v
    echo.
    echo To deactivate the virtual environment:
    echo   deactivate
    echo.
)

pause
