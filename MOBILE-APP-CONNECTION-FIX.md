# Mobile App API Connection Fix

## 🔍 Problem Diagnosis

Your mobile app can't reach the backend API. Here are the most common causes and solutions:

## ✅ Current Status
- **Backend**: ✅ Running on `http://192.168.108.1:5000`
- **Mobile App Config**: ✅ Configured for `http://192.168.108.1:5000/api`
- **Network**: ⚠️ Needs verification

## 🔧 Solutions (Try in Order)

### Solution 1: Use Your WiFi IP Address (Recommended)
Your computer's WiFi IP is `192.168.11.52`, but the app is configured for `192.168.108.1` (VMware network).

**Update the mobile app configuration:**

1. **Edit**: `RA-_APP-_4/app/config/env.js`
2. **Change**: 
   ```javascript
   API_BASE_URL: 'http://192.168.108.1:5000/api',
   ```
   **To**:
   ```javascript
   API_BASE_URL: 'http://192.168.11.52:5000/api',
   ```
3. **Restart**: Expo app (press `r` in terminal or shake device)

### Solution 2: Use USB Connection with Port Forwarding
This bypasses WiFi/firewall issues completely.

**Steps:**
1. **Connect phone via USB**
2. **Enable USB Debugging** on your phone
3. **Run command**:
   ```bash
   adb reverse tcp:5000 tcp:5000
   ```
4. **Update config** to use localhost:
   ```javascript
   API_BASE_URL: 'http://localhost:5000/api',
   ```
5. **Restart Expo app**

### Solution 3: Use Ngrok Tunnel (Works from Any Network)
This creates a public tunnel to your local backend.

**Steps:**
1. **Install ngrok**: Download from https://ngrok.com/
2. **Run the setup script**:
   ```bash
   .\start-backend-with-ngrok.bat
   ```
3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)
4. **Update config**:
   ```javascript
   API_BASE_URL: 'https://abc123.ngrok-free.app/api',
   ```
5. **Restart Expo app**

## 🧪 Quick Test Commands

### Test Backend from Computer
```bash
# Test if backend is responding
curl http://localhost:5000/api/health

# Test from network IP
curl http://192.168.11.52:5000/api/health
```

### Test from Phone Browser
1. **Open browser on phone**
2. **Navigate to**: `http://192.168.11.52:5000/api/health`
3. **Should see**: JSON response with "status": "ok"

## 🔥 Firewall Fix (If Needed)

If the phone still can't connect, Windows Firewall might be blocking it:

**Option 1: Allow Node.js through firewall**
1. **Windows Security** → **Firewall & network protection**
2. **Allow an app through firewall**
3. **Find "Node.js"** and check both Private and Public
4. **Click OK**

**Option 2: Temporarily disable firewall (Testing only)**
1. **Windows Security** → **Firewall & network protection**
2. **Turn off** for Private network (temporarily)
3. **Test connection**
4. **Turn back on** after testing

## 📱 Mobile App Debug Steps

### 1. Check Network Connection
- **Ensure phone and computer are on same WiFi**
- **Check phone's IP**: Settings → WiFi → Network details
- **Should be**: `192.168.11.x` (same subnet as computer)

### 2. Enable Debug Mode
The app already has debug mode enabled. Check Expo logs for API errors:
- **Expo CLI**: Look for red error messages
- **Device logs**: Shake device → "Debug Remote JS"

### 3. Test API Endpoints
Try these URLs in your phone's browser:
- `http://192.168.11.52:5000/api/health` - Should return JSON
- `http://192.168.11.52:5000/api/news` - Should return news data

## 🚀 Quick Fix Script

I'll create an automated fix script for you: