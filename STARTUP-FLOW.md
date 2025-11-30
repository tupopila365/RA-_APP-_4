# 🔄 Application Startup Flow

## Visual Startup Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                    PREREQUISITES                             │
│  ✅ Node.js 18+                                             │
│  ✅ MongoDB (local or Atlas)                                │
│  ⚠️  Python 3.9+ (optional - for chatbot)                   │
│  ⚠️  Ollama (optional - for chatbot)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  RUN: START-ALL.bat                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│  Check MongoDB   │                  │  Check Ollama    │
│   (Required)     │                  │   (Optional)     │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         │ Running? ✅                         │ Running? ⚠️
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│              START BACKEND API (Port 5000)                   │
│  • npm install (if needed)                                   │
│  • Load .env configuration                                   │
│  • Connect to MongoDB                                        │
│  • Start Express server                                      │
│  ✅ http://localhost:5000                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Wait 5 seconds...
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────────┐            ┌──────────────────────┐
│  START ADMIN PANEL   │            │  START MOBILE APP    │
│    (Port 5173)       │            │   (Expo DevTools)    │
│                      │            │                      │
│  • npm install       │            │  • npm install       │
│  • Start Vite dev    │            │  • Start Expo        │
│  ✅ localhost:5173   │            │  ✅ QR Code shown    │
└──────────────────────┘            └──────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   ALL SERVICES RUNNING!                      │
│                                                              │
│  🌐 Backend:  http://localhost:5000                         │
│  🎨 Admin:    http://localhost:5173                         │
│  📱 Mobile:   Scan QR with Expo Go app                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Optional: Add Chatbot

```
┌─────────────────────────────────────────────────────────────┐
│              RUN: START-RAG.bat (New Terminal)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Check Ollama                              │
│  • Is Ollama running? (port 11434)                          │
│  • Are models available?                                     │
│    - nomic-embed-text                                        │
│    - llama3.1:8b                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Setup Python Environment                        │
│  • Create venv (if not exists)                              │
│  • Activate venv                                             │
│  • Install requirements.txt                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            START RAG SERVICE (Port 8001)                     │
│  • Load configuration                                        │
│  • Connect to Ollama                                         │
│  • Initialize ChromaDB                                       │
│  • Start FastAPI server                                      │
│  ✅ http://localhost:8001                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              COMPLETE SYSTEM RUNNING!                        │
│                                                              │
│  🌐 Backend:  http://localhost:5000                         │
│  🎨 Admin:    http://localhost:5173                         │
│  📱 Mobile:   Expo Go app                                   │
│  🤖 Chatbot:  http://localhost:8001                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Service Dependencies

```
┌─────────────┐
│   MongoDB   │ ◄─────────────┐
└─────────────┘                │
                               │
┌─────────────┐         ┌──────────────┐
│   Ollama    │ ◄────── │ RAG Service  │
└─────────────┘         │  (Port 8001) │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  Backend API │
                        │  (Port 5000) │
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
         │ Admin Panel │ │Mobile App│ │  External  │
         │ (Port 5173) │ │  (Expo)  │ │   Clients  │
         └─────────────┘ └──────────┘ └────────────┘
```

---

## Startup Time Estimates

| Service | First Time | Subsequent Starts |
|---------|-----------|-------------------|
| **Backend** | 30-60 sec | 10-15 sec |
| **Admin Panel** | 20-30 sec | 5-10 sec |
| **Mobile App** | 30-45 sec | 10-20 sec |
| **RAG Service** | 60-90 sec | 20-30 sec |
| **Total (without RAG)** | ~2 minutes | ~30 seconds |
| **Total (with RAG)** | ~3 minutes | ~1 minute |

---

## Health Check Sequence

After starting, verify each service:

```bash
# 1. Backend API
curl http://localhost:5000/api/health
# Expected: {"status":"ok"}

# 2. Admin Panel
curl http://localhost:5173
# Expected: HTML response

# 3. RAG Service (if running)
curl http://localhost:8001/health
# Expected: {"status":"healthy"}

# 4. Ollama (if running)
curl http://localhost:11434/api/tags
# Expected: {"models":[...]}
```

---

## Common Startup Scenarios

### Scenario 1: Development (No Chatbot)
```bash
START-ALL.bat
```
**Services:** Backend + Admin + Mobile  
**Time:** ~2 minutes first time, ~30 seconds after  
**Use Case:** Frontend/backend development

### Scenario 2: Full Stack with AI
```bash
# Terminal 1
START-ALL.bat

# Terminal 2
START-RAG.bat
```
**Services:** Backend + Admin + Mobile + RAG  
**Time:** ~3 minutes first time, ~1 minute after  
**Use Case:** Testing chatbot features

### Scenario 3: Backend Only
```bash
cd backend
npm run dev
```
**Services:** Backend only  
**Time:** ~30 seconds  
**Use Case:** API development/testing

### Scenario 4: Mobile Only (Backend Running)
```bash
cd app
npm start
```
**Services:** Mobile app only  
**Time:** ~30 seconds  
**Use Case:** UI development

---

## Shutdown Sequence

### Quick Shutdown
```bash
STOP-ALL.bat
```

### Manual Shutdown
```
1. Close Mobile App terminal (Ctrl+C)
2. Close Admin Panel terminal (Ctrl+C)
3. Close Backend terminal (Ctrl+C)
4. Close RAG Service terminal (Ctrl+C)
5. Stop Ollama (optional)
6. Stop MongoDB (optional)
```

---

## Troubleshooting Flow

```
Service won't start?
        │
        ▼
┌─────────────────┐
│ Check port free │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check .env file │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check deps      │
│ npm install     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check logs      │
│ for errors      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Still broken?   │
│ See docs below  │
└─────────────────┘
```

**Documentation:**
- Backend issues: `BACKEND-STARTUP-FIX.md`
- Chatbot issues: `OLLAMA-TROUBLESHOOTING-GUIDE.md`
- Network issues: `NETWORK-TROUBLESHOOTING.md`

---

## Quick Commands Reference

```bash
# Start everything
START-ALL.bat

# Start with chatbot
START-ALL.bat && START-RAG.bat

# Stop everything
STOP-ALL.bat

# Check health
curl http://localhost:5000/api/health
curl http://localhost:8001/health

# Debug RAG
cd rag-service
python debug_rag_system.py

# View logs
# Each service runs in its own terminal window
```

---

## Success Indicators

You know everything is working when:

✅ Backend terminal shows: `Server running on port 5000`  
✅ Admin panel opens in browser automatically  
✅ Mobile app shows QR code in Expo DevTools  
✅ RAG service shows: `Application startup complete`  
✅ Health checks return `200 OK`  
✅ Mobile app loads on device/simulator  
✅ Can create news article in admin panel  
✅ News appears in mobile app  

---

## Next Steps After Startup

1. **Seed sample data** (optional)
   ```bash
   cd backend
   npm run seed:admin
   npm run seed:news
   ```

2. **Test mobile app**
   - Scan QR code with Expo Go
   - Browse news, offices, FAQs

3. **Upload documents** (for chatbot)
   - Go to http://localhost:5173/documents
   - Upload PDF files

4. **Customize configuration**
   - Update `backend/.env`
   - Update `app/config/env.js`

---

**You're ready to develop!** 🚀
