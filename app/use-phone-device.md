# Using Your Physical Phone as a Device

## Step 1: Enable Developer Options on Your Phone

1. Go to **Settings** → **About Phone**
2. Find **Build Number** (or **MIUI Version** for Xiaomi)
3. Tap it **7 times** until you see "You are now a developer!"

## Step 2: Enable USB Debugging

1. Go back to **Settings** → **Developer Options** (or **Additional Settings** → **Developer Options**)
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)
4. Enable **USB Debugging (Security Settings)** (if available on some phones)

## Step 3: Connect Your Phone

1. Connect your phone to your PC via USB cable
2. On your phone, you'll see a popup asking "Allow USB debugging?"
3. Check **"Always allow from this computer"** and tap **OK**

## Step 4: Verify Connection

Run this command in PowerShell:
```powershell
adb devices
```

You should see your device listed. If it shows "unauthorized", check your phone for the authorization popup.

## Step 5: Run App on Your Phone

Once your device is connected, use one of these methods:

### Method 1: Using Expo CLI (Recommended)
```powershell
npx expo run:android --device
```

### Method 2: Specify Device ID
```powershell
# First, get your device ID
adb devices

# Then run with specific device
npx expo run:android --device-id YOUR_DEVICE_ID
```

### Method 3: Using React Native CLI
```powershell
npx react-native run-android --deviceId=YOUR_DEVICE_ID
```

## Troubleshooting

### If device shows as "unauthorized":
- Unplug and replug your USB cable
- Revoke USB debugging authorizations on your phone (Settings → Developer Options)
- Reconnect and authorize again

### If device not detected:
- Try a different USB cable
- Try a different USB port
- Install/update USB drivers for your phone manufacturer
- On some phones, change USB mode to "File Transfer" or "MTP"

### If it still uses emulator:
- Close/shut down the emulator first
- Use `--device` flag explicitly
- Check if emulator is running: `adb devices` (emulator will show as "emulator-XXXX")

## For Wireless Debugging (Android 11+)

1. Enable **Wireless debugging** in Developer Options
2. Note the IP address and port
3. Run: `adb connect IP_ADDRESS:PORT`
4. Then run your app normally


