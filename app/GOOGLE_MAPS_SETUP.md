# 🗺️ Google Maps API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project**
   - Click "Select a project" → "New Project"
   - Name it: "Roads Authority App"
   - Click "Create"

3. **Enable Required APIs**
   - In the search bar, search for "Maps SDK for Android"
   - Click "Maps SDK for Android"
   - Click "ENABLE"
   - Go back and search for "Maps SDK for iOS"
   - Click "Maps SDK for iOS"
   - Click "ENABLE"

4. **Create API Key**
   - Go to "Credentials" in the left menu
   - Click "+ CREATE CREDENTIALS" → "API key"
   - Copy the API key (it will look like: `AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX`)

### Step 2: Add API Key to app.json

Open `app.json` and replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX"
      }
    }
  }
}
```

**⚠️ SECURITY NOTE:**
- Never commit your API key to a public repository
- Add `app.json` to `.gitignore` or use environment variables
- Consider using API key restrictions in Google Cloud Console

### Step 3: Restrict API Key (Recommended)

1. In Google Cloud Console → Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "Android apps"
   - Add your package name: `com.roadsauthority.app`
   - Add SHA-1 certificate fingerprint (get from your keystore)
4. Under "API restrictions":
   - Select "Restrict key"
   - Select: Maps SDK for Android, Maps SDK for iOS
5. Click "Save"

### Step 4: Verify Setup

```bash
# Build the app with new configuration
cd "C:\Roads Authority Application\RA-_APP-_4\app"
npx expo prebuild --clean
npx expo run:android
```

If the map loads correctly, you're all set! ✅

---

## Using Environment Variables (Advanced)

For better security, use environment variables:

### 1. Install dotenv
```bash
npm install --save-dev dotenv
```

### 2. Create `.env` file
```
GOOGLE_MAPS_API_KEY=AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
```

### 3. Add `.env` to `.gitignore`
```
.env
```

### 4. Create `app.config.js`
```javascript
import 'dotenv/config';

export default {
  expo: {
    // ... other config
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
};
```

### 5. Delete `app.json`
```bash
rm app.json
```

---

## Troubleshooting

### Map not loading?
1. Check API key is correct
2. Verify APIs are enabled in Google Cloud Console
3. Clear cache: `npx expo start --clear`
4. Rebuild: `npx expo run:android`

### "API key not valid" error?
1. Check API restrictions
2. Make sure Maps SDK for Android is enabled
3. Wait a few minutes (API key activation can take time)

### Map shows gray screen?
1. Check internet connection
2. Verify API key has no restrictions preventing usage
3. Check console logs for errors

---

## Cost & Billing

**Good News:** Google Maps offers:
- $200 free credit per month
- For a typical app with moderate usage, this should cover costs
- Set up billing alerts to avoid surprises

**Estimated Usage:**
- Map loads: ~2,000-5,000 per month (well within free tier)
- Reverse geocoding: ~1,000 per month (well within free tier)

**Set up billing alert:**
1. Google Cloud Console → Billing
2. Budgets & alerts
3. Create budget with email notifications

---

## Alternative: Use OpenStreetMap (Free)

If you don't want to use Google Maps, you can use `react-native-webview` with OpenStreetMap:

```bash
npx expo install react-native-webview
```

See `docs/OPENSTREETMAP_ALTERNATIVE.md` for implementation guide.

---

**Questions?** Check the main documentation or open an issue!

