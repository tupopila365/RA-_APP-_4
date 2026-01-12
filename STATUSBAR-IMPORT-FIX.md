# StatusBar Import Fix

## Issue
ProcurementAwardsScreen was using `<StatusBar style="dark" />` but missing the import statement, causing a ReferenceError.

## Fix Applied
Added the missing StatusBar import from expo-status-bar:

```javascript
import { StatusBar } from 'expo-status-bar';
```

## Status
✅ **FIXED** - ProcurementAwardsScreen now has the correct StatusBar import and should no longer throw the ReferenceError.

## Files Modified
- `app/screens/ProcurementAwardsScreen.js`

## Note
OpeningRegisterScreen already had the correct StatusBar import, so no changes were needed there.

The error should now be resolved and the app should run without the StatusBar reference error.