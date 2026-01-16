# 🚀 PLN Tracking - Quick Start Guide

## ⚡ 30-Second Debug

```bash
# Just run this:
QUICK-CHECK-PLN.bat
```

That's it! It will tell you if tracking is working and give you test credentials.

---

## 🎯 Three Simple Steps

### Step 1: Run Quick Check
```bash
QUICK-CHECK-PLN.bat
```

### Step 2: Look at the Output

**If you see this:**
```
✅ PLN TRACKING IS WORKING!

Test Credentials:
  Reference ID: PLN-2024-ABC123DEF456
  PIN: 12345
```
**→ You're done! Use those credentials in the mobile app.**

---

**If you see errors:**
```
❌ PLN TRACKING HAS ISSUES
```
**→ Continue to Step 3**

---

### Step 3: Run Full Diagnostics
```bash
DEBUG-PLN-TRACKING.bat
```

This will:
- ✅ Show all applications
- ✅ Fix missing PINs automatically
- ✅ Give you test credentials
- ✅ Show what's wrong

---

## 📱 Testing in Mobile App

1. **Open PLN Tracking screen** in the mobile app

2. **Enter the credentials** from the debug output:
   - Reference ID: `PLN-2024-ABC123DEF456` (from debug output)
   - PIN: `12345`

3. **Click "Check Status"**

4. **You should see** the application details!

---

## ❌ Common Problems

### Problem: "No applications found"
**Fix:** Create a PLN application first using the mobile app or admin panel

---

### Problem: "Cannot connect to backend"
**Fix:** Start the backend
```bash
cd backend
npm run dev
```

---

### Problem: "Application not found" (but it exists)
**Fix:** Make sure you're using the EXACT Reference ID from the debug output (copy-paste it)

---

### Problem: Mobile app can't connect
**Fix:** Check your API_BASE_URL in `app/config/env.js`

**For Emulator:**
```javascript
API_BASE_URL: 'http://localhost:5000/api'  // iOS
API_BASE_URL: 'http://10.0.2.2:5000/api'   // Android
```

**For Physical Device:**
```javascript
API_BASE_URL: 'http://YOUR_COMPUTER_IP:5000/api'
// Example: 'http://192.168.1.100:5000/api'
```

---

## 🔧 All Debug Tools

| Tool | When to Use | Command |
|------|-------------|---------|
| **Quick Check** | Fast status check | `QUICK-CHECK-PLN.bat` |
| **Full Debugger** | Detailed diagnostics | `DEBUG-PLN-TRACKING.bat` |
| **API Tester** | Test backend API | `node test-pln-tracking-api.js` |

---

## 📚 More Help

- **Full troubleshooting guide:** `PLN-TRACKING-TROUBLESHOOTING-GUIDE.md`
- **Debug tools overview:** `PLN-TRACKING-DEBUG-README.md`
- **Technical diagnosis:** `PLN-TRACKING-MISMATCH-DIAGNOSIS.md`

---

## ✅ Success!

You know it's working when:
- ✅ Quick check says "PLN TRACKING IS WORKING"
- ✅ You can see application details in mobile app
- ✅ Wrong PIN shows "Invalid PIN" error
- ✅ Wrong Reference ID shows "Application not found" error

---

## 🎯 Remember

- **Universal PIN:** Always `12345`
- **Reference ID:** Must be EXACT (case-sensitive)
- **Backend:** Must be running on port 5000
- **MongoDB:** Must be running

---

**Start here:** `QUICK-CHECK-PLN.bat` 🚀
