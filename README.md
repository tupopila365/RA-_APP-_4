# 🚗 Roads Authority Namibia - Full Stack Application

A premium cross-platform application for Roads Authority Namibia.

## 🚀 Quick Start - Start Everything in One Command

```bash
START-ALL.bat
```

This starts:
- ✅ Backend API (port 5000)
- ✅ Admin Panel (port 5173)  
- ✅ Mobile App (Expo)

**📖 For detailed instructions, see:** [`START-HERE.md`](START-HERE.md)

---

## 📚 Essential Documentation

| Document | Purpose |
|----------|---------|
| **[START-HERE.md](START-HERE.md)** | 👈 **Start here!** Complete startup guide |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Quick commands & troubleshooting |
| [STARTUP-FLOW.md](STARTUP-FLOW.md) | Visual startup sequence |
| [HOW-TO-RUN-CHATBOT.md](HOW-TO-RUN-CHATBOT.md) | AI Chatbot setup |

---

## 🏗️ Project Structure

This monorepo contains:

- **`/app`** - Mobile App (React Native + Expo)
- **`/backend`** - Backend API (Node.js + Express + MongoDB)
- **`/admin`** - Admin Panel (React + Vite)
- **`/rag-service`** - AI Chatbot (Python + FastAPI + Ollama)

---

## Features

- **Splash Screen**: Beautiful animated splash screen with RA logo
- **Home Screen**: Welcome message, poster banners, quick access menu, and search functionality
- **News**: Latest news and announcements from Roads Authority
- **Vacancies**: Search and filter job vacancies (Full-time, Part-time, Bursaries, Internships)
- **Tenders**: Search, filter, and download tender documents
- **RA Chatbot**: Interactive chatbot for user assistance
- **FAQs**: Frequently asked questions with expandable answers
- **Find Offices**: Locate RA and NATIS offices with directions and contact info
- **Settings**: Dark/Light mode toggle and push notifications

## Theme Colors

- Primary (Sky Blue): #00B4E6
- Secondary (Yellow): #FFD700
- Background: Black/White (theme-dependent)
- Text: White/Black (theme-dependent)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## Platform Support

- ✅ iOS (iPhone & iPad)
- ✅ Android (Phone & Tablet)
- ✅ Responsive design for all screen sizes

## Navigation

The app uses a bottom tab navigation with 5 main tabs:
1. **Home** - Main dashboard
2. **News** - Latest updates
3. **Vacancies** - Job opportunities
4. **Tenders** - Tender information
5. **More** - Additional features (Chatbot, FAQs, Find Offices, Settings)

## External Links

- NATIS Online: Opens https://online.ra.org.na/#/ in browser

## Requirements

- Node.js 14+ 
- Expo CLI
- iOS Simulator (for iOS) or Android Studio (for Android)
- Expo Go app (for physical device testing)

## Notes

- Users cannot submit tenders or applications through the app
- All external submissions must be done through official channels
- Push notifications require device permissions
- Dark mode follows system preferences

## Development

Built with:
- React Native
- Expo SDK 50
- React Navigation
- Expo Notifications
- Expo Web Browser

