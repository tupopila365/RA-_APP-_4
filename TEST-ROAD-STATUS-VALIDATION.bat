@echo off
echo ========================================
echo Road Status Validation System Tests
echo ========================================
echo.
echo This will test all validation rules:
echo - Namibia coordinate bounds
echo - Required coordinates for critical status
echo - Date logic validation
echo - Change history tracking
echo.
echo Make sure backend is running on port 5001
echo.
pause

node test-road-status-validation.js

echo.
echo ========================================
echo Tests completed
echo ========================================
pause
