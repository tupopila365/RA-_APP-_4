# Complete Ngrok Setup Guide for React Native + Node.js

## ⚠️ Important Note

Ngrok is a **workaround** for local network issues. It's useful for:
- Quick testing when firewall is blocking
- Sharing your app with remote testers
- Temporary demos

**However, for local development, fixing your Windows Firewall is better because:**
- Faster (no internet roundtrip)
- More reliable
- No Ngrok limits (free tier has restrictions)
- Works offline

---

## 1️⃣ Ngrok Setup

### Install Ngrok

**Option A: Download**
1. Go to https://ngrok.com/download
2. Download Windows version
3. Extract to `C:\ngrok`
4. Add to PATH or use full path

**Option B: Using Chocolatey**
```powershell
choco install ngrok
```

### Sign Up & Get Auth Token

1. Create free account at https://ngrok.com/signup
2. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure it:
```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Start Ngrok Tunnel

```powershell
ngrok http 5000
```

You'll see output like:
```
Session Status                online
Account                       your@email.com
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copy the HTTPS URL:** `https://abc123.ngrok-free.app`

---

## 2️⃣ Backend Configuration

### Update CORS in app.ts

Your backend is TypeScript, so update `src/app.ts`:

```typescript
import cors from 'cors';

// BEFORE (in createApp function):
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// AFTER - Allow Ngrok:
app.use(cors({
  origin: '*', // Allow all origins (Ngrok URLs change)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### Add Request Logging

Add this BEFORE your routes in `src/app.ts`:

```typescript
// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

### Increase Timeouts in server.ts

Already done! Your server.ts is configured correctly.

### Verify Endpoints Return Data

Check your controllers return real data, not empty arrays.

---

## 3️⃣ Frontend Configuration (React Native JavaScript)

### Update API Configuration

File: `app/config/env.js`

```javascript
/**
 * Environment Configuration
 */

const ENV = {
  development: {
    // OPTION 1: Use Ngrok (replace with your actual Ngrok URL)
    API_BASE_URL: 'https://YOUR-NGROK-URL.ngrok-free.app/api',
    
    // OPTION 2: Use local network (when firewall is fixed)
    // API_BASE_URL: 'http://192.168.178.33:5000/api',
    
    API_TIMEOUT: 30000, // Increased for Ngrok
    DEBUG_MODE: true,
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    API_TIMEOUT: 10000,
    DEBUG_MODE: false,
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
```

### Update API Service

File: `app/services/api.js`

```javascript
import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;
const TIMEOUT = ENV.API_TIMEOUT;

export class ApiClient {
  static async request(endpoint, options = {}) {
    const { method = 'GET', body, headers = {} } = options;

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      console.log(`🌐 Fetching: ${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`✅ Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        console.error('❌ Request timeout');
        throw new ApiError('Request timeout', 408, { timeout: true });
      }

      console.error('❌ Network error:', error.message);
      throw new ApiError(error.message || 'Network error', 0, error);
    }
  }

  static get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  static put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  static delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(message, status = 0, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}

export const API_ENDPOINTS = {
  NEWS: '/news',
  NEWS_DETAIL: (id) => `/news/${id}`,
  VACANCIES: '/vacancies',
  VACANCIES_DETAIL: (id) => `/vacancies/${id}`,
  TENDERS: '/tenders',
  TENDERS_DETAIL: (id) => `/tenders/${id}`,
  BANNERS: '/banners',
  BANNERS_DETAIL: (id) => `/banners/${id}`,
  LOCATIONS: '/locations',
  LOCATIONS_DETAIL: (id) => `/locations/${id}`,
  CHATBOT_QUERY: '/chatbot/query',
  CHATBOT_HEALTH: '/chatbot/health',
};
```

### Android Permissions

File: `app/android/app/src/main/AndroidManifest.xml`

Add these permissions if not already present:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="true">  <!-- Add this for HTTP -->
      
      <!-- Rest of your config -->
    </application>
</manifest>
```

---

## 4️⃣ Complete Setup Steps

### Step 1: Start Backend

```powershell
cd "C:\Roads Authority Application\RA-_APP-_4\backend"
npm run dev
```

You should see:
```
✅ Server running on port 5000
📍 Local:   http://localhost:5000
📍 Network: http://192.168.178.33:5000
```

### Step 2: Start Ngrok

Open a NEW PowerShell window:

```powershell
ngrok http 5000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 3: Test Ngrok URL in Browser

Open browser and test:
```
https://YOUR-NGROK-URL.ngrok-free.app/api/vacancies
```

You should see JSON data!

### Step 4: Update React Native Config

1. Open `app/config/env.js`
2. Replace `YOUR-NGROK-URL` with your actual Ngrok URL
3. Save the file

### Step 5: Restart React Native App

```powershell
cd "C:\Roads Authority Application\RA-_APP-_4\app"
# Press Ctrl+C to stop
npx expo start
```

Press `r` to reload the app on your phone.

---

## 5️⃣ Verification Checklist

### ✅ Backend Checks

- [ ] Backend running on port 5000
- [ ] `http://localhost:5000/api/vacancies` returns JSON in browser
- [ ] Console shows request logs when you access endpoints

### ✅ Ngrok Checks

- [ ] Ngrok tunnel is running
- [ ] HTTPS URL is displayed in Ngrok console
- [ ] `https://YOUR-NGROK-URL.ngrok-free.app/api/vacancies` returns JSON in browser
- [ ] No "Tunnel not found" error

### ✅ Frontend Checks

- [ ] `app/config/env.js` has correct Ngrok URL
- [ ] App restarted after config change
- [ ] Console shows "🌐 Fetching: https://..." logs
- [ ] No timeout errors
- [ ] Data loads in the app

---

## 6️⃣ Troubleshooting

### "Tunnel not found" Error

Ngrok shows a warning page. Click "Visit Site" to bypass.

**Or add this to backend:**
```typescript
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});
```

### Ngrok URL Changes Every Time

Free tier generates new URLs. Solutions:
1. Update config each time
2. Upgrade to Ngrok paid plan for static URLs
3. **Fix your Windows Firewall instead** (recommended)

### Still Getting Timeouts

1. Check Ngrok console for errors
2. Verify backend is running
3. Check React Native console for actual error
4. Increase timeout in `env.js` to 60000 (60 seconds)

### Empty Arrays

This means the API is working but database is empty!

Seed your database:
```powershell
cd backend
npm run seed
```

---

## 7️⃣ Better Solution: Fix Windows Firewall

Instead of using Ngrok, fix the root cause:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

Then use local IP:
```javascript
API_BASE_URL: 'http://192.168.178.33:5000/api'
```

**Benefits:**
- Faster
- More reliable
- Works offline
- No Ngrok limits

---

## 8️⃣ Quick Reference

### Start Everything

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Ngrok
ngrok http 5000

# Terminal 3: React Native
cd app
npx expo start
```

### Update Frontend Config

```javascript
// app/config/env.js
API_BASE_URL: 'https://YOUR-NGROK-URL.ngrok-free.app/api'
```

### Test URLs

- Backend local: `http://localhost:5000/api/vacancies`
- Ngrok public: `https://YOUR-NGROK-URL.ngrok-free.app/api/vacancies`

---

## Summary

Ngrok works, but it's a workaround. The real issue is Windows Firewall blocking local network access. Fix that for better development experience!
