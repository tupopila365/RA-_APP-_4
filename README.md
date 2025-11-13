# Roads Authority Namibia Mobile App

A premium cross-platform mobile application for Roads Authority Namibia, built with React Native and Expo.

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

