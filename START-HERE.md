# 🚀 START HERE - Complete Application Startup

## Quick Start (3 Options)

### Option 1: Start Everything (Recommended)
```bash
START-ALL.bat
```
This starts:
- ✅ Backend API (port 5000)
- ✅ Admin Panel (port 5173)
- ✅ Mobile App (Expo)

### Option 2: Start with Chatbot
```bash
# First, start main services
START-ALL.bat

# Then in another terminal, start RAG service
START-RAG.bat
```

### Option 3: Manual Start (Step by Step)
See detailed instructions below.

---

## Prerequisites Checklist

Before running the application, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **MongoDB** running (local or Atlas)
- [ ] **Python 3.12** (only for chatbot) - **Important: Use 3.12, not 3.13!** ([Download](https://www.python.org/downloads/))
- [ ] **Ollama** (only for chatbot) - [Download](https://ollama.ai/)

⚠️ **Python Version Note:** If you have Python 3.13, the RAG service won't work. Install Python 3.12 instead.

---

## 🎯 Option 1: Automated Startup (Easiest)

### Step 1: Run the Startup Script

```bash
cd RA-_APP-_4
START-ALL.bat
```

This will:
1. Check if MongoDB is running
2. Check if Ollama is running (optional)
3. Start Backend API
4. Start Admin Panel
5. Start Mobile App

### Step 2: Access Your Services

- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:5173
- **Mobile App:** Opens in Expo DevTools automatically

### Step 3: Test on Your Phone

1. Install **Expo Go** app from App Store or Google Play
2. Scan the QR code from Expo DevTools
3. App loads on your phone!

---

## 🤖 Adding Chatbot (Optional)

### Step 1: Install Ollama

Download from: https://ollama.ai/

### Step 2: Pull Required Models

```bash
ollama pull nomic-embed-text:latest
ollama pull llama3.2:1b
```

This takes 5-10 minutes (downloads ~5GB).

### Step 3: Start Ollama

```bash
ollama serve
```

Keep this terminal open.

### Step 4: Setup Python Environment (First Time Only)

```bash
cd RA-_APP-_4\rag-service
SETUP-PYTHON-312.bat
```

This creates a Python 3.12 virtual environment and installs dependencies.

### Step 5: Start RAG Service

Open a new terminal:

```bash
cd RA-_APP-_4
START-RAG.bat
```

### Step 5: Test Chatbot

Go to: http://localhost:8001/docs

---

## 📱 Manual Startup (Step by Step)

### 1. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Use your cloud connection string in `backend/.env`

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Should see: `✅ Server running on port 5000`

### 3. Start Admin Panel

Open new terminal:
```bash
cd admin
npm install
npm run dev
```

Should see: `Local: http://localhost:5173`

### 4. Start Mobile App

Open new terminal:
```bash
cd app
npm install
npm start
```

Expo DevTools opens in browser.

### 5. Start RAG Service (Optional)

Open new terminal:
```bash
cd rag-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

---

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/roads-authority
JWT_SECRET=your-secret-key-change-this

# Optional
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Mobile App Configuration

For physical device testing, edit `app/config/env.js`:

```javascript
development: {
  // Use your computer's IP address
  API_BASE_URL: 'http://192.168.1.100:5000/api',
}
```

To find your IP:
```bash
# Windows
ipconfig

# Look for "IPv4 Address" under your WiFi adapter
```

---

## ✅ Verify Everything Works

### 1. Check Backend
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"ok"}`

### 2. Check Admin Panel

Open: http://localhost:5173

Login with:
- Email: `admin@roadsauthority.na`
- Password: `Admin123!`

### 3. Check Mobile App

On your phone/simulator:
- Open News tab - should load articles
- Open Offices tab - should show locations
- Open FAQs tab - should show questions

### 4. Check RAG Service (if running)

```bash
curl http://localhost:8001/health
```

Or run the debug script:
```bash
cd rag-service
python debug_rag_system.py
```

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** Port 5000 in use
```bash
# Solution: Change port in backend/.env
PORT=3000

# Update mobile app config to match
# Edit app/config/env.js
```

**Problem:** MongoDB connection failed
```bash
# Solution 1: Start MongoDB
mongod

# Solution 2: Use MongoDB Atlas
# Update MONGODB_URI in backend/.env
```

### Mobile app can't connect

**Problem:** Network request failed
```bash
# Solution: Use your computer's IP address
# Edit app/config/env.js:
API_BASE_URL: 'http://192.168.1.XXX:5000/api'

# Make sure:
# 1. Phone and computer on same WiFi
# 2. Firewall allows port 5000
# 3. Backend is running
```

### RAG service won't start

**Problem:** Ollama not running
```bash
# Solution: Start Ollama
ollama serve
```

**Problem:** Models not found
```bash
# Solution: Pull models
ollama pull nomic-embed-text:latest
ollama pull llama3.2:1b
```

**Problem:** Python dependencies error
```bash
# Solution: Reinstall dependencies
cd rag-service
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📊 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Admin Panel | 5173 | http://localhost:5173 |
| RAG Service | 8001 | http://localhost:8001 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Ollama | 11434 | http://localhost:11434 |

---

## 🎯 What to Test

### Backend Features
- ✅ News CRUD operations
- ✅ Location management
- ✅ User authentication
- ✅ File uploads (images, PDFs)
- ✅ Chatbot queries

### Mobile App Features
- ✅ Browse news articles
- ✅ Search and filter news
- ✅ Find office locations
- ✅ Call offices / Get directions
- ✅ Browse FAQs
- ✅ Chat with AI assistant

### Admin Panel Features
- ✅ Manage news articles
- ✅ Manage locations
- ✅ Upload documents
- ✅ View chatbot analytics
- ✅ User management

---

## 🚀 Next Steps

1. **Seed Sample Data** (optional)
   ```bash
   cd backend
   npm run seed:admin
   npm run seed:news
   npm run seed:locations
   ```

2. **Upload Documents for Chatbot**
   - Go to http://localhost:5173/documents
   - Upload PDF files
   - Wait for indexing to complete

3. **Test on Physical Device**
   - Update `app/config/env.js` with your IP
   - Scan QR code with Expo Go app

4. **Customize Content**
   - Add your own news articles
   - Add your office locations
   - Upload your documents

---

## 📚 Additional Documentation

- **Full Startup Guide:** `STARTUP-GUIDE.md`
- **Quick Start:** `QUICK-START.md`
- **Chatbot Setup:** `HOW-TO-RUN-CHATBOT.md`
- **Ollama Troubleshooting:** `OLLAMA-TROUBLESHOOTING-GUIDE.md`
- **Speed Optimization:** `SPEED-OPTIMIZED-SETUP.md`

---

## 🆘 Quick Commands

```bash
# Start everything
START-ALL.bat

# Start chatbot
START-RAG.bat

# Check services
curl http://localhost:5000/api/health  # Backend
curl http://localhost:8001/health      # RAG Service

# Debug RAG system
cd rag-service
python debug_rag_system.py
```

---

## ✨ You're All Set!

Your complete Roads Authority application is now running with:
- ✅ Backend API with MongoDB
- ✅ Admin Panel for content management
- ✅ Mobile App for iOS & Android
- ✅ AI Chatbot (optional)
- ✅ Clean architecture
- ✅ Professional code structure

**Happy coding!** 🎉
