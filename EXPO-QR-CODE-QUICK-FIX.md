# Expo QR Code - Quick Fix

## Problem
QR code opens browser (localhost) instead of Expo Go app.

## Solution
**Scan the QR code FROM INSIDE Expo Go, not with your camera!**

## Step-by-Step

### 1. Install Expo Go
- **Android:** [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Open Expo Go App
Open the Expo Go app on your phone (not your camera app!)

### 3. Tap "Scan QR Code"
Look for the "Scan QR Code" button in Expo Go

### 4. Scan the QR Code
Point your phone at the QR code on your computer screen

### 5. Wait for App to Load
The app should load in Expo Go!

## ❌ Wrong Way
```
Phone Camera → Scan QR → Browser opens → localhost error
```

## ✅ Right Way
```
Expo Go App → "Scan QR Code" button → Scan → App loads
```

## Alternative: Manual Entry

If scanning doesn't work:

1. Open Expo Go app
2. Tap "Enter URL manually"
3. Look at your terminal for the URL (e.g., `exp://192.168.1.100:8081`)
4. Type or paste it
5. Tap "Connect"

## Alternative: Tunnel Mode

If you have network issues:

```bash
cd app
npx expo start --tunnel
```

Scan the new QR code with Expo Go.

## Key Point

**The QR code MUST be scanned with Expo Go app, not your phone's camera!**

Your phone's camera treats it as a web link, but it's actually an Expo deep link that only works with Expo Go.

---

**Full Guide:** `FIX-QR-CODE-OPENS-BROWSER.md`
