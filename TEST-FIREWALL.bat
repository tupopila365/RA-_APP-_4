@echo off
echo ============================================================
echo   FIREWALL DIAGNOSTIC TEST
echo ============================================================
echo.

REM Get current IP address
echo [1/5] Detecting your computer's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do set CURRENT_IP=%%b
    goto :ip_found
)
:ip_found
set CURRENT_IP=%CURRENT_IP:~1%
echo    Your IP address: %CURRENT_IP%
echo.

REM Check if services are running
echo [2/5] Checking if services are running...
netstat -an | findstr :5000 >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend is running on port 5000
    set BACKEND_RUNNING=1
) else (
    echo    [WARNING] Backend is NOT running on port 5000
    set BACKEND_RUNNING=0
)

netstat -an | findstr :8081 >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Expo dev server is running on port 8081
    set EXPO_RUNNING=1
) else (
    echo    [WARNING] Expo dev server is NOT running on port 8081
    set EXPO_RUNNING=0
)
echo.

REM Test localhost connectivity
echo [3/5] Testing localhost connectivity...
curl -s http://localhost:5000/api/health >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend accessible from localhost
    set LOCALHOST_OK=1
) else (
    echo    [FAIL] Backend NOT accessible from localhost
    set LOCALHOST_OK=0
)
echo.

REM Test network IP connectivity (from this computer)
echo [4/5] Testing network IP connectivity...
echo    Testing: http://%CURRENT_IP%:5000/api/health
curl -s http://%CURRENT_IP%:5000/api/health >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend accessible from network IP
    set NETWORK_OK=1
) else (
    echo    [FAIL] Backend NOT accessible from network IP
    echo    [INFO] This might indicate a firewall issue
    set NETWORK_OK=0
)
echo.

REM Check Windows Firewall rules
echo [5/5] Checking Windows Firewall rules...
echo    Checking if Node.js is allowed through firewall...
netsh advfirewall firewall show rule name="Node.js" >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [INFO] Node.js firewall rule found
    netsh advfirewall firewall show rule name="Node.js" | findstr /i "Enabled.*Yes" >NUL 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Node.js firewall rule is enabled
    ) else (
        echo    [WARNING] Node.js firewall rule might be disabled
    )
) else (
    echo    [WARNING] No Node.js firewall rule found
    echo    [INFO] Node.js might be blocked by firewall
)

echo    Checking port 5000 rules...
netsh advfirewall firewall show rule name=all | findstr /i ":5000" >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [INFO] Found firewall rules for port 5000
) else (
    echo    [WARNING] No specific firewall rules found for port 5000
)

echo    Checking port 8081 rules...
netsh advfirewall firewall show rule name=all | findstr /i ":8081" >NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [INFO] Found firewall rules for port 8081
) else (
    echo    [WARNING] No specific firewall rules found for port 8081
)
echo.

echo ============================================================
echo   DIAGNOSIS RESULTS
echo ============================================================
echo.

if %NETWORK_OK% EQU 0 (
    if %LOCALHOST_OK% EQU 1 (
        echo [FIREWALL ISSUE DETECTED]
        echo.
        echo Backend works on localhost but NOT on network IP.
        echo This strongly suggests a firewall is blocking the connection.
        echo.
        echo SOLUTION: Allow Node.js through Windows Firewall
        echo.
    ) else (
        echo [SERVICE ISSUE]
        echo.
        echo Backend is not accessible even from localhost.
        echo This suggests the backend might not be running properly.
        echo.
    )
) else (
    echo [NETWORK CONNECTION OK]
    echo.
    echo Backend is accessible from network IP.
    echo Firewall is likely NOT the issue.
    echo.
    echo If phone still can't connect, check:
    echo - Phone and computer on same WiFi network
    echo - Expo started with --lan flag
    echo - Phone can ping your computer
    echo.
)

echo ============================================================
echo   FIREWALL FIX INSTRUCTIONS
echo ============================================================
echo.
echo To allow Node.js through Windows Firewall:
echo.
echo METHOD 1: Using Windows Settings (Easiest)
echo ----------------------------------------
echo 1. Open Windows Security
echo 2. Go to: Firewall ^& network protection
echo 3. Click: Allow an app through firewall
echo 4. Click: Change settings (if needed)
echo 5. Find "Node.js" in the list
echo 6. Check both "Private" and "Public" boxes
echo 7. Click OK
echo.
echo METHOD 2: Using Command Line (Quick)
echo ----------------------------------------
echo Run these commands as Administrator:
echo.
echo   netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="%ProgramFiles%\nodejs\node.exe" enable=yes
echo   netsh advfirewall firewall add rule name="Node.js Backend Port 5000" dir=in action=allow protocol=TCP localport=5000 enable=yes
echo   netsh advfirewall firewall add rule name="Expo Dev Server Port 8081" dir=in action=allow protocol=TCP localport=8081 enable=yes
echo.
echo METHOD 3: Test with Firewall Temporarily Disabled
echo ----------------------------------------
echo 1. Windows Security ^> Firewall ^& network protection
echo 2. Turn OFF firewall for Private network (temporarily)
echo 3. Test connection from phone
echo 4. If it works, firewall was the issue - re-enable and use Method 1 or 2
echo 5. Turn firewall back ON after testing
echo.
echo ============================================================
echo   PHONE TEST INSTRUCTIONS
echo ============================================================
echo.
echo Test from your phone browser:
echo.
echo   1. Make sure phone and computer on same WiFi
echo   2. Open phone browser
echo   3. Go to: http://%CURRENT_IP%:5000/api/health
echo   4. Should show: {"status":"ok"}
echo.
echo If this works: Network is fine, issue is with Expo config
echo If this fails: Firewall or network issue
echo.
echo ============================================================
echo   QUICK FIREWALL FIX SCRIPT
echo ============================================================
echo.
echo Run as Administrator: FIX-FIREWALL.bat
echo (This will automatically add firewall rules)
echo.
pause

