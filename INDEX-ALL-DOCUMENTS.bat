@echo off
echo ========================================
echo Index All Documents in Data Folder
echo ========================================
echo.

cd rag-service

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

echo.
echo Starting batch indexing of all PDFs in data/documents folder...
echo.

python index_all_local_pdfs.py

echo.
echo ========================================
echo Indexing process completed!
echo ========================================
pause


















