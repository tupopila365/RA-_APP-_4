# Fix: QR Code Opens Browser Instead of Expo Go

## Problem

When you scan the Expo QR code, it opens a localhost webpage in your phone's browser instead of opening the app in Expo Go.

## Root Cause

Your phone's camera app is treating the QR code as a regular web link instead of an Expo deep link.

## Solutions

### Solution 1: Scan from Within Expo Go (Recommended)

Instead of using your phone's camera, scan the QR code from inside the Expo Go app:

1. **Open Expo Go app** on your phone
2. **Tap "Scan QR Code"** button in the app
3. **Scan the QR code** from your computer screen
4. App should open immediately!

**This is the most reliable method.**

### Solution 2: Use the Connection Code

If scanning doesn't work, use the connection code instead:

1. Look at your terminal where `npm start` is running
2. Find the connection code (e.g., `exp://192.168.1.100:8081`)
3. In Expo Go app, tap **"Enter URL manually"**
4. Type or paste the connection code
5. Tap "Connect"

### Solution 3: Use Tunnel Mode

If you're having network issues, use tunnel mode:

```bash
cd app
npx expo start --tunnel
```

This creates a public URL that works anywhere. Scan the new QR code with Expo Go.

### Solution 4: Check Expo Go Installation

Make sure you have the correct Expo Go app installed:

**Android:**
- App name: "Expo Go"
- Developer: "Expo"
- Download: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

**iOS:**
- App name: "Expo Go"
- Developer: "Expo"
- Download: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Solution 5: Clear Expo Go Cache

If Expo Go is installed but not working:

1. Open Expo Go app
2. Go to Settings (gear icon)
3. Tap "Clear cache"
4. Try scanning again

## Step-by-Step Guide

### For Android:

1. **Install Expo Go** from Google Play Store
2. **Open Expo Go app**
3. **Tap "Scan QR Code"** (camera icon)
4. **Point at the QR code** on your computer
5. **Wait for app to load**

### For iOS:

1. **Install Expo Go** from App Store
2. **Open Expo Go app**
3. **Tap "Scan QR Code"** (on home screen)
4. **Point at the QR code** on your computer
5. **Wait for app to load**

## Common Mistakes

### ❌ Wrong: Using Phone's Camera App
- Opens in browser
- Shows localhost error
- Doesn't work

### ✅ Right: Using Expo Go's Scanner
- Opens in Expo Go
- Loads the app
- Works perfectly

## Troubleshooting

### Issue: "Couldn't load exp://..."

**Cause:** Network connection issue

**Solutions:**
1. Make sure phone and computer on same WiFi
2. Try tunnel mode: `npx expo start --tunnel`
3. Check firewall settings

### Issue: "Something went wrong"

**Cause:** App has errors

**Solutions:**
1. Check terminal for error messages
2. Clear cache: `npx expo start -c`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Issue: QR code not recognized

**Cause:** QR code scanner not working

**Solutions:**
1. Use "Enter URL manually" in Expo Go
2. Copy the exp:// URL from terminal
3. Paste it in Expo Go

## Alternative Methods

### Method 1: Send Link via Email/SMS

1. In terminal, find the URL: `exp://192.168.1.100:8081`
2. Send it to your phone via email or SMS
3. Open the link on your phone
4. Choose "Open in Expo Go"

### Method 2: Use Development Build

If Expo Go continues to have issues, create a development build:

```bash
cd app
npx expo run:android
# or
npx expo run:ios
```

This installs the app directly on your device without needing Expo Go.

## Quick Checklist

- [ ] Expo Go app is installed on phone
- [ ] Opening Expo Go app (not camera app)
- [ ] Using "Scan QR Code" button in Expo Go
- [ ] Phone and computer on same WiFi
- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Expo is running (`npm start` in app folder)

## Visual Guide

### ❌ Wrong Way:
```
Phone Camera App → Scan QR → Opens Browser → localhost error
```

### ✅ Right Way:
```
Expo Go App → Scan QR Code button → Scan QR → App loads in Expo Go
```

## What the QR Code Contains

The QR code contains a URL like:
```
exp://192.168.1.100:8081
```

This is an Expo deep link that only works with Expo Go app, not regular browsers.

## Summary

**The key is to scan the QR code FROM INSIDE the Expo Go app, not with your phone's camera!**

1. ✅ Open **Expo Go app**
2. ✅ Tap **"Scan QR Code"**
3. ✅ Point at QR code
4. ✅ App loads!

**Don't use your phone's camera app to scan the QR code!**

## Still Not Working?

If you've tried everything and it still doesn't work:

1. **Use tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

2. **Or manually enter the URL:**
   - Open Expo Go
   - Tap "Enter URL manually"
   - Type: `exp://192.168.1.100:8081` (use your IP)
   - Tap Connect

3. **Or create a development build:**
   ```bash
   npx expo run:android
   ```

This will install the app directly without needing Expo Go.
