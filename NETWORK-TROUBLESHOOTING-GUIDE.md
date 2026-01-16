# Network Troubleshooting Guide

## Problem: "Network request failed" Error

If you're seeing errors like:
```
ERROR ❌ API Error: {"error": "Network request failed", "errorDetails": [TypeError: Network request failed], "errorType": "TypeError", "method": "GET", "url": "http://localhost:5001/api/roadworks/public"}
```

## Quick Fix (Recommended)

1. **Run the quick fix script:**
   ```bash
   QUICK-FIX-NETWORK-ISSUE.bat
   ```

2. **Test the connection:**
   ```bash
   node test-backend-connection.js
   ```

## Manual Troubleshooting Steps

### Step 1: Check if Backend is Running

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify it's running:**
   - Look for: "Server running on port 5001"
   - Or check: http://localhost:5001/api/health in browser

### Step 2: Choose Connection Method

#### Option A: USB Connection (Recommended)
- **Pros:** Bypasses firewall, most reliable
- **Setup:**
  ```bash
  adb reverse tcp:5001 tcp:5001
  ```
- **Config:** Keep `API_BASE_URL: 'http://localhost:5001/api'` in `app/config/env.js`

#### Option B: WiFi Connection
- **Pros:** No USB cable needed
- **Setup:**
  1. Find your computer's IP address:
     ```bash
     ipconfig  # Windows
     ifconfig  # Mac/Linux
     ```
  2. Update `app/config/env.js`:
     ```javascript
     API_BASE_URL: 'http://YOUR_IP_ADDRESS:5001/api'
     ```
  3. Make sure firewall allows port 5001

#### Option C: Ngrok Tunnel (External Access)
- **Pros:** Works from any network, bypasses all firewall issues
- **Setup:**
  ```bash
  start-backend-with-ngrok.bat
  ```
- **Config:** Copy the ngrok HTTPS URL and update `app/config/env.js`:
  ```javascript
  API_BASE_URL: 'https://your-ngrok-url.ngrok-free.app/api'
  ```

### Step 3: Restart Mobile App

After making any configuration changes:
1. Stop the Expo development server (Ctrl+C)
2. Clear cache: `expo start --clear`
3. Restart the app on your device

## Common Issues and Solutions

### Issue: "ECONNREFUSED" or "Network request failed"
**Solution:** Backend is not running or not accessible
- Start backend: `cd backend && npm run dev`
- Check firewall settings
- Try ngrok for external access

### Issue: "Connection timeout"
**Solution:** Network connectivity problem
- Check if device and computer are on same WiFi
- Try USB connection with adb reverse
- Increase timeout in `app/config/env.js`

### Issue: "404 Not Found"
**Solution:** Wrong API endpoint or backend not fully started
- Wait for backend to fully start (10-15 seconds)
- Check backend logs for errors
- Verify endpoint URLs in network tab

### Issue: Works on emulator but not physical device
**Solution:** Network configuration difference
- Emulator can use localhost, physical device cannot
- Use WiFi IP address or USB with adb reverse
- Or use ngrok for universal access

## Testing Your Setup

1. **Test backend directly:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Test from mobile device network:**
   ```bash
   curl http://YOUR_IP:5001/api/health
   ```

3. **Run automated test:**
   ```bash
   node test-backend-connection.js
   ```

## Environment Configuration Examples

### USB Connection (Recommended)
```javascript
// app/config/env.js
API_BASE_URL: 'http://localhost:5001/api'
```
```bash
# Terminal
adb reverse tcp:5001 tcp:5001
```

### WiFi Connection
```javascript
// app/config/env.js - Replace with your actual IP
API_BASE_URL: 'http://192.168.1.100:5001/api'
```

### Ngrok Tunnel
```javascript
// app/config/env.js - Replace with your ngrok URL
API_BASE_URL: 'https://abc123.ngrok-free.app/api'
```

## Still Having Issues?

1. **Check the logs:**
   - Backend logs in the terminal where you ran `npm run dev`
   - Mobile app logs in Expo DevTools
   - Network tab in browser DevTools

2. **Verify services:**
   - MongoDB running (if using local database)
   - Backend API responding to health checks
   - Mobile app can reach the network

3. **Try the nuclear option:**
   ```bash
   # Stop everything
   # Clear all caches
   cd backend && npm run dev
   cd ../app && expo start --clear
   ```

4. **Get help:**
   - Check the error logs carefully
   - Try different connection methods
   - Use ngrok as a last resort (it always works)