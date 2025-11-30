# Network Connectivity Troubleshooting Guide

## Current Status

✅ **Backend is running** - `http://localhost:5000/health` works  
✅ **MongoDB connected** - Database is working  
✅ **Redis disabled** - No longer blocking startup  
✅ **Firewall rules added** - 11 rules exist for port 5000  
❌ **Network access blocked** - `http://192.168.178.33:5000/health` times out  
❌ **Mobile app can't connect** - Getting timeout errors

## Network Configuration

- **Computer WiFi IP:** 192.168.178.33
- **Phone Network:** Same WiFi (192.168.178.x)
- **Backend Port:** 5000
- **Backend listening on:** 0.0.0.0 (all interfaces)

## Problem

Despite having firewall rules, the backend is not accessible from the network IP. This could be due to:
1. Antivirus software blocking connections
2. Router firewall/isolation settings
3. Windows network profile settings
4. Another security software

## Solutions to Try

### Solution 1: Check if Backend is Listening on Network

Run in PowerShell:
```powershell
netstat -ano | findstr :5000
```

You should see:
```
TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    [PID]
```

If you see `127.0.0.1:5000` instead of `0.0.0.0:5000`, the backend is only listening on localhost.

### Solution 2: Temporarily Disable Windows Firewall

1. Windows Key → "Windows Defender Firewall"
2. Click "Turn Windows Defender Firewall on or off"
3. Turn OFF for Private networks
4. Test: `http://192.168.178.33:5000/health`
5. If it works, the issue is firewall configuration
6. Turn firewall back ON after testing

### Solution 3: Check Network Profile

Your network might be set to "Public" which blocks all incoming connections.

1. Windows Key → Settings → Network & Internet
2. Click "WiFi" → Click your network name
3. Under "Network profile type", select **"Private"**
4. Test again

### Solution 4: Disable Antivirus Temporarily

If you have antivirus software (Norton, McAfee, Kaspersky, etc.):
1. Temporarily disable it
2. Test the connection
3. If it works, add an exception for Node.js/port 5000
4. Re-enable antivirus

### Solution 5: Check Router AP Isolation

Some routers have "AP Isolation" or "Client Isolation" enabled:
1. Log into your router (usually 192.168.178.1)
2. Look for "AP Isolation", "Client Isolation", or "Wireless Isolation"
3. Disable it
4. Test again

### Solution 6: Use USB Connection (ADB Reverse Proxy)

If WiFi doesn't work, use USB:

1. **Connect phone via USB**
2. **Enable USB Debugging** on phone
3. **Run in PowerShell:**
   ```powershell
   adb reverse tcp:5000 tcp:5000
   ```
4. **Update mobile app config to use localhost:**
   - Change `API_BASE_URL` to `http://localhost:5000/api`
5. **Restart mobile app**

### Solution 7: Use Expo Tunnel

Instead of LAN, use Expo's tunnel feature:

1. Stop Expo
2. Run: `npx expo start --tunnel`
3. This creates a public URL that bypasses local network issues
4. Note: Slower than LAN but works around network problems

### Solution 8: Deploy Backend to Cloud

For production or if local network is too problematic:
1. Deploy backend to Heroku, Railway, or Render
2. Update mobile app config with cloud URL
3. No more local network issues

## Quick Diagnostic Commands

### Check Backend Process
```powershell
netstat -ano | findstr :5000
```

### Check Firewall Rules
```powershell
Get-NetFirewallRule -DisplayName "Node Backend Port 5000"
```

### Test Local Connection
```
http://localhost:5000/health
```

### Test Network Connection
```
http://192.168.178.33:5000/health
```

### Check Network Profile
```powershell
Get-NetConnectionProfile
```

## Current Mobile App Configuration

File: `RA-_APP-_4/app/config/env.js`

```javascript
development: {
  API_BASE_URL: 'http://192.168.178.33:5000/api',
  API_TIMEOUT: 10000,
  DEBUG_MODE: true,
}
```

## Next Steps

1. **Try Solution 3** (Network Profile) - Most likely fix
2. **Try Solution 2** (Disable Firewall temporarily) - To confirm it's firewall-related
3. **Try Solution 6** (USB/ADB) - Reliable workaround
4. **Try Solution 7** (Expo Tunnel) - Quick workaround

## Contact Information

If none of these work, the issue is likely:
- Corporate/Enterprise security software
- Router configuration
- ISP-level restrictions

Consider using Solution 6 (USB) or Solution 7 (Tunnel) as reliable alternatives.
