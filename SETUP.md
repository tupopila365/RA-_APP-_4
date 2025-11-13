# Setup Instructions

## Assets Required

You need to create the following image assets and place them in the `assets/` folder:

1. **icon.png** (1024x1024)
   - App icon for iOS and Android
   - Should be square with the Roads Authority logo

2. **splash.png** (1242x2436 recommended)
   - Splash screen image
   - Should contain the Roads Authority logo
   - Background should be black (#000000)

3. **adaptive-icon.png** (1024x1024)
   - Android adaptive icon
   - Should be square with the Roads Authority logo
   - Background should be black (#000000)

4. **favicon.png** (48x48)
   - Web favicon
   - Small version of the logo

5. **notification-icon.png** (96x96)
   - Notification icon
   - Should be white/transparent on transparent background
   - Color: #FFD700 (yellow)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Add your assets to the `assets/` folder (see above)

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator / `a` for Android emulator

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Notes

- The app uses Roads Authority theme colors (Sky Blue #00B4E6, Yellow #FFD700)
- Dark mode is supported and follows system preferences
- All screens are responsive and work on phones, tablets, and iPads
- The app has 5 bottom navigation tabs as requested

