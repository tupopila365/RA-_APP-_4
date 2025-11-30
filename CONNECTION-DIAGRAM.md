# 🔌 Connection Diagram

## What Connects to What

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR PHONE/EMULATOR                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Roads Authority Mobile App                  │    │
│  │                                                     │    │
│  │  📱 News Screen                                     │    │
│  │  📱 Offices Screen                                  │    │
│  │  📱 FAQs Screen                                     │    │
│  │                                                     │    │
│  │  Uses: http://localhost:5000/api                   │    │
│  │  (or http://YOUR-IP:5000/api for physical device)  │    │
│  └────────────────────┬────────────────────────────────┘    │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ HTTP Requests
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Backend API (Node.js + Express)            │    │
│  │                                                     │    │
│  │  🚀 Port: 5000                                     │    │
│  │  📂 Location: /backend                             │    │
│  │                                                     │    │
│  │  Endpoints:                                        │    │
│  │  • GET  /api/news                                  │    │
│  │  • GET  /api/locations                             │    │
│  │  • POST /api/chatbot/query                         │    │
│  │                                                     │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       │ MongoDB Connection                   │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │         MongoDB Database                            │    │
│  │                                                     │    │
│  │  🗄️  Port: 27017 (local)                           │    │
│  │  ☁️  OR MongoDB Atlas (cloud)                      │    │
│  │                                                     │    │
│  │  Collections:                                      │    │
│  │  • news                                            │    │
│  │  • locations                                       │    │
│  │  • users                                           │    │
│  │  • tenders                                         │    │
│  │  • vacancies                                       │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Redis (Optional - for caching)              │    │
│  │  🔴 Port: 6379                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         RAG Service (Optional - for chatbot)        │    │
│  │  🤖 Port: 8000                                      │    │
│  │  📂 Location: /rag-service                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Connection Requirements

### Minimum Setup (News & Offices work)
```
✅ Backend API (Port 5000)
✅ MongoDB (Port 27017 or Atlas)
✅ Mobile App
```

### Full Setup (All features including chatbot)
```
✅ Backend API (Port 5000)
✅ MongoDB (Port 27017 or Atlas)
✅ Redis (Port 6379) - Optional
✅ RAG Service (Port 8000) - Optional
✅ Mobile App
```

---

## 📡 Network Configuration

### Development on Same Computer (Emulator)
```
Mobile App → http://localhost:5000/api → Backend
```

### Development on Physical Device
```
Mobile App → http://192.168.1.XXX:5000/api → Backend
              (Your computer's local IP)
```

**How to find your IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Look for: `192.168.x.x` or `10.0.x.x`

---

## 🔐 Ports Used

| Service | Port | Required | Purpose |
|---------|------|----------|---------|
| Backend API | 5000 | ✅ Yes | Main API server |
| MongoDB | 27017 | ✅ Yes | Database |
| Redis | 6379 | ⚠️ Optional | Caching |
| RAG Service | 8000 | ⚠️ Optional | AI Chatbot |
| Admin Panel | 5173 | ⚠️ Optional | Content management |
| Expo DevTools | 19000-19002 | ✅ Yes | Mobile app dev |

---

## 🌐 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/roads-authority
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roads-authority

# Security (REQUIRED)
JWT_SECRET=your-secret-key-here

# Optional Services
REDIS_HOST=localhost
REDIS_PORT=6379
RAG_SERVICE_URL=http://localhost:8000
```

### Mobile App (config/env.js)
```javascript
development: {
  API_BASE_URL: 'http://localhost:5000/api',
  // For physical device:
  // API_BASE_URL: 'http://192.168.1.100:5000/api',
}
```

---

## ✅ Connection Checklist

Before running the app:

- [ ] MongoDB is running (check with `mongod --version`)
- [ ] Backend is running on port 5000
- [ ] Backend can connect to MongoDB (check console logs)
- [ ] Mobile app has correct API_BASE_URL
- [ ] Phone/computer on same WiFi (for physical device)
- [ ] Firewall allows port 5000 (if needed)

---

## 🧪 Test Connections

### Test Backend
```bash
# Should return: {"status":"ok"}
curl http://localhost:5000/api/health
```

### Test MongoDB
```bash
# Should show version
mongod --version
```

### Test from Mobile App
1. Open app
2. Go to News screen
3. If you see news articles → ✅ Connected!
4. If you see error → ❌ Check backend logs

---

## 🔥 Common Connection Issues

### Issue: "Network request failed"
**Solution:**
- Backend not running → Start with `npm run dev`
- Wrong IP address → Update `API_BASE_URL` in `app/config/env.js`
- Different WiFi → Connect phone and computer to same network
- Firewall blocking → Allow port 5000

### Issue: "MongoDB connection failed"
**Solution:**
- MongoDB not running → Start with `mongod`
- Wrong connection string → Check `MONGODB_URI` in `.env`
- Atlas IP not whitelisted → Add your IP in Atlas dashboard

### Issue: "Cannot connect to Expo"
**Solution:**
- Clear cache → `npx expo start -c`
- Reinstall → `rm -rf node_modules && npm install`
- Update Expo → `npm install expo@latest`

---

## 📞 Service URLs

### Local Development
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`
- RAG Service: `http://localhost:8000`
- Admin Panel: `http://localhost:5173`

### Production (Example)
- Backend API: `https://api.roadsauthority.na`
- MongoDB: `mongodb+srv://cluster.mongodb.net`
- Redis: `redis://production-redis:6379`
- RAG Service: `https://rag.roadsauthority.na`
- Admin Panel: `https://admin.roadsauthority.na`

---

**Need more help? See `STARTUP-GUIDE.md` for detailed instructions!**
