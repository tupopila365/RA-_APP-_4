# Fix "Localhost" Issue - Mobile App Not Connecting

## Problem

When you scan the QR code with your phone, the app tries to connect to `localhost` or an old IP address, which doesn't work on physical devices.

## Solution

Update the API_BASE_URL to use your computer's current IP address.

## Step 1: Find Your Computer's IP Address

### On Windows:

```cmd
ipconfig
```

Look for **"IPv4 Address"** under your WiFi adapter (usually "Wireless LAN adapter Wi-Fi"):

```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100  <-- This is your IP!
```

### On Mac/Linux:

```bash
ifconfig
```

Look for your WiFi interface (usually `en0` or `wlan0`):

```
en0: flags=8863<UP,BROADCAST,SMART,RUNNING>
    inet 192.168.1.100  <-- This is your IP!
```

### Quick Method (Any OS):

When you run `npm start` in the app folder, Expo shows your IP in the terminal:

```
Metro waiting on exp://192.168.1.100:8081  <-- This is your IP!
```

## Step 2: Update the Configuration

**File:** `app/config/env.js`

Change the `API_BASE_URL` to use your computer's IP address:

```javascript
const ENV = {
  development: {
    // Replace with YOUR computer's IP address
    API_BASE_URL: 'http://YOUR_IP_HERE:5000/api',
    API_TIMEOUT: 60000,
    DEBUG_MODE: true,
  },
  // ...
};
```

**Example:**

If your IP is `192.168.1.100`:

```javascript
const ENV = {
  development: {
    API_BASE_URL: 'http://192.168.1.100:5000/api',
    API_TIMEOUT: 60000,
    DEBUG_MODE: true,
  },
  // ...
};
```

## Step 3: Restart the App

```bash
cd app

# Stop the current server (Ctrl+C)

# Clear cache and restart
npx expo start -c

# Or just restart
npm start
```

## Step 4: Scan QR Code Again

1. Open Expo Go on your phone
2. Scan the new QR code
3. App should now connect to your backend!

## Important Checklist

Make sure:

- [ ] **Backend is running** on port 5000
  ```bash
  cd backend
  npm run dev
  ```

- [ ] **Phone and computer on same WiFi network**
  - Check your phone's WiFi settings
  - Make sure it's connected to the same network as your computer

- [ ] **Firewall allows port 5000**
  - Windows: Allow Node.js through Windows Firewall
  - Mac: System Preferences → Security & Privacy → Firewall

- [ ] **IP address is correct**
  - Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  - Don't use `localhost` or `127.0.0.1` for physical devices

## Common Issues

### Issue 1: "Network request failed"

**Cause:** Phone can't reach your computer

**Solutions:**
1. Verify both devices on same WiFi
2. Check firewall settings
3. Try pinging your computer from phone (use network tools app)
4. Restart WiFi router

### Issue 2: "Connection refused"

**Cause:** Backend not running or wrong port

**Solutions:**
1. Make sure backend is running: `cd backend && npm run dev`
2. Check backend is on port 5000
3. Try accessing `http://YOUR_IP:5000/api/health` in phone browser

### Issue 3: IP address keeps changing

**Cause:** Router assigns dynamic IPs

**Solutions:**
1. Set static IP on your computer
2. Or update `env.js` each time IP changes
3. Use a tool like ngrok for stable URL

## Quick Test

### Test 1: Check Backend from Computer

Open in browser:
```
http://localhost:5000/api/health
```

Should return: `{"status":"ok"}`

### Test 2: Check Backend from Phone

Open in phone browser:
```
http://YOUR_IP:5000/api/health
```

Should return: `{"status":"ok"}`

If Test 2 fails, there's a network/firewall issue.

## Alternative: Use ngrok (Advanced)

If you can't get the IP address method working, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and use it in `env.js`:

```javascript
API_BASE_URL: 'https://abc123.ngrok.io/api',
```

## Current Configuration

Your current IP in `env.js` is: **192.168.11.52**

If this is not your current IP, update it!

## Quick Fix Script

Create a file `app/update-ip.bat` (Windows):

```bat
@echo off
echo Finding your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo Your IP is: %IP%
echo.
echo Update this in app/config/env.js:
echo API_BASE_URL: 'http://%IP%:5000/api',
pause
```

Run it to quickly find your IP!

## Summary

1. ✅ Find your computer's IP address (`ipconfig` or `ifconfig`)
2. ✅ Update `app/config/env.js` with your IP
3. ✅ Make sure backend is running
4. ✅ Ensure phone and computer on same WiFi
5. ✅ Restart Expo (`npx expo start -c`)
6. ✅ Scan QR code again

**Your app should now connect!** 🎉
