# Mobile App Connection - Quick Fix

## Problem
App redirects to localhost when scanning QR code on phone.

## Quick Solution

### Step 1: Find Your IP
```cmd
cd app
find-my-ip.bat
```

Or manually:
```cmd
ipconfig
```

Look for **IPv4 Address** under WiFi adapter (e.g., `192.168.1.100`)

### Step 2: Update Configuration

**File:** `app/config/env.js`

```javascript
const ENV = {
  development: {
    API_BASE_URL: 'http://YOUR_IP_HERE:5000/api',  // <-- Change this!
    API_TIMEOUT: 60000,
    DEBUG_MODE: true,
  },
};
```

**Example:**
```javascript
API_BASE_URL: 'http://192.168.1.100:5000/api',
```

### Step 3: Restart

```bash
cd app
npx expo start -c  # Clear cache
```

### Step 4: Scan Again

Scan the new QR code with Expo Go.

## Checklist

- [ ] Backend running: `cd backend && npm run dev`
- [ ] Phone and computer on same WiFi
- [ ] IP address updated in `env.js`
- [ ] Expo restarted with cache cleared
- [ ] Firewall allows port 5000

## Test Connection

Open in phone browser:
```
http://YOUR_IP:5000/api/health
```

Should show: `{"status":"ok"}`

If it doesn't work, check:
1. Same WiFi network
2. Firewall settings
3. Backend is running

## Current IP in Config

Your `env.js` currently has: **192.168.11.52**

If this is not your current IP, update it!

---

**Full Guide:** `FIX-LOCALHOST-ISSUE.md`
