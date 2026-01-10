# VacanciesScreen isSmallScreen Error Fix

## Problem
The VacanciesScreen was throwing a ReferenceError: `Property 'isSmallScreen' doesn't exist` because the `isSmallScreen` variable was being used in the styles but was not defined.

## Root Cause
When I added the contact information styles to the VacanciesScreen, I used `isSmallScreen` in the style definitions but forgot to define this variable in the `getStyles` function scope.

## Solution Applied

### 1. Added Dimensions Import
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
  ActivityIndicator,
  Linking,
  Dimensions, // Added this import
} from 'react-native';
```

### 2. Defined isSmallScreen in getStyles Function
```javascript
function getStyles(colors) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375; // Define responsive breakpoint
  
  return StyleSheet.create({
    // ... styles that use isSmallScreen
  });
}
```

## Fixed Styles
The following styles now work correctly with responsive sizing:

- `contactTitle`: Font size 14 (small) / 15 (normal)
- `contactText`: Font size 13 (small) / 14 (normal)  
- `submissionButtonText`: Font size 14 (small) / 15 (normal)
- `instructionsText`: Font size 13 (small) / 14 (normal)

## Responsive Breakpoint
- **Small Screen**: Width < 375px (uses smaller font sizes)
- **Normal Screen**: Width >= 375px (uses standard font sizes)

## Files Modified
- ✅ `app/screens/VacanciesScreen.js` - Added Dimensions import and isSmallScreen definition

## Testing
The VacanciesScreen should now load without errors and display contact information with appropriate responsive font sizes based on screen width.

This fix ensures the contact information section displays properly on all device sizes while maintaining good readability.