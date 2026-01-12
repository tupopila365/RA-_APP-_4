# Skeleton Loading Migration Guide

## Overview

The mobile app has been updated to use modern skeleton loading components that follow banking app design patterns. All old spinner components have been replaced with sophisticated skeleton loaders that provide better user experience and visual feedback.

## What Changed

### Old Components (Deprecated)
- `LoadingSpinner` - Basic circular spinner
- `LoadingIndicator` - Enhanced spinner with messages
- `NewsCardSkeleton` - Basic news card skeleton
- `ActivityIndicator` (direct usage) - React Native spinner

### New Components (Modern)
- `SkeletonLoader` - Advanced skeleton component with multiple types
- `NewsListSkeleton` - News feed skeleton preset
- `ListScreenSkeleton` - List screen skeleton preset
- `TableSkeleton` - Data table skeleton preset
- `FormSkeleton` - Form loading skeleton preset
- `DashboardSkeleton` - Dashboard widget skeleton preset
- And many more presets...

## Migration Examples

### Basic Loading Screen
```javascript
// OLD
import { LoadingSpinner } from '../components';
<LoadingSpinner message="Loading data..." />

// NEW
import { ListScreenSkeleton } from '../components';
<ListScreenSkeleton count={5} />
```

### News Screen Loading
```javascript
// OLD
import { NewsCardSkeletonList } from '../components';
<NewsCardSkeletonList count={5} showImage={true} />

// NEW
import { NewsListSkeleton } from '../components';
<NewsListSkeleton count={5} />
```

### Inline Loading Indicators
```javascript
// OLD
import { ActivityIndicator } from 'react-native';
<ActivityIndicator size="small" color={colors.primary} />

// NEW
import { SkeletonLoader } from '../components';
<SkeletonLoader type="circle" width={16} height={16} />
```

### Form Loading
```javascript
// OLD
<LoadingIndicator message="Loading form..." />

// NEW
import { FormSkeleton } from '../components';
<FormSkeleton />
```

### Table Loading
```javascript
// OLD
<LoadingSpinner />

// NEW
import { TableSkeleton } from '../components';
<TableSkeleton rows={6} />
```

## Available Skeleton Types

### Basic Types
- `card` - Standard card layout
- `list-item` - List item with icon and text
- `news` - News article card
- `profile` - User profile layout
- `table-row` - Data table row
- `button` - Button placeholder
- `text` - Text line placeholder
- `circle` - Circular placeholder (avatars, icons)
- `form` - Form fields layout
- `dashboard` - Dashboard widget layout

### Preset Components
- `NewsListSkeleton` - News feed loading
- `ListScreenSkeleton` - Generic list screens
- `TableSkeleton` - Data tables
- `FormSkeleton` - Form screens
- `DashboardSkeleton` - Dashboard widgets
- `ProfileScreenSkeleton` - Profile screens
- `CardGridSkeleton` - Card grid layouts
- `ChatSkeleton` - Chat messages
- `SearchResultsSkeleton` - Search results
- `NavigationSkeleton` - Navigation menus
- `SettingsSkeleton` - Settings screens
- `TransactionListSkeleton` - Banking transactions
- `AccountSummarySkeleton` - Account summaries
- `DocumentListSkeleton` - Document lists

## Usage Guidelines

### 1. Choose the Right Type
```javascript
// For list screens
<ListScreenSkeleton count={5} />

// For news feeds
<NewsListSkeleton count={3} />

// For data tables
<TableSkeleton rows={8} />

// For forms
<FormSkeleton />
```

### 2. Custom Skeletons
```javascript
// Custom skeleton with specific type
<SkeletonLoader 
  type="card" 
  count={3} 
  animated={true} 
/>

// Custom dimensions
<SkeletonLoader 
  type="text" 
  width="80%" 
  height={16} 
/>
```

### 3. Inline Loading States
```javascript
// Small circular loader for buttons
<SkeletonLoader type="circle" width={16} height={16} />

// Text placeholder for loading text
<SkeletonLoader type="text" width={120} height={14} />
```

## Benefits of New Skeleton System

### 1. **Banking App Quality**
- Professional shimmer animations
- Consistent with modern banking apps
- Clean, minimal design

