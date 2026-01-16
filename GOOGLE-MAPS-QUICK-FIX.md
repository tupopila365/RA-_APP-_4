# Google Maps Quick Fix - 2 Simple Steps

## 🎯 **The Issue:**
Your Google Maps API key works for mobile apps but needs 2 quick settings for web usage.

## ⚡ **Quick Fix (5 minutes):**

### **Step 1: Enable Billing**
1. Go to **https://console.cloud.google.com/**
2. Click **"Billing"** in left sidebar
3. Click **"Link a billing account"** → **"Create billing account"**
4. Add your credit card (Google gives $200 free monthly - you won't be charged)

### **Step 2: Allow Localhost**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click your API key
3. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add: `http://localhost:3001/*`
4. Click **"Save"**

### **Step 3: Test**
- Wait 5 minutes
- Restart admin server: `cd admin && npm start`
- Click "Show Map" - should work now!

## 💡 **Why This Happened:**
- Your API key was configured for mobile apps only
- Web usage requires billing (even for free tier)
- Localhost needs to be explicitly allowed

## ✅ **After Fix:**
- Interactive Google Maps in admin
- Click-to-select locations
- Auto-population of road names and areas
- Search functionality

**Total time:** 5 minutes + 5 minutes waiting for Google to activate changes.