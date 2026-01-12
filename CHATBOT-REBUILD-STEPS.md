# ChatbotScreen Fix - Rebuild Steps

## Why Rebuild is Needed
We added `@react-native-async-storage/async-storage` which is a native dependency that requires:
1. Native module linking
2. Cache clearing
3. Fresh build

## Quick Rebuild (Choose One)

### Option 1: Run Batch Script
```bash
# Run the automated script
REBUILD-CHATBOT-FIX.bat
```

### Option 2: Run PowerShell Script
```powershell
# Run the PowerShell version
.\REBUILD-CHATBOT-FIX.ps1
```

### Option 3: Manual Steps
```bash
# 1. Stop all processes
# Close Expo Dev Tools and any running terminals

# 2. Clean everything
cd app
rm -rf node_modules .expo
npm cache clean --force

# 3. Reinstall dependencies
npm install

# 4. Clear Expo cache and restart
npx expo install --fix
npx expo start --clear --reset-cache
```

## If Still Having Issues

### For Android
```bash
cd app
npx expo run:android
```

### For iOS
```bash
cd app
npx expo run:ios
```

### Nuclear Option (Complete Clean)
```bash
cd app
rm -rf node_modules .expo
npm cache clean --force
npm install
npx expo install --fix
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

## What Should Happen
1. ✅ No more "ExpoCrypto runtime not ready" errors
2. ✅ ChatbotScreen loads normally
3. ✅ Chat history still works (using AsyncStorage)
4. ✅ All existing functionality preserved

## Troubleshooting

### If AsyncStorage errors appear:
```bash
npx expo install @react-native-async-storage/async-storage
```

### If Metro bundler issues:
```bash
npx expo start --clear --reset-cache
```

### If native module issues:
```bash
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

## Status Check
After rebuild, the ChatbotScreen should:
- Load without crypto errors
- Display welcome message
- Allow sending messages
- Save/load chat history
- Show quick replies and actions