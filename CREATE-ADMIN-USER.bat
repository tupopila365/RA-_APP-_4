@echo off
echo ============================================================
echo   CREATING SUPER ADMIN USER
echo ============================================================
echo.

cd backend
call npm run create:admin

echo.
echo ============================================================
echo   Done! Check the output above for login credentials.
echo ============================================================
pause

























