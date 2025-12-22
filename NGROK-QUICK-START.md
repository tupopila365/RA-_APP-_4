# 🚀 Ngrok Quick Start Guide

This guide will help you set up ngrok so your phone can connect to your backend API from any WiFi network.

## Why Use Ngrok?

- ✅ Works when phone and computer are on **different WiFi networks**
- ✅ Bypasses firewall issues
- ✅ No need for port forwarding
- ✅ Works from anywhere with internet

## Step 1: Install Ngrok

### Option A: Using PowerShell Script (Easiest)
```powershell
.\install-ngrok.ps1
```

### Option B: Using Chocolatey
```powershell
choco install ngrok
```

### Option C: Manual Download
1. Go to: https://ngrok.com/download
2. Download Windows version
3. Extract to `C:\ngrok`
4. Add `C:\ngrok` to your PATH

## Step 2: Get Your Auth Token

1. **Sign up for free account**: https://ngrok.com/signup
2. **Get your auth token**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configure ngrok**:

### Option A: Using PowerShell Script
```powershell
.\setup-ngrok-auth.ps1
```

### Option B: Manual Configuration
```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

## Step 3: Start Backend with Ngrok

### Option A: Using Batch Script (Easiest)
```powershell
.\start-backend-with-ngrok.bat
```

### Option B: Using PowerShell Script
```powershell
.\start-backend-with-ngrok.ps1
```

### Option C: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Ngrok:**
```powershell
ngrok http 5000
```

## Step 4: Copy Your Ngrok URL

When ngrok starts, you'll see output like:

```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copy the HTTPS URL**: `https://abc123.ngrok-free.app`

## Step 5: Update App Configuration

1. Open `app/config/env.js`
2. Find the `development` section
3. Update `API_BASE_URL` with your ngrok URL:

```javascript
development: {
  // Replace YOUR-NGROK-URL with your actual ngrok URL
  API_BASE_URL: 'https://abc123.ngrok-free.app/api',
  // ... rest of config
}
```

**Example:**
```javascript
API_BASE_URL: 'https://abc123.ngrok-free.app/api',
```

## Step 6: Restart Your Expo App

```powershell
cd app
npx expo start
```

Then reload your app on your phone (press `r` in Expo terminal or shake device).

## ✅ Verify It Works

1. **Test in browser**: Open `https://YOUR-NGROK-URL.ngrok-free.app/api/health`
   - Should show: `{"success":true,"message":"Server is running",...}`

2. **Test in app**: Open your app and check if data loads
   - News, vacancies, tenders should load
   - No connection errors

## 🔄 Daily Workflow

1. **Start backend with ngrok:**
   ```powershell
   .\start-backend-with-ngrok.bat
   ```

2. **Copy the ngrok URL** from the terminal

3. **Update `app/config/env.js`** with the new URL (if it changed)

4. **Start Expo:**
   ```powershell
   cd app
   npx expo start
   ```

5. **Reload app on phone**

## ⚠️ Important Notes

### Ngrok URL Changes
- **Free tier**: URL changes every time you restart ngrok
- **Solution**: Update `env.js` each time, or upgrade to paid plan for static URL

### Ngrok Browser Warning
- First time visiting ngrok URL in browser shows a warning page
- Click "Visit Site" to continue
- This is normal for free tier

### Performance
- Ngrok adds some latency (internet roundtrip)
- Still fast enough for development
- For production, use a real server

## 🐛 Troubleshooting

### "Tunnel not found"
- Make sure ngrok is running
- Check if backend is running on port 5000
- Restart ngrok

### "Connection refused"
- Backend might not be running
- Check: `http://localhost:5000/api/health` in browser

### "CORS error"
- Backend CORS is already configured for ngrok
- Make sure you're using HTTPS URL (not HTTP)

### App still shows old errors
- Clear Expo cache: `npx expo start -c`
- Reload app on phone

## 📋 Quick Reference

```powershell
# Install ngrok
.\install-ngrok.ps1

# Setup auth token
.\setup-ngrok-auth.ps1

# Start backend with ngrok
.\start-backend-with-ngrok.bat

# Update app config
# Edit: app/config/env.js
# Change: API_BASE_URL to your ngrok URL

# Start Expo
cd app
npx expo start
```

## 🎯 Next Steps

After setting up ngrok:
1. ✅ Test that API calls work in your app
2. ✅ Verify data loads (news, vacancies, etc.)
3. ✅ Test from different WiFi networks
4. ✅ You're done! Your app works from anywhere!

---

**Need help?** Check the full guide: `NGROK-SETUP-GUIDE.md`

