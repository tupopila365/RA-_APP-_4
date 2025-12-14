@echo off
echo ============================================================
echo   MOBILE APP - CLEANUP AND INSTALL
echo ============================================================
echo.
echo This script will:
echo 1. Clean node_modules and caches
echo 2. Free up disk space
echo 3. Install dependencies with fixed versions
echo.
pause

cd app

echo.
echo [1/6] Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    [OK] node_modules removed
) else (
    echo    [INFO] node_modules not found
)

echo.
echo [2/6] Removing package-lock.json...
if exist package-lock.json (
    del /q package-lock.json
    echo    [OK] package-lock.json removed
) else (
    echo    [INFO] package-lock.json not found
)

echo.
echo [3/6] Clearing npm cache...
call npm cache clean --force
echo    [OK] npm cache cleared

echo.
echo [4/6] Clearing Expo cache...
echo    This may take a moment...
call npx expo start -c --non-interactive >nul 2>&1
echo    [OK] Expo cache cleared

echo.
echo [5/6] Checking disk space...
echo    Available space on C: drive:
for /f "tokens=3" %%a in ('dir c:\ ^| find "bytes free"') do echo    %%a bytes free
echo.
echo    You need at least 500MB free for installation
echo    If you don't have enough space, press Ctrl+C to cancel
echo    and free up some space first.
echo.
pause

echo.
echo [6/6] Installing dependencies...
echo    This may take 5-10 minutes...
echo.
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   INSTALLATION COMPLETE!
    echo ============================================================
    echo.
    echo   Next steps:
    echo   1. Test the app: npm start
    echo   2. Try downloading a PDF from Tenders or Vacancies
    echo   3. Verify no React version warnings
    echo.
) else (
    echo.
    echo ============================================================
    echo   INSTALLATION FAILED
    echo ============================================================
    echo.
    echo   Possible solutions:
    echo   1. Free up more disk space (need 500MB+)
    echo   2. Try: npm install --legacy-peer-deps
    echo   3. Check the error message above
    echo.
)

pause
