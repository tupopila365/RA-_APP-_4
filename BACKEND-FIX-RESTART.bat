@echo off
echo ========================================
echo RESTARTING BACKEND AFTER ANALYTICS FIX
echo ========================================

echo.
echo Step 1: Stopping any running backend processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im ts-node-dev.exe 2>nul

echo.
echo Step 2: Clearing TypeScript cache...
cd backend
if exist dist rmdir /s /q dist
if exist .tsbuildinfo del .tsbuildinfo

echo.
echo Step 3: Starting backend server...
npm run dev

echo.
echo ========================================
echo BACKEND RESTART COMPLETE!
echo ========================================
pause