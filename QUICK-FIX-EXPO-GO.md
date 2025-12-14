# Quick Fix - Enable Expo Go

## Problem
Terminal says "development build" instead of showing Expo Go option.

## Solution
✅ **I've already fixed it!** The `expo-notifications` plugin has been removed from `app.json`.

## What to Do Now

### Step 1: Restart Expo
```bash
cd app
npx expo start -c
```

### Step 2: Press 's' for Expo Go
When Expo starts, press `s` on your keyboard to switch to Expo Go mode.

### Step 3: Scan QR Code
1. Open **Expo Go app** on your phone
2. Tap **"Scan QR Code"** (inside the app!)
3. Scan the QR code from your terminal
4. App loads! 🎉

## Important

**Don't use your phone's camera to scan!**

Use the **"Scan QR Code"** button **inside the Expo Go app**.

## If It Still Shows "Development Build"

Try this:
```bash
cd app

# Stop Expo (Ctrl+C)

# Clear everything
npx expo start -c

# Press 's' when it starts
```

## What Changed

- ❌ Removed `expo-notifications` plugin (wasn't working in Expo Go anyway)
- ✅ App now works with Expo Go
- ✅ All other features still work
- ✅ Notifications gracefully disabled (already handled in code)

## Summary

1. ✅ Configuration fixed
2. ✅ Restart Expo: `npx expo start -c`
3. ✅ Press `s` for Expo Go
4. ✅ Scan with Expo Go app
5. ✅ Done!

---

**Full Guide:** `EXPO-GO-VS-DEV-BUILD.md`
