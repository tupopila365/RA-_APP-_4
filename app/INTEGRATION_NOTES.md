# Mobile App Integration Notes

## Overview

The React Native mobile app has been successfully integrated into the monorepo structure. This document outlines the changes made and provides guidance for developers.

## Changes Made

### 1. Environment Configuration

**Created:**
- `.env.example` - Template for environment variables
- `config/env.js` - Environment-based configuration module

**Purpose:** Centralized configuration management that automatically switches between development and production settings.

### 2. API Service Updates

**Modified:**
- `services/api.js` - Updated to use environment configuration

**Changes:**
- Replaced hardcoded API URL with environment-based configuration
- API base URL now automatically adjusts based on environment (__DEV__ flag)

### 3. Build Configuration

**Modified:**
- `babel.config.js` - Added `config` alias for easier imports
- `jsconfig.json` - Added `config/*` path mapping for IDE support

**Benefits:**
- Cleaner imports: `import ENV from 'config/env'` instead of `import ENV from '../config/env'`
- Better IDE autocomplete and navigation

### 4. Documentation

**Updated:**
- `README.md` - Added comprehensive setup instructions
- `package.json` - Added description field

**Created:**
- `INTEGRATION_NOTES.md` - This file

## Configuration Guide

### Development Setup

1. **Local Development (Emulator/Simulator):**
   ```javascript
   // config/env.js - development section
   API_BASE_URL: 'http://localhost:3000/api'
   ```

2. **Local Development (Physical Device):**
   ```javascript
   // config/env.js - development section
   API_BASE_URL: 'http://192.168.1.100:3000/api' // Replace with your IP
   ```

3. **Production:**
   ```javascript
   // config/env.js - production section
   API_BASE_URL: 'https://api.roadsauthority.na/api'
   ```

### Finding Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x).

### Android Emulator Special Case

If you're using the Android emulator, you can use `http://10.0.2.2:3000/api` to access localhost on your host machine.

## API Endpoints

The app currently uses the following endpoints:

- `GET /api/news` - Fetch news articles
- `GET /api/news/:id` - Fetch single news article
- `GET /api/vacancies` - Fetch job vacancies
- `GET /api/tenders` - Fetch tenders
- `GET /api/locations` - Fetch office locations

### Upcoming Endpoints (To Be Implemented)

- `GET /api/banners` - Fetch homepage banners
- `POST /api/chatbot/query` - Send chatbot queries

## Migration Checklist

✅ Environment configuration created
✅ API service updated to use environment config
✅ Build configuration updated (babel, jsconfig)
✅ Documentation updated
✅ .env.example created

### Pending Tasks (Next Steps)

The following features will be implemented in subsequent tasks:

- [ ] Task 32: Update mobile app services for new backend
- [ ] Task 33: Implement banner carousel on Home Screen
- [ ] Task 34: Enhance News Screen with search functionality
- [ ] Task 35: Enhance Tenders Screen with download and filtering
- [ ] Task 36: Enhance Vacancies Screen with filtering
- [ ] Task 37: Enhance Locations Screen with maps integration
- [ ] Task 38: Implement Chatbot Screen
- [ ] Task 39: Update mobile app navigation

## Testing the Integration

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend should start on `http://localhost:3000`.

### 2. Start the Mobile App

```bash
cd app
npm install
npm start
```

### 3. Verify Connection

- Open the app on your device/emulator
- Navigate to any screen that fetches data (News, Vacancies, etc.)
- Verify that data is loading from the backend
- Check the console for any API errors

### 4. Troubleshooting

**Issue: "Network request failed"**
- Verify the backend is running
- Check the API_BASE_URL in `config/env.js`
- If using a physical device, ensure it's on the same network as your computer
- Try using your computer's IP address instead of localhost

**Issue: "Cannot connect to localhost"**
- On Android emulator, try `http://10.0.2.2:3000/api`
- On physical device, use your computer's local IP address

**Issue: "CORS error"**
- Verify the backend CORS configuration allows requests from your app
- Check `backend/.env` for CORS_ORIGIN setting

## Best Practices

1. **Never commit `.env` files** - Only commit `.env.example`
2. **Update API_BASE_URL for your environment** - Don't use localhost on physical devices
3. **Test on both platforms** - iOS and Android may behave differently
4. **Use the config module** - Don't hardcode URLs or configuration values
5. **Keep environment configs in sync** - Update both development and production sections

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Monorepo Root README](../README-MONOREPO.md)
- [Backend API Documentation](../API.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the backend API documentation
3. Check the monorepo root README for setup instructions
4. Review the task list in `.kiro/specs/full-stack-monorepo/tasks.md`
