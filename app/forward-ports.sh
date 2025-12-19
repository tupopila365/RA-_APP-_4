#!/bin/bash

echo "Setting up Android port forwarding..."
echo ""

# Try to find adb
ADB_PATH=""

# Check common Android SDK locations
if [ -f "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB_PATH="$HOME/Library/Android/sdk/platform-tools/adb"
elif [ -f "$HOME/Android/Sdk/platform-tools/adb" ]; then
    ADB_PATH="$HOME/Android/Sdk/platform-tools/adb"
elif command -v adb &> /dev/null; then
    ADB_PATH="adb"
fi

if [ -z "$ADB_PATH" ]; then
    echo "ERROR: ADB not found!"
    echo ""
    echo "Please install Android Studio and add platform-tools to your PATH, or"
    echo "update this script with the correct path to adb"
    exit 1
fi

echo "Found ADB at: $ADB_PATH"
echo ""

# Forward backend port (5000)
echo "Forwarding port 5000 (Backend API)..."
$ADB_PATH reverse tcp:5000 tcp:5000

if [ $? -eq 0 ]; then
    echo "[OK] Port 5000 forwarded successfully"
else
    echo "[ERROR] Failed to forward port 5000"
    echo "Make sure your Android device/emulator is connected and USB debugging is enabled"
fi

echo ""
echo "Port forwarding setup complete!"
echo ""
echo "Your app can now connect to:"
echo "  http://localhost:5000/api"
echo ""

