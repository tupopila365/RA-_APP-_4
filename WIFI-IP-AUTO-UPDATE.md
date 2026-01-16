# WiFi IP Auto-Update System

This system automatically detects your current WiFi IP address and updates your mobile app configuration accordingly. No more manual IP address updates when switching networks!

## 🚀 Quick Start

### Method 1: Using Batch File (Easiest)
```bash
# Double-click or run in command prompt
update-wifi-ip.bat
```

### Method 2: Using PowerShell
```powershell
# Run once
.\update-wifi-ip.ps1

# Run with specific port
.\update-wifi-ip.ps1 -Port 5001

# Run in watch mode (continuously monitor)
.\update-wifi-ip.ps1 -Watch
```

### Method 3: Using Node.js directly
```bash
# Update once
node auto-update-wifi-ip.js

# Update with specific port
node auto-update-wifi-ip.js 5001

# Watch mode
node auto-update-wifi-ip.js --watch
```

### Method 4: Using npm scripts
```bash
# Update once
npm run update-wifi

# Watch mode
npm run update-wifi-watch

# Update with port 5001
npm run update-wifi-port
```

## 🔧 Features

### ✅ Automatic Detection
- Detects your current WiFi IP address automatically
- Works across different network adapters
- Prioritizes WiFi interfaces over other connections
- Excludes virtual machine and internal interfaces

### ✅ Smart Updates
- Only updates configuration when IP actually changes
- Preserves existing port configuration
- Adds timestamps to track when updates occurred
- Validates backend connectivity before updating

### ✅ Watch Mode
- Continuously monitors for IP address changes
- Automatically updates configuration when you switch networks
- Runs in the background with minimal resource usage
- Graceful shutdown with Ctrl+C

### ✅ Cross-Platform
- Works on Windows, macOS, and Linux
- Uses platform-specific network detection methods
- Fallback methods ensure reliability

## 📋 What It Does

1. **Detects WiFi IP**: Scans network interfaces to find your current WiFi IP
2. **Reads Current Config**: Checks your current `app/config/env.js` settings
3. **Compares**: Only updates if the IP has actually changed
4. **Tests Connection**: Verifies backend is accessible on the new IP
5. **Updates Config**: Modifies the `API_BASE_URL` in your env.js file
6. **Provides Feedback**: Shows success/error messages and next steps

## 🔍 Example Output

```
🔍 Auto WiFi IP Detection Started
=====================================
ℹ️  Found WiFi IP via interface WiFi: 192.168.1.198
ℹ️  Detected WiFi IP: 192.168.1.198
ℹ️  Current env.js IP: 192.168.11.52:5001
ℹ️  Testing backend connection on 192.168.1.198:5001...
✅ Backend is accessible on 192.168.1.198:5001
✅ Updated env.js with new IP: 192.168.1.198:5001
✅ Configuration updated successfully!
ℹ️  Remember to restart your mobile app to pick up the new configuration
```

## 🛠️ Configuration

The script automatically detects:
- **WiFi IP Address**: Your current network IP
- **Backend Port**: Uses 5001 by default (configurable)
- **Config File**: `app/config/env.js`

### Custom Port
If your backend runs on a different port:
```bash
node auto-update-wifi-ip.js 3000  # Use port 3000
```

## 🔄 Watch Mode

Perfect for development when you frequently switch networks:

```bash
node auto-update-wifi-ip.js --watch
```

Watch mode will:
- Check for IP changes every 30 seconds
- Automatically update configuration when IP changes
- Run continuously until you stop it (Ctrl+C)
- Show timestamps for all changes

## 🚨 Troubleshooting

### Script Can't Find WiFi IP
- Make sure you're connected to WiFi
- Try running as administrator
- Check if your WiFi adapter has a standard name

### Backend Connection Test Fails
- Ensure your backend server is running
- Check if the port is correct
- Verify firewall settings
- The script will still update the config even if backend is not running

### Configuration Not Updating
- Check file permissions on `app/config/env.js`
- Ensure the file exists and has the expected format
- Run the script from the project root directory

## 📁 Files Created

- `auto-update-wifi-ip.js` - Main Node.js script
- `update-wifi-ip.bat` - Windows batch file
- `update-wifi-ip.ps1` - PowerShell script
- `WIFI-IP-AUTO-UPDATE.md` - This documentation

## 🔗 Integration

### Add to Your Workflow
1. **Before starting development**: Run `update-wifi-ip.bat`
2. **When switching networks**: The watch mode handles this automatically
3. **In your startup script**: Add the update command before starting Expo

### Example Startup Script
```batch
@echo off
echo Starting development environment...
call update-wifi-ip.bat
cd app
npm start
```

## 💡 Tips

- **Use watch mode** during development for automatic updates
- **Run once** when you switch to a new network
- **Check the output** to ensure backend connectivity
- **Restart your mobile app** after configuration updates
- **Keep the script running** in watch mode for seamless network switching

## 🎯 Benefits

- ✅ **No more manual IP updates**
- ✅ **Seamless network switching**
- ✅ **Automatic backend connectivity testing**
- ✅ **Development workflow optimization**
- ✅ **Cross-platform compatibility**
- ✅ **Real-time monitoring with watch mode**

Your mobile app will now automatically adapt to network changes! 🎉