# Android Port Forwarding Guide

This guide helps you set up port forwarding so your Android app can access the backend services running on your development machine.

## 📋 Prerequisites

1. **Android SDK Platform Tools** installed
   - Download from: https://developer.android.com/studio/releases/platform-tools
   - Add to your PATH environment variable

2. **Android Device or Emulator** connected
   - Physical device: Enable USB debugging in Developer Options
   - Emulator: Start from Android Studio or command line

3. **Backend Services Running**
   - Backend API on port 5000
   - RAG Service on port 8001 (optional)

## 🚀 Quick Setup

### Windows
```batch
# Run the setup script
setup-android-port-forwarding.bat
```

### Mac/Linux
```bash
# Make script executable
chmod +x setup-android-port-forwarding.sh

# Run the setup script
./setup-android-port-forwarding.sh
```

### Manual Setup

If you prefer to set up manually:

```bash
# 1. Check if device is connected
adb devices

# 2. Remove existing forwards (optional)
adb reverse --remove-all

# 3. Forward Backend API port
adb reverse tcp:5000 tcp:5000

# 4. Forward RAG Service port (if using chatbot)
adb reverse tcp:8001 tcp:8001

# 5. Verify forwards are active
adb reverse --list
```

## 🔌 Ports Used

| Service | Port | Purpose |
|---------|------|---------|
| Backend API | 5000 | Main API server |
| RAG Service | 8001 | AI Chatbot service |
| Ollama | 11434 | LLM service (usually not needed) |

## 📱 Android App Configuration

Your Android app should be configured to use `localhost` or `127.0.0.1`:

```javascript
// In your Android app config (app/config/env.js)
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    RAG_SERVICE_URL: 'http://localhost:8001', // Optional
  },
  // ...
};
```

## ✅ Verify Setup

1. **Check ADB connection:**
   ```bash
   adb devices
   ```
   Should show your device/emulator

2. **Check port forwards:**
   ```bash
   adb reverse --list
   ```
   Should show:
   ```
   (reverse) tcp:5000 tcp:5000
   (reverse) tcp:8001 tcp:8001
   ```

3. **Test from Android:**
   - Open your app
   - Try to load data (e.g., News, Offices)
   - Check if API calls succeed

## 🔧 Troubleshooting

### Device Not Detected

**Problem:** `adb devices` shows no devices

**Solutions:**
1. **Physical Device:**
   - Enable USB debugging in Developer Options
   - Accept "Allow USB debugging" prompt on device
   - Try different USB cable/port
   - Install device drivers (Windows)

2. **Emulator:**
   - Start emulator from Android Studio
   - Or: `emulator -avd <avd_name>`
   - Wait for emulator to fully boot

### Port Forwarding Fails

**Problem:** `adb reverse` command fails

**Solutions:**
1. Restart ADB server:
   ```bash
   adb kill-server
   adb start-server
   ```

2. Check if port is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

3. Try forwarding to different ports:
   ```bash
   adb reverse tcp:5001 tcp:5000  # Forward 5001 on device to 5000 on host
   ```
   Then update app config to use port 5001

### App Can't Connect

**Problem:** Android app shows network errors

**Solutions:**
1. **Verify services are running:**
   ```bash
   # Check Backend
   curl http://localhost:5000/api/health
   
   # Check RAG Service (if using)
   curl http://localhost:8001/health
   ```

2. **Check firewall:**
   - Windows: Allow Node.js/Python through firewall
   - Mac: System Preferences > Security & Privacy > Firewall

3. **Use IP address instead:**
   If port forwarding doesn't work, use your computer's local IP:
   ```bash
   # Find your IP
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   
   Then in app config:
   ```javascript
   API_BASE_URL: 'http://192.168.1.XXX:5000/api'
   ```
   
   **Important:** Device and computer must be on same WiFi network

## 🔄 Alternative: Use Local IP Address

Instead of port forwarding, you can configure your Android app to use your computer's local IP address:

1. **Find your local IP:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address: 192.168.x.x
   
   # Mac/Linux
   ifconfig
   # Look for inet: 192.168.x.x
   ```

2. **Update app config:**
   ```javascript
   API_BASE_URL: 'http://192.168.1.XXX:5000/api'
   ```

3. **Ensure same network:**
   - Android device and computer on same WiFi
   - Firewall allows connections on port 5000

## 📝 Notes

- Port forwards persist until:
  - Device is disconnected
  - ADB server is restarted
  - You run `adb reverse --remove-all`

- For production builds, use actual server URLs, not localhost

- Port forwarding only works for USB-connected devices or emulators
- For WiFi debugging, use local IP address method instead

## 🆘 Still Having Issues?

1. Check ADB version: `adb version`
2. Restart ADB: `adb kill-server && adb start-server`
3. Check backend logs for connection attempts
4. Verify Android app has INTERNET permission in AndroidManifest.xml

