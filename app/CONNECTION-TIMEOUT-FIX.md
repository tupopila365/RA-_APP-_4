# Fix: "There was a problem loading the project" (SocketTimeoutException)

This error means the app **could not connect** to the Expo dev server in time. The tunnel or network is too slow.

## Quick Fixes (try in order)

### 1. Use LAN instead of tunnel (fastest)

If your **phone and computer are on the same WiFi**:

```bash
cd app
npx expo start --lan
```

Then scan the QR code. This is much faster and more reliable than tunnel.

---

### 2. Restart with cache clear

Stop Expo (Ctrl+C), then:

```bash
cd app
npx expo start --tunnel --clear
```

---

### 3. USB connection (no tunnel needed)

Connect your phone via USB, enable USB debugging, then:

```bash
adb reverse tcp:8081 tcp:8081
cd app
npx expo start
```

The app will connect via `localhost:8081` – no tunnel, no timeout.

---

### 4. Check your network

- Switch WiFi networks (avoid guest/corporate networks)
- Try mobile data on the phone
- Temporarily disable VPN if you use one
- Ensure Windows Firewall allows Node/Metro on port 8081

---

## If tunnel is required (phone on different network)

1. Ensure you have a stable internet connection
2. Run: `npx expo start --tunnel --clear`
3. Wait 30–60 seconds for the tunnel URL to appear
4. Use "Reload" in the app – sometimes the first load times out, the second succeeds
