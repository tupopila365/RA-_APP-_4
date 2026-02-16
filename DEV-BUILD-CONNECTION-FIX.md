# Fix: "Failed to connect to 127.0.0.1:80" on development build

## What’s going wrong

The error **`java.net.ConnectException: Failed to connect to /127.0.0.1:80`** means the **Roads Authority Namibia** app (development build) is trying to load its JavaScript bundle from `127.0.0.1:80` and failing.

- On a **physical Android device**, `127.0.0.1` is the **phone itself**, not your PC. So the app is looking for a server on the phone on port 80, and there is none.
- **Port 80** is wrong for Metro; the bundler uses **8081** (or 19000 with Expo). So the app is using the wrong URL.

So the problem is: **the dev client is using the wrong host (and possibly port) to reach the Metro bundler on your computer.**

---

## Fixes (do these in order)

### 1. Run Metro from the correct project

The app on the screenshot is **“Roads Authority Namibia”** (the main app). Metro must be started from **that** project, not from `roads-authority-design`.

From the repo root:

```bash
cd app
npm install
npx expo start
```

If you run `npx expo start` from `roads-authority-design` but open the installed “Roads Authority Namibia” dev client, the device will still try to connect to a bundler that isn’t serving that app → connection errors.

### 2. Make the device use your PC’s IP (not 127.0.0.1)

So the dev build stops trying to connect to `127.0.0.1:80` and instead connects to your computer’s Metro server.

**Option A – Start with LAN (recommended)**  
In the **`app`** folder:

```bash
npx expo start --lan
```

Expo will show a URL like `exp://192.168.x.x:8081`. The dev client should then use that IP instead of 127.0.0.1.

**Option B – Set packager hostname before starting**  
Find your PC’s IPv4 address (e.g. `192.168.1.100`), then:

- **PowerShell:**
  ```powershell
  $Env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.100"
  npx expo start
  ```
- **CMD:**
  ```cmd
  set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.100
  npx expo start
  ```

Use your actual IP (from `ipconfig` on Windows).

### 3. Same Wi‑Fi and firewall

- Phone and PC must be on the **same Wi‑Fi** (or same network).
- If it still fails, allow the Metro port (e.g. **8081**) in Windows Firewall, or temporarily disable the firewall to test.

### 4. Point the app at the bundler (if it still fails)

If the dev client was built with a wrong URL, you can point it manually:

1. Shake the device (or press Ctrl+M in the emulator) to open the dev menu.
2. Use **“Configure Bundler”** or **“Enter URL manually”** (wording may vary).
3. Enter your PC’s URL and Metro port, e.g. `192.168.1.100:8081` (replace with your IP).

---

## Summary

| Cause | Action |
|-------|--------|
| Metro started from wrong project (`roads-authority-design` instead of `app`) | Run `npx expo start` from the **`app`** folder. |
| App uses 127.0.0.1 (device thinks “this phone”) | Use `expo start --lan` or set `REACT_NATIVE_PACKAGER_HOSTNAME` to your PC’s IP. |
| Port 80 is wrong for Metro | No config change needed; using `expo start` (or `--lan`) uses the correct port (8081). |

After that, **Reload** in the error screen or reopen the app; it should load the bundle from your PC and the connection error should go away.