### 2. **Better User Experience**
- Shows content structure while loading
- Reduces perceived loading time
- More engaging than spinning circles

### 3. **Accessibility**
- Proper ARIA labels
- Screen reader friendly
- High contrast support

### 4. **Performance**
- Native animations using Animated API
- Optimized rendering
- Smooth 60fps animations

### 5. **Consistency**
- Unified design system
- Theme-aware (dark/light mode)
- Responsive layouts

## Implementation Details

### Animation System
- Uses React Native's Animated API
- Smooth shimmer effect with opacity and translation
- 1.5s animation cycle for optimal UX
- Can be disabled with `animated={false}`

### Theme Integration
- Automatically adapts to light/dark mode
- Uses RATheme color system
- Consistent with app's design language

### Responsive Design
- Adapts to different screen sizes
- Flexible width/height props
- Maintains aspect ratios

## Files Updated

### Screens Updated
- `NewsScreen.js` - News feed skeleton
- `ProcurementPlanScreen.js` - List skeleton
- `ProcurementLegislationScreen.js` - List skeleton
- `ProcurementAwardsScreen.js` - List skeleton
- `VacanciesScreen.js` - List skeleton
- `NotificationsScreen.js` - List skeleton
- `OpeningRegisterScreen.js` - Table skeleton
- `FindOfficesScreen.js` - List skeleton
- `ReportDetailScreen.js` - Profile skeleton
- `SplashScreen.js` - Circle skeleton
- `RoadStatusScreen.js` - List and circle skeletons
- `ReportPotholeScreen.js` - Circle skeletons
- `ReportPotholeScreen_Enhanced.js` - Circle skeletons
- `ReportPotholeScreen_OLD_BACKUP.js` - Circle skeletons
- `PLNApplicationScreen.js` - Circle skeletons
- `PLNApplicationBankStyleScreen.js` - Circle skeletons

### Test Files Updated
- `VacanciesScreen.test.js`
- `TendersScreen.test.js`

### New Files Created
- `SkeletonLoader.js` - Main skeleton component
- `SkeletonPresets.js` - Preset skeleton components
- `SKELETON_MIGRATION_GUIDE.md` - This guide

## Best Practices

### 1. **Match Content Structure**
Choose skeleton types that match your actual content:
```javascript
// For news articles
<NewsListSkeleton count={5} />

// For user profiles  
<ProfileScreenSkeleton />

// For data tables
<TableSkeleton rows={10} />
```

### 2. **Appropriate Count**
Use realistic counts based on typical content:
```javascript
// Mobile screens typically show 5-8 items
<ListScreenSkeleton count={6} />

// News feeds show 3-5 articles initially
<NewsListSkeleton count={4} />
```

### 3. **Consistent Timing**
Keep skeleton display time consistent with actual loading:
```javascript
// Show skeleton while loading
{loading ? (
  <ListScreenSkeleton count={5} />
) : (
  <ActualContent />
)}
```

### 4. **Accessibility**
Always include proper test IDs and accessibility labels:
```javascript
<SkeletonLoader 
  type="card" 
  testID="news-loading-skeleton"
  accessibilityLabel="Loading news articles"
/>
```

## Troubleshooting

### Common Issues

1. **Skeleton not showing**
   - Check import path: `import { SkeletonLoader } from '../components'`
   - Verify component is exported in `index.js`

2. **Animation not working**
   - Ensure `animated={true}` (default)
   - Check if device has animations enabled

3. **Wrong skeleton type**
   - Review available types in this guide
   - Use preset components for common patterns

4. **Performance issues**
   - Reduce skeleton count for complex layouts
   - Use `animated={false}` for very long lists

### Getting Help

- Check component documentation in source files
- Review existing screen implementations
- Test on both iOS and Android devices
- Verify dark/light mode compatibility

## Future Enhancements

### Planned Features
- Custom skeleton shapes
- Gradient animation options
- Pulse animation variants
- Auto-sizing based on content
- Smart skeleton detection

### Contributing
When adding new screens:
1. Choose appropriate skeleton preset
2. Match skeleton count to expected content
3. Test on multiple screen sizes
4. Verify accessibility compliance
5. Update this guide if needed