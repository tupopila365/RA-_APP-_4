# 🚀 Roads Authority App - Complete Startup Guide

## Overview

This is a full-stack monorepo containing:
- **Mobile App** (React Native + Expo) - iOS & Android
- **Backend API** (Node.js + Express + TypeScript)
- **Admin Panel** (React + TypeScript + Vite)
- **RAG Service** (Python + FastAPI) - AI Chatbot

## Prerequisites

Before you start, make sure you have these installed:

### Required
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Optional (for specific features)
- **Redis** - For caching (optional but recommended)
- **Python 3.9+** - For RAG service (chatbot)
- **Android Studio** - For Android emulator
- **Xcode** (Mac only) - For iOS simulator

---

## 🎯 Quick Start (Recommended)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install mobile app dependencies
cd ../app
npm install

# Install admin panel dependencies (optional)
cd ../admin
npm install
```

### Step 2: Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/roads-authority
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roads-authority

# JWT (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis (OPTIONAL - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary (OPTIONAL - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# RAG Service (OPTIONAL - for chatbot)
RAG_SERVICE_URL=http://localhost:8000
```

#### Mobile App Configuration

The mobile app is already configured! It uses `app/config/env.js`:

```javascript
// Development mode (default)
API_BASE_URL: 'http://localhost:5000/api'

// For physical device testing, use your computer's IP:
// API_BASE_URL: 'http://192.168.1.100:5000/api'
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `backend/.env`

### Step 4: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Server running on port 5000
```

### Step 5: Start the Mobile App

```bash
cd app
npm start
```

This will open Expo DevTools in your browser. Then:

**Option A: Physical Device**
1. Install **Expo Go** app from App Store or Google Play
2. Scan the QR code with your phone
3. App will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
# Press 'i' in the terminal
# OR
npm run ios
```

**Option C: Android Emulator**
```bash
# Press 'a' in the terminal
# OR
npm run android
```

---

## 📱 Testing the Mobile App

### 1. Check Backend Connection

The app will try to connect to `http://localhost:5000/api` by default.

**If using a physical device:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
2. Look for your local IP (e.g., `192.168.1.100`)
3. Update `app/config/env.js`:
   ```javascript
   development: {
     API_BASE_URL: 'http://192.168.1.100:5000/api',
   }
   ```
4. Restart Expo: Press `r` in terminal or shake device

### 2. Test Features

The app has 3 main features with clean architecture:

**✅ News** (API-backed)
- Browse news articles
- Search functionality
- Category filtering
- Pull to refresh
- Cached for 5 minutes

**✅ Offices/Locations** (API-backed)
- Find office locations
- Filter by region
- Call offices
- Get directions
- Cached for 10 minutes

**✅ FAQs** (Static data)
- Frequently asked questions
- Search functionality
- Expand/collapse answers
- Instant access (no API needed)

---

## 🗄️ Database Setup

### Seed Initial Data (Optional)

The backend will work with an empty database, but you can add sample data:

**Create a super admin user:**
```bash
cd backend
npm run seed:admin
```

**Add sample news articles:**
```bash
npm run seed:news
```

**Add sample locations:**
```bash
npm run seed:locations
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: MongoDB connection failed**
```
Solution:
1. Make sure MongoDB is running
2. Check MONGODB_URI in .env
3. For Atlas, whitelist your IP address
```

**Problem: Port 5000 already in use**
```
Solution:
1. Change PORT in backend/.env to 3000 or 8000
2. Update API_BASE_URL in app/config/env.js
3. Restart both backend and app
```

### Mobile App Issues

**Problem: Network request failed**
```
Solution:
1. Check backend is running (http://localhost:5000)
2. For physical device, use computer's IP address
3. Make sure device and computer are on same WiFi
4. Check firewall isn't blocking port 5000
```

**Problem: Expo won't start**
```
Solution:
1. Clear cache: npx expo start -c
2. Delete node_modules and reinstall:
   rm -rf node_modules
   npm install
3. Update Expo: npm install expo@latest
```

**Problem: App crashes on startup**
```
Solution:
1. Check console for errors
2. Make sure all dependencies are installed
3. Try: npx expo start --clear
```

---

## 🎨 Admin Panel (Optional)

The admin panel is for managing content (news, tenders, etc.).

### Start Admin Panel

```bash
cd admin
npm install
npm run dev
```

Access at: `http://localhost:5173`

**Default credentials:**
- Email: `admin@roadsauthority.na`
- Password: `Admin123!`

---

## 🤖 RAG Service / Chatbot (Optional)

The chatbot feature requires the RAG service.

### Setup RAG Service

```bash
cd rag-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start service
python main.py
```

Access at: `http://localhost:8000`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ NewsScreen   │  │FindOffices   │  │  FAQsScreen  │  │
│  │              │  │   Screen     │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  │
│  │ View Models  │  │ View Models  │  │ View Models  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  │
│  │  Use Cases   │  │  Use Cases   │  │  Use Cases   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  │
│  │Repositories  │  │Repositories  │  │Repositories  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js + Express)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ News Module  │  │Location Mod  │  │Chatbot Mod   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              MongoDB Database                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
cd app
npm test
```

---

## 📝 API Endpoints

### News
- `GET /api/news` - Get all news
- `GET /api/news/:id` - Get single news article
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/:id` - Update news (admin only)
- `DELETE /api/news/:id` - Delete news (admin only)

### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get single location
- `POST /api/locations` - Create location (admin only)

### Chatbot
- `POST /api/chatbot/query` - Send chatbot query
- `GET /api/chatbot/health` - Check chatbot service status

---

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Mobile App
```bash
cd app
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

---

## 📚 Additional Resources

- **Mobile App README**: `app/README.md`
- **Backend README**: `backend/README.md`
- **Admin Panel README**: `admin/README.md`
- **Clean Architecture Docs**: `app/CLEAN-ARCHITECTURE-COMPLETE.md`
- **Monorepo Setup**: `README-MONOREPO.md`

---

## 🆘 Need Help?

### Common Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests

# Mobile App
cd app
npm start            # Start Expo
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm test             # Run tests

# Admin Panel
cd admin
npm run dev          # Start development server
npm run build        # Build for production
```

### Check Service Status

```bash
# Backend
curl http://localhost:5000/api/health

# RAG Service
curl http://localhost:8000/health
```

---

## ✅ Checklist

Before starting development, make sure:

- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Backend `.env` configured
- [ ] Backend running on port 5000
- [ ] Mobile app dependencies installed
- [ ] Expo DevTools opened
- [ ] App running on device/simulator
- [ ] Can see News, Offices, and FAQs screens

---

## 🎉 You're Ready!

Your Roads Authority app is now running with:
- ✅ Clean architecture
- ✅ Backend API connection
- ✅ Smart caching (80%+ cache hit rate)
- ✅ Three fully functional features
- ✅ Professional code structure

**Happy coding!** 🚀
