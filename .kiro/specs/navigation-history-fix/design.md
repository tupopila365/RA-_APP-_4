# Design Document: Navigation History Fix

## Overview

The current navigation implementation uses React Navigation v6 with nested stack navigators inside a bottom tab navigator. The issue stems from how nested navigators handle back button behavior and history management. This design addresses the problem by ensuring proper configuration of the navigation structure and implementing correct back button handling across all navigation contexts.

The root cause is that nested stack navigators (NewsStack and MoreStack) within the tab navigator may not be properly configured to handle back navigation, particularly when dealing with the Android hardware back button and iOS back gestures.

## Architecture

### Current Navigation Structure

```
NavigationContainer
└── MainTabs (BottomTabNavigator)
    ├── Home (Screen)
    ├── News (NewsStack - StackNavigator)
    │   ├── NewsList (Screen)
    │   └── NewsDetail (Screen)
    ├── Vacancies (Screen)
    ├── Tenders (Screen)
    └── More (MoreStack - StackNavigator)
        ├── MoreMenu (Screen)
        ├── Chatbot (Screen)
        ├── FAQs (Screen)
        ├── FindOffices (Screen)
        └── Settings (Screen)
```

### Design Approach

The solution involves:

1. **Proper Stack Navigator Configuration**: Ensure all stack navigators have correct screen options and back button handling
2. **Hardware Back Button Handling**: Implement proper Android back button behavior using React Navigation's built-in handling
3. **Navigation State Management**: Ensure navigation state is properly maintained across tab switches
4. **Header Configuration**: Standardize header back button appearance and behavior

## Components and Interfaces

### 1. Navigation Configuration

**Component**: `App.js` - Main navigation setup

**Changes Required**:
- Add `screenListeners` to handle back button events
- Configure `detachInactiveScreens` option for tab navigator to preserve stack state
- Ensure proper `headerBackTitleVisible` and `headerBackTitle` configuration
- Add `gestureEnabled` for iOS swipe-back gestures

**Interface**:
```javascript
// Tab Navigator Options
{
  detachInactiveScreens: false, // Keep screens mounted to preserve state
  backBehavior: 'history', // Navigate back through history, not initial route
}

// Stack Navigator Options
{
  headerBackTitleVisible: false, // Clean back button on iOS
  gestureEnabled: true, // Enable swipe back on iOS
  animation: 'default', // Smooth transitions
}
```

### 2. Stack Navigator Components

**Components**: `NewsStack`, `MoreStack`

**Changes Required**:
- Ensure consistent `screenOptions` configuration
- Add proper back button handling in headers
- Configure navigation options for each screen

**Key Configuration**:
```javascript
screenOptions={{
  headerShown: true,
  headerBackTitleVisible: false,
  gestureEnabled: true,
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' },
}}
```

### 3. Screen Components

**Components**: All screen components (NewsDetailScreen, ChatbotScreen, etc.)

**Changes Required**:
- Ensure screens receive and properly use the `navigation` prop
- Remove any custom back button handlers that might interfere with default behavior
- Verify that screens don't prevent default back actions

## Data Models

No data model changes are required. This is purely a navigation configuration fix.

## Error Handling

### Back Button Edge Cases

1. **Empty Stack Handling**:
   - When navigation stack is empty and back is pressed, the app should exit gracefully
   - React Navigation handles this by default, but we'll verify the behavior

2. **Tab Switch During Navigation**:
   - When user switches tabs while deep in a stack, the stack state must be preserved
   - Handled by `detachInactiveScreens: false` option

3. **Rapid Back Button Presses**:
   - Prevent navigation errors from rapid back button presses
   - React Navigation's built-in debouncing handles this

### Error Scenarios

| Scenario | Current Behavior | Expected Behavior | Solution |
|----------|------------------|-------------------|----------|
| Back on nested screen | May not navigate back | Navigate to previous screen | Configure stack options properly |
| Back on root tab screen | Undefined | Exit app | Default React Navigation behavior |
| Tab switch with deep stack | Stack may reset | Stack preserved | Set `detachInactiveScreens: false` |
| iOS swipe back | May not work | Smooth swipe back | Enable `gestureEnabled: true` |

## Testing Strategy

### Manual Testing Checklist

1. **Basic Back Navigation**:
   - Navigate from NewsList → NewsDetail → Press back → Should return to NewsList
   - Navigate from MoreMenu → Chatbot → Press back → Should return to MoreMenu
   - Navigate from MoreMenu → Settings → Press back → Should return to MoreMenu

2. **Cross-Tab Navigation**:
   - Start on Home tab
   - Navigate to News tab → NewsDetail
   - Switch to More tab → Chatbot
   - Press back → Should return to MoreMenu
   - Switch to News tab → Should still be on NewsDetail
   - Press back → Should return to NewsList

3. **Hardware Back Button (Android)**:
   - Test all scenarios above using hardware back button
   - Verify back button exits app when on root tab screen

4. **Swipe Back Gesture (iOS)**:
   - Test swipe-back gesture on all nested screens
   - Verify smooth animation and proper navigation

5. **Edge Cases**:
   - Rapid back button presses
   - Back button on root screens
   - Deep navigation stacks (3+ screens deep)

### Automated Testing

While this is primarily a navigation configuration fix, we can add basic navigation tests:

```javascript
// Example test structure (not implemented in this fix)
describe('Navigation History', () => {
  it('should navigate back from NewsDetail to NewsList', () => {
    // Navigate to NewsDetail
    // Press back
    // Assert current screen is NewsList
  });
  
  it('should preserve stack state when switching tabs', () => {
    // Navigate deep into News stack
    // Switch to More tab
    // Switch back to News tab
    // Assert still on deep screen
  });
});
```

## Implementation Notes

### Key Configuration Changes

1. **Tab Navigator** (`MainTabs`):
   ```javascript
   <Tab.Navigator
     screenOptions={{
       // ... existing options
     }}
     backBehavior="history" // Add this
     detachInactiveScreens={false} // Add this
   >
   ```

2. **Stack Navigators** (`NewsStack`, `MoreStack`):
   ```javascript
   <Stack.Navigator
     screenOptions={{
       headerBackTitleVisible: false, // Add this
       gestureEnabled: true, // Add this
       // ... existing options
     }}
   >
   ```

3. **NavigationContainer**:
   - No changes needed; default behavior is correct

### Platform-Specific Considerations

**Android**:
- Hardware back button is handled automatically by React Navigation
- Ensure no custom `BackHandler` implementations interfere
- Test on devices with gesture navigation and button navigation

**iOS**:
- Swipe-back gesture requires `gestureEnabled: true`
- Header back button styling with `headerBackTitleVisible: false` for cleaner UI
- Test on devices with and without home button

### Performance Considerations

Setting `detachInactiveScreens: false` keeps all tab screens mounted in memory. This:
- **Pros**: Preserves navigation state, faster tab switching
- **Cons**: Slightly higher memory usage
- **Mitigation**: For this app size, the memory impact is negligible

## Dependencies

No new dependencies required. The fix uses existing React Navigation v6 features:
- `@react-navigation/native`: ^6.1.9
- `@react-navigation/native-stack`: ^6.9.17
- `@react-navigation/bottom-tabs`: ^6.5.11

## Migration Path

This is a configuration-only change with no breaking changes:
1. Update navigation configuration in App.js
2. Test on both iOS and Android
3. Verify all navigation flows work as expected
4. Deploy with next app update

No data migration or user action required.
