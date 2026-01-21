# Quick Fix: Cannot Access App on Phone in Development Mode

## 🔍 Common Issues

When you can't access your Expo app on your phone, it's usually one of these problems:

1. **Expo dev server not accessible from phone** (most common)
2. **Wrong IP address in configuration**
3. **Firewall blocking connections**
4. **Phone and computer on different networks**
5. **Backend not running**

## ✅ Quick Solution (Choose One)

### Solution 1: Start Expo with LAN Mode (Recommended)

**This is the easiest fix for most cases:**

1. **Stop your current Expo server** (if running) - Press `Ctrl+C`

2. **Run the quick start script:**
   ```bash
   START-EXPO-FOR-PHONE.bat
   ```

   Or manually:
   ```bash
   cd app
   npx expo start --lan
   ```

3. **Make sure:**
   - Phone and computer are on the **same WiFi network**
   - Backend is running (check the new window that opens)
   - Scan the QR code with **Expo Go** app

4. **If QR code doesn't work:**
   - Try tunnel mode: `npx expo start --tunnel` (slower but works anywhere)
   - Or manually enter the URL shown in the terminal

### Solution 2: Use USB Connection (Bypasses WiFi Issues)

**This works even if phone and computer are on different networks:**

1. **Connect phone via USB cable**

2. **Enable USB Debugging:**
   - Go to phone Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. **Run the USB setup script:**
   ```bash
   setup-usb-mobile-connection.bat
   ```

4. **Update configuration:**
   - Edit `app/config/env.js`
   - Change to: `API_BASE_URL: 'http://localhost:5000/api',`

5. **Start Expo:**
   ```bash
   cd app
   npx expo start
   ```

### Solution 3: Use Tunnel Mode (Works from Any Network)

**This creates a public URL that works from anywhere:**

1. **Stop current Expo server**

2. **Start with tunnel mode:**
   ```bash
   cd app
   npx expo start --tunnel
   ```

3. **Note:** This is slower than LAN mode but works even if phone and computer are on different networks

4. **Scan the QR code** - it will use the tunnel URL

## 🔧 Diagnostic Steps

### Step 1: Run the Diagnostic Script

```bash
FIX-PHONE-ACCESS.bat
```

This will:
- Check your IP address
- Verify backend is running
- Check configuration
- Provide specific solutions

### Step 2: Verify Network Connection

**Test from phone browser:**
```
http://YOUR_IP:5000/api/health
```

Replace `YOUR_IP` with your computer's IP (shown in the diagnostic script).

**Should show:** `{"status":"ok"}`

**If this doesn't work:**
- Phone and computer are not on same network
- Firewall is blocking the connection
- Backend is not running

### Step 3: Check Firewall Settings

**Windows Firewall:**
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find "Node.js" and check both **Private** and **Public**
4. Also allow ports **8081** (Expo) and **5000** (Backend)

## 📱 Expo Start Modes Explained

### `npx expo start` (Default)
- Uses localhost
- Only works on emulator or with USB port forwarding
- **Not recommended for physical devices**

### `npx expo start --lan`
- Uses your local network IP
- Works on phone if on same WiFi
- **Recommended for development**
- Fast and reliable

### `npx expo start --tunnel`
- Creates public URL via ngrok
- Works from any network
- Slower than LAN mode
- Good for testing from different locations

## 🚨 Common Error Messages

### "Network request failed"
**Cause:** Phone can't reach your computer

**Solutions:**
1. Make sure both devices on same WiFi
2. Check firewall settings
3. Try tunnel mode: `npx expo start --tunnel`
4. Use USB connection instead

### "Unable to connect to Metro"
**Cause:** Expo dev server not accessible

**Solutions:**
1. Start Expo with `--lan` flag: `npx expo start --lan`
2. Check if port 8081 is blocked by firewall
3. Try tunnel mode: `npx expo start --tunnel`

### "Cannot connect to backend API"
**Cause:** Backend not accessible or wrong IP

**Solutions:**
1. Make sure backend is running: `cd backend && npm run dev`
2. Update `app/config/env.js` with correct IP
3. Test backend from phone browser: `http://YOUR_IP:5000/api/health`
4. Use USB connection to bypass network issues

## 📋 Checklist

Before asking for help, make sure:

- [ ] Backend is running (`cd backend && npm run dev`)
- [ ] Phone and computer on same WiFi (or using USB)
- [ ] Expo started with `--lan` flag: `npx expo start --lan`
- [ ] IP address correct in `app/config/env.js`
- [ ] Firewall allows Node.js and ports 8081, 5000
- [ ] Tested backend from phone browser
- [ ] Expo Go app is installed on phone

## 🎯 Recommended Setup

**For daily development:**

1. **Use USB connection** (most reliable):
   ```bash
   setup-usb-mobile-connection.bat
   cd app
   npx expo start
   ```

2. **Or use LAN mode** (if USB not available):
   ```bash
   START-EXPO-FOR-PHONE.bat
   ```

3. **Keep backend running** in a separate terminal:
   ```bash
   cd backend
   npm run dev
   ```

## 💡 Pro Tips

1. **Keep IP address updated:** Run `auto-update-wifi-ip.js` if your IP changes
2. **Use USB for reliability:** USB connection bypasses all network issues
3. **Check Expo terminal:** It shows the exact URL to use
4. **Restart Expo after config changes:** Press `r` in Expo terminal or shake device

## 🆘 Still Not Working?

1. Run `FIX-PHONE-ACCESS.bat` for detailed diagnostics
2. Check Expo terminal for error messages
3. Try tunnel mode: `npx expo start --tunnel`
4. Verify phone can access backend: `http://YOUR_IP:5000/api/health` in phone browser

---

**Quick Command Reference:**
- Start Expo for phone: `START-EXPO-FOR-PHONE.bat`
- Setup USB connection: `setup-usb-mobile-connection.bat`
- Run diagnostics: `FIX-PHONE-ACCESS.bat`
- Update IP address: `node auto-update-wifi-ip.js`

