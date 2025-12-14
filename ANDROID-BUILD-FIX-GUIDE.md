# Android Build Fix Guide - Kotlin/KSP Version Compatibility

## Problem Summary
- **Runtime Error**: `TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found`
- **Build Error**: `Can't find KSP version for Kotlin version '1.9.10'`
- **Root Cause**: Kotlin version incompatibility with React Native 0.76.6 and Expo SDK 54

## ✅ Solution Applied

### Version Compatibility Matrix
| Component | Old Version | New Version | Reason |
|-----------|-------------|-------------|---------|
| Kotlin | 1.9.10 | **2.0.21** | Compatible with RN 0.76.6 |
| Android Gradle Plugin | 8.1.1 | **8.7.3** | Supports Kotlin 2.0.21 |
| KSP | Not configured | **2.0.21-1.0.28** | Matches Kotlin version |
| Gradle Wrapper | 8.14.3 | 8.14.3 (keep) | Already compatible |

### Files Updated
1. `app/android/build.gradle` - Updated Kotlin and AGP versions
2. Added KSP plugin configuration
3. Updated classpath dependencies

## 🚀 Quick Fix Commands

### Option 1: Automated Script (Recommended)
```powershell
# Full fix with cleaning
.\fix-android-build.ps1

# Quick fix (minimal cleaning)
.\quick-android-fix.ps1

# Skip cleaning (if you want to preserve caches)
.\fix-android-build.ps1 -SkipClean
```

### Option 2: Manual Steps
```powershell
# 1. Navigate to app directory
cd app

# 2. Clean everything
npm cache clean --force
Remove-Item node_modules, package-lock.json -Recurse -Force
npx expo start --clear  # Then stop it after 3 seconds

# 3. Clean Android
cd android
.\gradlew.bat clean
Remove-Item build, .gradle, app/build -Recurse -Force
cd ..

# 4. Reinstall and rebuild
npm install
npx expo prebuild --platform android --clean
npx expo run:android --variant debug
```

## 🔧 Version Compatibility Rules

### Expo SDK 54 Compatible Versions
- **React Native**: 0.76.x
- **Kotlin**: 2.0.21 (required for RN 0.76.6)
- **Android Gradle Plugin**: 8.7.x
- **Gradle**: 8.14.x
- **KSP**: 2.0.21-1.0.28 (must match Kotlin version)

### Key Compatibility Notes
1. **Kotlin 1.9.x is NOT compatible** with React Native 0.76.6
2. **KSP version must match Kotlin version** exactly
3. **Android Gradle Plugin 8.7.x** is required for Kotlin 2.0.21
4. **New Architecture** (Fabric/TurboModules) requires proper Kotlin setup

## 🐛 Troubleshooting Common Issues

### Issue: "PlatformConstants could not be found"
**Cause**: Kotlin version mismatch causing TurboModule registration failure
**Solution**: Update to Kotlin 2.0.21 and clean all caches

### Issue: "KSP version not found"
**Cause**: Missing or incompatible KSP plugin
**Solution**: Add KSP plugin with version matching Kotlin (2.0.21-1.0.28)

### Issue: Build fails with "interface KotlinTopLevelExtension"
**Cause**: Android Gradle Plugin too old for Kotlin 2.0.21
**Solution**: Update AGP to 8.7.3

### Issue: Metro bundler conflicts
**Cause**: Old Metro cache or multiple Metro instances
**Solution**: `npx expo start --clear` and kill all node processes

## 📱 Testing Your Fix

### 1. Verify Build Success
```powershell
cd app
npx expo run:android --variant debug
```

### 2. Check Runtime
- App should launch without "PlatformConstants" error
- Navigation should work properly
- TurboModules should load correctly

### 3. Verify New Architecture
```powershell
# Check if New Architecture is working
adb logcat | findstr "TurboModule\|Fabric"
```

## 🔄 Future Prevention

### Always Use Compatible Versions
```json
// package.json - Keep these aligned
{
  "expo": "~54.0.27",
  "react-native": "0.76.6"
}
```

### Android Configuration Checklist
- [ ] Kotlin version matches RN requirements
- [ ] KSP version matches Kotlin version  
- [ ] Android Gradle Plugin supports Kotlin version
- [ ] New Architecture enabled in gradle.properties
- [ ] Proper classpath dependencies in build.gradle

### Regular Maintenance
```powershell
# Monthly cleanup routine
cd app
npm cache clean --force
npx expo install --fix
npx expo prebuild --platform android --clean
```

## 📚 Reference Links

- [React Native 0.76 Release Notes](https://github.com/facebook/react-native/releases/tag/v0.76.0)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/2024/12-12-sdk-54)
- [Kotlin Compatibility Guide](https://kotlinlang.org/docs/gradle-configure-project.html)
- [Android Gradle Plugin Releases](https://developer.android.com/studio/releases/gradle-plugin)

## 🆘 Emergency Commands

If build still fails, try these nuclear options:

```powershell
# Nuclear option 1: Complete reset
cd app
Remove-Item node_modules, package-lock.json, android/build, android/.gradle, android/app/build -Recurse -Force
npm cache clean --force
npm install
npx expo prebuild --platform android --clean --clear

# Nuclear option 2: Reset Expo configuration
npx expo install --fix
npx expo prebuild --clear

# Nuclear option 3: Reset Android SDK (if desperate)
# Delete ~/.android, ~/.gradle directories and reinstall Android SDK
```