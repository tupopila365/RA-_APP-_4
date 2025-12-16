# 📱 How to Connect Android Device for Testing

## Option 1: Physical Android Device (Recommended)

### Step 1: Enable Developer Options
1. **Open Settings** on your Android device
2. **Scroll down** to "About Phone" or "About Device"
3. **Find "Build Number"** (might be under "Software Information")
4. **Tap "Build Number" 7 times** rapidly
5. You'll see a message: "You are now a developer!"

### Step 2: Enable USB Debugging
1. **Go back to main Settings**
2. **Look for "Developer Options"** (usually near the bottom)
3. **Turn on "Developer Options"** if it's off
4. **Find "USB Debugging"** and turn it ON
5. **Also enable "Install via USB"** (if available)

### Step 3: Connect Device
1. **Connect your Android device** to your Windows PC using a USB cable
2. **On your phone**, you'll see a popup asking "Allow USB debugging?"
3. **Check "Always allow from this computer"**
4. **Tap "OK"**

### Step 4: Verify Connection
```powershell
# Check if device is detected
adb devices
```
You should see something like:
```
List of devices attached
ABC123DEF456    device
```

## Option 2: Android Studio Emulator

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio

### Step 2: Create Virtual Device
1. **Open Android Studio**
2. **Click "More Actions" → "Virtual Device Manager"**
3. **Click "Create Device"**
4. **Choose a phone** (e.g., Pixel 7)
5. **Select system image** (recommended: API 34, Android 14)
6. **Click "Download"** if needed
7. **Click "Next" → "Finish"**

### Step 3: Start Emulator
1. **In AVD Manager**, click the **▶️ Play button** next to your device
2. **Wait for emulator to boot** (can take 2-3 minutes first time)
3. **Emulator should show Android home screen**

### Step 4: Verify Emulator
```powershell
# Check if emulator is detected
adb devices
```
You should see:
```
List of devices attached
emulator-5554   device
```

## 🚀 Run Your App

Once device/emulator is connected:

```powershell
cd app
npx expo run:android
```

## 🔧 Troubleshooting

### Device Not Detected?
```powershell
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

### USB Debugging Not Working?
1. Try a different USB cable
2. Try different USB ports
3. Install device drivers (Windows may auto-install)
4. Enable "File Transfer" mode on phone

### Emulator Won't Start?
1. Enable Virtualization in BIOS (VT-x/AMD-V)
2. Disable Hyper-V in Windows Features
3. Try creating a new virtual device

### Build Fails?
```powershell
# Clean and retry
cd app/android
.\gradlew.bat clean
cd ..
npx expo run:android
```

## 📋 Quick Commands

```powershell
# Check connected devices
adb devices

# Run on specific device (if multiple)
npx expo run:android --device ABC123DEF456

# Run with verbose output
npx expo run:android --variant debug --verbose

# Start Metro bundler separately
npx expo start
```

## ✅ Success Indicators

When everything works:
- ✅ `adb devices` shows your device
- ✅ App installs automatically
- ✅ App launches on device/emulator
- ✅ No "PlatformConstants" errors
- ✅ Navigation works smoothly

## 🎯 Alternative: Expo Go (Quick Test)

For quick testing without building:
1. **Install Expo Go** from Play Store
2. **Run**: `npx expo start`
3. **Scan QR code** with Expo Go app

Note: Some native features may not work in Expo Go, but it's great for quick UI testing.

---

**Your Android build is ready! Just connect a device and run the app! 🎉**