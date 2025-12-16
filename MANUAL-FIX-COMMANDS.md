# Manual Android Build Fix Commands

## ✅ Version Fix Already Applied
Kiro IDE has already updated your `app/android/build.gradle` with the correct versions:
- Kotlin: 2.0.21 ✅
- Android Gradle Plugin: 8.7.3 ✅  
- KSP: 2.0.21-1.0.28 ✅

## 🔧 Manual Fix Steps

Run these commands **one by one** in PowerShell from the `RA-_APP-_4` directory:

### Step 1: Navigate and Clean
```powershell
cd app
```

### Step 2: Stop Processes
```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 3: Clean npm
```powershell
npm cache clean --force
```

### Step 4: Remove node_modules
```powershell
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
```

### Step 5: Install dependencies
```powershell
npm install
```

### Step 6: Clean Android builds
```powershell
cd android
.\gradlew.bat clean --no-daemon
Remove-Item build -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .gradle -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item app\build -Recurse -Force -ErrorAction SilentlyContinue
cd ..
```

### Step 7: Prebuild
```powershell
npx expo prebuild --platform android --clean
```

### Step 8: Check for device
```powershell
adb devices
```
You should see a device listed. If not:
- Connect Android device with USB debugging enabled, OR
- Start Android emulator from Android Studio

### Step 9: Build and run
```powershell
npx expo run:android --variant debug
```

If build fails, try with verbose output:
```powershell
npx expo run:android --variant debug --verbose
```

### Step 10: Return to root
```powershell
cd ..
```

## 🚨 If You Get Errors

### Error: "expo module not found"
```powershell
npm install expo
```

### Error: "No Android device found"
1. Enable USB debugging on your Android device
2. Or start an Android emulator in Android Studio
3. Run `adb devices` to verify connection

### Error: Gradle build fails
```powershell
cd app\android
.\gradlew.bat clean --stacktrace
cd ..\..
```

### Error: Metro bundler issues
```powershell
cd app
npx expo start --clear
# Wait 3 seconds, then Ctrl+C to stop
cd ..
```

## 🎯 Quick Test Commands

After successful build, test these:

```powershell
cd app
npx expo start
```

Then scan QR code with Expo Go app, or press 'a' for Android.

## 📱 Expected Result

After successful completion:
- ✅ No "PlatformConstants could not be found" error
- ✅ App launches on Android device/emulator  
- ✅ Navigation works properly
- ✅ TurboModules load correctly
