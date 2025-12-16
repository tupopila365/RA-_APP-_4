# Fix for "PlatformConstants could not be found" Error

## The Error
```
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found.
```

## The Cause
This error occurs when there is a **mismatch between your JavaScript code and the native Android app** installed on your device/emulator.

This usually happens when:
1. **New Architecture** is enabled (`newArchEnabled=true`) but the installed app was built with the Old Architecture.
2. **React Native was upgraded** (to 0.76.6) but the native app wasn't rebuilt.
3. **Metro Bundler cache** is holding onto old dependency graphs.

## The Solution

### Step 1: Clear Metro Cache
First, try clearing the bundler cache.

```bash
cd app
npx expo start -c
```

If that doesn't work, proceed to Step 2.

### Step 2: Rebuild the Native App (Recommended)
Since you have `expo-dev-client` installed and `newArchEnabled=true` in `android/gradle.properties`, you **MUST** rebuild the native app to ensure the native code matches your JavaScript configuration.

Run this command to rebuild and install the updated app on your Android device/emulator:

```bash
cd app
npx expo run:android
```

**Note:** This will take a few minutes to compile.

### Step 3: Verify New Architecture
Your project is configured for the New Architecture (TurboModules).
- `android/gradle.properties` has `newArchEnabled=true`
- `package.json` has `react-native: 0.76.6`

Ensure your build completes successfully.

### Step 4: If using Expo Go
If you are trying to use Expo Go instead of a Development Build:
1. Stop the development server.
2. Run `npx expo start -c`
3. Press `s` to switch to Expo Go mode.
4. Scan the QR code with the Expo Go app.

**Note:** If you use Expo Go, the `newArchEnabled` setting in `gradle.properties` doesn't affect Expo Go (which is pre-built), but Expo Go SDK 54 supports the New Architecture.

## Summary
The error means your **native binary is outdated**.
**Fix:** Run `npx expo run:android` to rebuild it.
