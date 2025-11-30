@echo off
echo ============================================================
echo   STOPPING ALL SERVICES
echo ============================================================
echo.

echo Stopping Node.js processes (Backend, Admin, Mobile App)...
taskkill /F /IM node.exe 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Node.js services stopped
) else (
    echo    [INFO] No Node.js services were running
)
echo.

echo Stopping Python processes (RAG Service)...
taskkill /F /IM python.exe 2>NUL
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Python services stopped
) else (
    echo    [INFO] No Python services were running
)
echo.

echo ============================================================
echo   ALL SERVICES STOPPED
echo ============================================================
echo.
echo   Note: MongoDB and Ollama are still running (if they were)
echo   To stop them manually:
echo   - MongoDB: Stop the MongoDB service
echo   - Ollama: Close the Ollama terminal window
echo.
pause
