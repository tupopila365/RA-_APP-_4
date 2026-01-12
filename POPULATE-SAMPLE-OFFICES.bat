@echo off
echo.
echo ==========================================
echo  Populating Sample Office Data
echo ==========================================
echo.

cd backend
echo Running office data population script...
node scripts/populate-sample-offices.js

echo.
echo ==========================================
echo  Sample Office Data Population Complete
echo ==========================================
echo.
pause