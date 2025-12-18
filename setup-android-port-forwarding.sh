#!/bin/bash

# ============================================
# Android Port Forwarding Setup Script
# ============================================
# This script sets up ADB port forwarding for Android development
# Forward localhost ports to Android device/emulator

echo "============================================"
echo "  Android Port Forwarding Setup"
echo "============================================"
echo ""

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "[ERROR] ADB not found in PATH"
    echo "Please install Android SDK Platform Tools"
    echo "Download from: https://developer.android.com/studio/releases/platform-tools"
    echo ""
    exit 1
fi

echo "[1/4] Checking ADB connection..."
adb devices
echo ""

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo "[WARNING] No Android device/emulator detected"
    echo "Please:"
    echo "  1. Connect your Android device via USB with USB debugging enabled"
    echo "  2. OR start an Android emulator"
    echo "  3. Then run this script again"
    echo ""
    exit 1
fi

echo "[2/4] Removing existing port forwards (if any)..."
adb reverse --remove-all
echo ""

echo "[3/4] Setting up port forwards..."
echo ""

# Backend API Port (5000)
echo "  Forwarding Backend API: localhost:5000"
if adb reverse tcp:5000 tcp:5000; then
    echo "    [OK] Backend API forwarded successfully"
else
    echo "    [ERROR] Failed to forward Backend API port"
fi

# RAG Service Port (8001)
echo "  Forwarding RAG Service: localhost:8001"
if adb reverse tcp:8001 tcp:8001; then
    echo "    [OK] RAG Service forwarded successfully"
else
    echo "    [ERROR] Failed to forward RAG Service port"
fi

# Ollama Port (11434) - if needed for direct access
echo "  Forwarding Ollama: localhost:11434"
if adb reverse tcp:11434 tcp:11434; then
    echo "    [OK] Ollama forwarded successfully"
else
    echo "    [WARNING] Failed to forward Ollama port (may not be needed)"
fi

echo ""
echo "[4/4] Verifying port forwards..."
adb reverse --list
echo ""

echo "============================================"
echo "  Port Forwarding Complete!"
echo "============================================"
echo ""
echo "Your Android app can now access:"
echo "  - Backend API: http://localhost:5000/api"
echo "  - RAG Service: http://localhost:8001"
echo "  - Ollama: http://localhost:11434"
echo ""
echo "NOTE: Port forwards are active until you:"
echo "  1. Disconnect your device"
echo "  2. Run: adb reverse --remove-all"
echo "  3. Restart ADB server"
echo ""
echo "To verify, check your Android app can connect to the backend."
echo ""

