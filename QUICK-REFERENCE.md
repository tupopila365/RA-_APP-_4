# 🎯 Quick Reference Card

## 🚀 Starting the Application

### Fastest Way
```bash
START-ALL.bat
```

### With Chatbot
```bash
START-ALL.bat        # Terminal 1
START-RAG.bat        # Terminal 2
```

### Stop Everything
```bash
STOP-ALL.bat
```

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:5000 | REST API |
| **Admin Panel** | http://localhost:5173 | Content Management |
| **Mobile App** | Expo DevTools | Mobile Development |
| **RAG Service** | http://localhost:8001 | AI Chatbot |
| **API Docs** | http://localhost:8001/docs | RAG API Documentation |

---

## 🔑 Default Credentials

### Admin Panel
- **Email:** `admin@roadsauthority.na`
- **Password:** `Admin123!`

---

## 📱 Mobile App Testing

### On Physical Device
1. Install **Expo Go** app
2. Scan QR code from Expo DevTools
3. App loads automatically

### On Simulator
```bash
# iOS (Mac only)
Press 'i' in terminal

# Android
Press 'a' in terminal
```

### Update API URL for Physical Device
Edit `app/config/env.js`:
```javascript
API_BASE_URL: 'http://YOUR-IP:5000/api'
```

Find your IP:
```bash
ipconfig  # Windows
```

---

## 🐛 Quick Troubleshooting

### Backend Issues

**Can't connect to MongoDB?**
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas in backend/.env
```

**Port 5000 in use?**
```bash
# Change in backend/.env
PORT=3000

# Update app/config/env.js to match
```

### Mobile App Issues

**Network request failed?**
```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Use your computer's IP (not localhost)
# Edit app/config/env.js

# 3. Check same WiFi network
```

**Expo won't start?**
```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
cd app
rm -rf node_modules
npm install
```

### RAG Service Issues

**Ollama not running?**
```bash
ollama serve
```

**Models not found?**
```bash
ollama pull nomic-embed-text
ollama pull llama3.1:8b
```

**Check RAG health:**
```bash
cd rag-service
python debug_rag_system.py
```

---

## 🧪 Testing Commands

### Check Service Health
```bash
# Backend
curl http://localhost:5000/api/health

# RAG Service
curl http://localhost:8001/health

# Ollama
curl http://localhost:11434/api/tags
```

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Mobile app tests
cd app
npm test
```

---

## 📦 Common Tasks

### Seed Sample Data
```bash
cd backend
npm run seed:admin      # Create admin user
npm run seed:news       # Add sample news
npm run seed:locations  # Add sample locations
```

### Clear Cache
```bash
# Mobile app
cd app
npx expo start -c

# Backend (if using Redis)
redis-cli FLUSHALL
```

### Rebuild Everything
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Admin
cd admin
rm -rf node_modules
npm install

# Mobile App
cd app
rm -rf node_modules
npm install
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration |
| `app/config/env.js` | Mobile app API URL |
| `rag-service/.env` | RAG service settings |
| `admin/.env` | Admin panel config |

---

## 📊 Port Reference

| Port | Service |
|------|---------|
| 5000 | Backend API |
| 5173 | Admin Panel |
| 8001 | RAG Service |
| 11434 | Ollama |
| 27017 | MongoDB |
| 6379 | Redis (optional) |

---

## 🎯 Feature Checklist

### Backend ✅
- [x] News CRUD
- [x] Location management
- [x] User authentication
- [x] File uploads
- [x] Chatbot integration

### Mobile App ✅
- [x] News browsing
- [x] Office locations
- [x] FAQs
- [x] Search & filter
- [x] Offline caching

### Admin Panel ✅
- [x] Content management
- [x] Document upload
- [x] User management
- [x] Analytics

### RAG Service ✅
- [x] Document indexing
- [x] Question answering
- [x] Context retrieval
- [x] Progress tracking

---

## 🚨 Emergency Commands

### Kill All Services
```bash
STOP-ALL.bat
```

### Reset Database
```bash
# Drop database
mongo roads-authority --eval "db.dropDatabase()"

# Reseed
cd backend
npm run seed:admin
```

### Reset RAG Index
```bash
# Delete ChromaDB data
cd rag-service
rm -rf chroma_data
```

---

## 📚 Documentation Links

- **Full Guide:** `START-HERE.md`
- **Startup Guide:** `STARTUP-GUIDE.md`
- **Quick Start:** `QUICK-START.md`
- **Chatbot Setup:** `HOW-TO-RUN-CHATBOT.md`
- **Troubleshooting:** `OLLAMA-TROUBLESHOOTING-GUIDE.md`

---

## 💡 Pro Tips

1. **Use START-ALL.bat** - Easiest way to start everything
2. **Keep terminals open** - Each service runs in its own window
3. **Check health endpoints** - Verify services are running
4. **Use your IP for mobile** - Not localhost on physical devices
5. **Pull Ollama models first** - They're large (5GB+)
6. **Seed sample data** - Makes testing easier
7. **Clear cache if stuck** - `npx expo start -c`
8. **Check firewall** - Allow port 5000 for mobile testing

---

## 🎉 Quick Win

Want to see it working in 2 minutes?

```bash
# 1. Start everything
START-ALL.bat

# 2. Open admin panel
# Browser opens automatically at http://localhost:5173

# 3. Login with default credentials
# Email: admin@roadsauthority.na
# Password: Admin123!

# 4. Add a news article
# Go to News > Add News

# 5. Check mobile app
# Open Expo Go on your phone
# Scan QR code
# See your news article!
```

**Done!** 🚀
