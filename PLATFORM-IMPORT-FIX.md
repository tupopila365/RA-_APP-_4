# Platform Import Fix

## Issue
The bank-style screen transformations introduced `Platform.OS` references for font family styling but were missing the `Platform` import from React Native, causing a ReferenceError.

## Fix Applied
Added `Platform` to the React Native imports in:

### FAQsScreen.js
```javascript
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Platform, // ← Added this
} from 'react-native';
```

### VacanciesScreen.js
```javascript
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  RefreshControl,
  Alert,
  Linking,
  Dimensions,
  Platform, // ← Added this
} from 'react-native';
```

### FindOfficesScreen.js
✅ Already had Platform imported - no changes needed.

## Result
- All screens now properly import Platform
- Font family styling works correctly across iOS and Android
- No more ReferenceError: Property 'Platform' doesn't exist
- All bank-style improvements remain intact and functional

## Font Family Implementation
The Platform import enables proper font selection:
```javascript
fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
```

This ensures:
- iOS devices use the native System font
- Android devices use Roboto
- Consistent professional typography across platforms