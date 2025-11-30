# Mobile App

React Native + TypeScript mobile application for Roads Authority Namibia.

## Status

✅ **Integrated:** The React Native app has been successfully integrated into the monorepo structure. The app is configured to connect to the new backend API.

## Overview

This mobile app provides:
- Browse news articles with search and filtering
- View job vacancies with type filtering
- View and download tender documents
- Find office locations with maps integration
- AI-powered chatbot for instant answers
- Homepage banner carousel
- Offline support for cached content

## Tech Stack

- **Framework:** React Native
- **Language:** TypeScript (migration in progress)
- **Navigation:** React Navigation
- **State Management:** React Context + Hooks
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Maps:** React Native Maps
- **File System:** react-native-fs or expo-file-system
- **Testing:** Jest + React Native Testing Library

## Setup

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio with emulator
- Physical device with Expo Go app (optional)

### Installation

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   - For local development on emulator: `API_BASE_URL=http://localhost:3000/api`
   - For local development on physical device: `API_BASE_URL=http://YOUR_IP:3000/api`
   - For production: `API_BASE_URL=https://api.roadsauthority.na/api`

### Running the App

**Start the development server:**
```bash
npm start
```

**Run on iOS Simulator (Mac only):**
```bash
npm run ios
```

**Run on Android Emulator:**
```bash
npm run android
```

**Run on Physical Device:**
1. Install Expo Go app from App Store or Google Play
2. Scan the QR code shown in the terminal
3. Make sure your device and computer are on the same network

### Configuration

The app uses environment-based configuration located in `config/env.js`:

- **Development mode:** Uses `http://localhost:3000/api` by default
- **Production mode:** Uses `https://api.roadsauthority.na/api`

To change the API URL for development:
1. Edit `config/env.js`
2. Update the `API_BASE_URL` in the `development` section
3. Restart the Expo development server

### Testing on Physical Devices

When testing on a physical device, you need to use your computer's local IP address instead of `localhost`:

1. Find your IP address:
   - **Windows:** Run `ipconfig` in command prompt
   - **Mac/Linux:** Run `ifconfig` or `ip addr` in terminal
   - Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x)

2. Update `config/env.js`:
   ```javascript
   development: {
     API_BASE_URL: 'http://192.168.1.100:3000/api', // Replace with your IP
     // ...
   }
   ```

3. Restart the Expo server

See the [root README](../README-MONOREPO.md) for complete monorepo setup instructions.

## Project Structure

```
app/
├── App.js                        # Main app entry
├── components/                   # React Native components
├── screens/                      # Screen components
│   ├── HomeScreen.js            # Homepage with banners
│   ├── NewsScreen.js            # News list with search
│   ├── NewsDetailScreen.js      # News article detail
│   ├── VacanciesScreen.js       # Job vacancies
│   ├── TendersScreen.js         # Tenders with download
│   ├── LocationsScreen.js       # Office locations
│   └── ChatbotScreen.js         # AI chatbot (NEW)
├── services/                     # API services
│   ├── api.js                   # API client
│   ├── newsService.js
│   ├── vacanciesService.js
│   ├── tendersService.js
│   ├── locationsService.js
│   ├── bannersService.js        # NEW
│   └── chatbotService.js        # NEW
├── navigation/                   # Navigation configuration
├── context/                      # React context
├── hooks/                        # Custom hooks
├── utils/                        # Utility functions
└── package.json
```

## Features

### Home Screen
- Banner carousel with promotional content
- Quick access to main sections
- Latest news preview

### News
- List of news articles
- Search by title and category
- Category filtering
- Pull-to-refresh
- Article detail view with images

### Vacancies
- List of job openings
- Filter by type (Full-time, Part-time, Bursaries, Internships)
- Search functionality
- Expandable cards with full details
- Requirements and responsibilities
- Application deadlines
- Optional PDF download

### Tenders
- List of procurement opportunities
- Filter by status (Open, Closed, Upcoming)
- Search functionality
- Reference number and closing date
- Tender value display
- Download PDF documents

### Locations
- List of office locations
- Filter by region
- Grouped by region
- Tap to open in maps app
- Contact information
- Office hours

### Chatbot (NEW)
- AI-powered Q&A interface
- Message bubbles for user and AI
- Loading indicators
- Source document references
- Persistent chat history
- Tap sources to view documents

## Platform Support

- **iOS:** 13.0+
- **Android:** 6.0+ (API level 23+)

## Next Steps

1. Move existing React Native app into monorepo
2. Update API configuration to point to new backend
3. Implement banner carousel on home screen
4. Enhance news screen with search
5. Enhance tenders screen with download
6. Enhance vacancies screen with filtering
7. Enhance locations screen with maps
8. Implement new chatbot screen
9. Add tests

Refer to the implementation tasks in `.kiro/specs/full-stack-monorepo/tasks.md`

## API Configuration

The app connects to the backend API using the configuration in `config/env.js`. The API client in `services/api.js` automatically uses the correct base URL based on the environment.

### API Endpoints Used

- `GET /api/news` - Fetch news articles
- `GET /api/news/:id` - Fetch single news article
- `GET /api/vacancies` - Fetch job vacancies
- `GET /api/tenders` - Fetch tenders
- `GET /api/locations` - Fetch office locations
- `GET /api/banners` - Fetch homepage banners (to be implemented)
- `POST /api/chatbot/query` - Send chatbot queries (to be implemented)

## Development Notes

### Completed Integration Tasks

✅ App files integrated into monorepo structure
✅ Environment configuration created (`.env.example`, `config/env.js`)
✅ API service updated to use environment-based configuration
✅ Package.json updated with description
✅ Babel config updated with config alias
✅ README updated with setup instructions

### Upcoming Tasks

The following features will be implemented in subsequent tasks:
- Banner carousel on home screen
- Enhanced news screen with search functionality
- Enhanced tenders screen with PDF download
- Enhanced vacancies screen with type filtering
- Enhanced locations screen with maps integration
- New chatbot screen with AI-powered Q&A
- Service files for banners and chatbot APIs

Refer to the implementation tasks in `.kiro/specs/full-stack-monorepo/tasks.md` for details.
