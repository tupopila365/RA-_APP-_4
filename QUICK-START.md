# ⚡ Quick Start - 5 Minutes

## What You Need

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas (free cloud)](https://www.mongodb.com/cloud/atlas)

## Start in 5 Steps

### 1️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```

### 2️⃣ Configure Backend
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string)
```

**Quick MongoDB Options:**

**Option A: Local MongoDB**
```bash
# Just start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (takes 3-5 minutes)
4. Get connection string
5. Paste in `MONGODB_URI` in `.env`

### 3️⃣ Start Backend
```bash
# Still in backend folder
npm run dev
```

✅ You should see: `Server running on port 5000`

### 4️⃣ Install Mobile App Dependencies
```bash
# Open new terminal
cd app
npm install
```

### 5️⃣ Start Mobile App
```bash
npm start
```

This opens Expo DevTools. Then:

**On Phone:**
1. Install **Expo Go** app
2. Scan QR code
3. Done! 🎉

**On Computer:**
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator

---

## 🎯 What Works Now

✅ **News** - Browse articles, search, filter  
✅ **Offices** - Find locations, call, get directions  
✅ **FAQs** - Search questions, expand answers  

All with clean architecture and smart caching!

---

## 🔧 Troubleshooting

**Can't connect to backend?**
```bash
# For physical device, use your computer's IP
# Edit app/config/env.js:
API_BASE_URL: 'http://192.168.1.XXX:5000/api'
```

**Port 5000 in use?**
```bash
# Change PORT in backend/.env to 3000
# Update app/config/env.js to match
```

**MongoDB won't connect?**
```bash
# Check MongoDB is running:
mongod --version

# Or use MongoDB Atlas (cloud) instead
```

---

## 📖 Full Documentation

See `STARTUP-GUIDE.md` for complete instructions.

---

## 🆘 Quick Commands

```bash
# Backend
cd backend
npm run dev          # Start server
npm test             # Run tests

# Mobile App  
cd app
npm start            # Start Expo
npm run ios          # iOS simulator
npm run android      # Android emulator
npm test             # Run tests
```

---

**That's it! You're running a professional mobile app with clean architecture.** 🚀
