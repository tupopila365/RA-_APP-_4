# Roads Authority Design (Standalone)

This is a **standalone Expo app** for the Roads Authority design v2. It lives in its own folder and runs independently of the main RA app.

Inspired by professional government/city apps (e.g. City of Windhoek): deep blue header, search bar, service grid, bottom navigation, and reusable form/card components.

## Run locally

```bash
cd roads-authority-design
npm install
npx expo start
```

Then:

- Press **a** for Android emulator  
- Press **i** for iOS simulator  
- Or scan the QR code with **Expo Go** on your device  

## Contents

- **DESIGN_INSTRUCTIONS.md** — Design rules, colors, typography, and component usage.
- **designTokens.js** — Header/nav blue and info box colors.
- **theme/** — Spacing, typography, borderRadius, colors (self-contained).
- **components/** — AppHeader, SearchBar, ScreenContainer, ServiceGrid, ServiceTile, InfoCard, IconGridCard, BottomNavBar, FormInput, DropdownSelector, InfoBox.

## Assets

Expo expects `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`, and `assets/favicon.png`. If missing, create placeholders or copy from the main app’s `app/assets/` so the project starts without asset errors.
