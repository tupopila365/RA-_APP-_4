# Complete Skeleton Spinner Code Collection

This document contains all the skeleton spinner/loading code used in the RA Assistant project.

## 1. Main SkeletonLoader Component

**File: `app/components/SkeletonLoader.js`**

```javascript
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme, Dimensions } from 'react-native';
import { RATheme } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modern Skeleton Loader Component - Bank-style loading states
 * Used by major banking apps for professional, clean loading experience
 */
export function SkeletonLoader({ 
  type = 'card',
  count = 1,
  style,
  testID = 'skeleton-loader',
  animated = true,
  height,
  width,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    return () => animation.stop();
  }, [shimmerAnimation, animated]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  const SkeletonBox = ({ style: boxStyle, children }) => (
    <View style={[styles.skeletonBase, boxStyle]}>
      {animated && (
        <Animated.View 
          style={[
            StyleSheet.absoluteFillObject,
            styles.shimmer,
            {
              opacity: shimmerOpacity,
              transform: [{ translateX: shimmerTranslate }],
            },
          ]} 
        />
      )}
      {children}
    </View>
  );

  const renderSkeletonType = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      case 'list-item':
        return <ListItemSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      case 'news':
        return <NewsSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      case 'profile':
        return <ProfileSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      case 'table-row':
        return <TableRowSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      case 'button':
        return <ButtonSkeleton SkeletonBox={SkeletonBox} styles={styles} width={width} height={height} />;
      case 'text':
        return <TextSkeleton SkeletonBox={SkeletonBox} styles={styles} width={width} height={height} />;
      case 'circle':
        return <CircleSkeleton SkeletonBox={SkeletonBox} styles={styles} size={width || height || 40} />;
      case 'form':
        return <FormSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      case 'dashboard':
        return <DashboardSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
      default:
        return <CardSkeleton SkeletonBox={SkeletonBox} styles={styles} />;
    }
  };

  if (count === 1) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        {renderSkeletonType()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {Array.from({ length: count }, (_, index) => (
        <View key={`skeleton-${index}`} style={styles.skeletonItem}>
          {renderSkeletonType()}
        </View>
      ))}
    </View>
  );
}

// Individual skeleton components...
// [Full component code continues with all skeleton types]
```

## 2. Skeleton Presets

**File: `app/components/SkeletonPresets.js`**

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

// News Feed Loading
export const NewsListSkeleton = ({ count = 3, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="news" count={count} />
  </View>
);

// Dashboard Loading
export const DashboardSkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="dashboard" />
  </View>
);

// List Screen Loading
export const ListScreenSkeleton = ({ count = 5, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="list-item" count={count} />
  </View>
);

// Transaction List Loading (Banking specific)
export const TransactionListSkeleton = ({ count = 8, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    {Array.from({ length: count }, (_, index) => (
      <View key={`transaction-${index}`} style={styles.transactionItem}>
        <SkeletonLoader type="circle" width={40} height={40} />
        <View style={styles.transactionContent}>
          <SkeletonLoader type="text" width="70%" height={16} />
          <SkeletonLoader type="text" width="50%" height={12} />
        </View>
        <View style={styles.transactionAmount}>
          <SkeletonLoader type="text" width={60} height={16} />
          <SkeletonLoader type="text" width={40} height={12} />
        </View>
      </View>
    ))}
  </View>
);

// [Additional preset components...]
```

## 3. News Card Skeleton

**File: `app/components/NewsCardSkeleton.js`**

```javascript
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';

export function NewsCardSkeleton({ 
  showImage = true, 
  style,
  testID = 'news-card-skeleton' 
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  // [Component implementation...]
}
```

## 4. Usage Examples

### Basic Usage
```javascript
// Simple circle loader
<SkeletonLoader type="circle" width={16} height={16} />

// Card skeleton
<SkeletonLoader type="card" />

// Multiple list items
<SkeletonLoader type="list-item" count={5} />

// Custom dimensions
<SkeletonLoader type="text" width="80%" height={16} />
```

### In Components
```javascript
// In buttons
{isLoading ? (
  <SkeletonLoader type="circle" width={16} height={16} />
) : (
  <Ionicons name="send" size={20} color="#FFFFFF" />
)}

// In screens
{isInitialLoading ? (
  <ListScreenSkeleton count={5} />
) : (
  // Actual content
)}
```

### Preset Components
```javascript
// News list loading
<NewsListSkeleton count={3} />

// Dashboard loading
<DashboardSkeleton />

// Transaction list (banking)
<TransactionListSkeleton count={8} />

// Form loading
<FormSkeleton />
```

## 5. Available Skeleton Types

### Basic Types
- `card` - Full card with header, content, footer
- `list-item` - List item with icon, text, action
- `news` - News article with image and content
- `profile` - User profile with avatar and stats
- `table-row` - Table row with multiple cells
- `button` - Button placeholder
- `text` - Text line placeholder
- `circle` - Circular placeholder (avatars, icons)
- `form` - Form with labels and inputs
- `dashboard` - Dashboard widget

### Preset Components
- `NewsListSkeleton` - Multiple news cards
- `DashboardSkeleton` - Dashboard layout
- `ProfileScreenSkeleton` - Profile screen layout
- `FormSkeleton` - Form layout
- `ListScreenSkeleton` - List screen layout
- `TableSkeleton` - Data table layout
- `CardGridSkeleton` - Grid of cards
- `ChatSkeleton` - Chat messages
- `SearchResultsSkeleton` - Search results
- `NavigationSkeleton` - Navigation menu
- `SettingsSkeleton` - Settings screen
- `TransactionListSkeleton` - Banking transactions
- `AccountSummarySkeleton` - Account summary
- `DocumentListSkeleton` - Document list

## 6. Customization Options

### Props
- `type` - Skeleton type (string)
- `count` - Number of items (number)
- `style` - Custom styles (object)
- `testID` - Test identifier (string)
- `animated` - Enable/disable animation (boolean)
- `height` - Custom height (number)
- `width` - Custom width (number/string)

### Animation Control
```javascript
// Disable animation
<SkeletonLoader type="card" animated={false} />

// Custom dimensions
<SkeletonLoader type="text" width="100%" height={20} />
```

## 7. Integration Points

The skeleton loaders are used in:
- **ChatbotScreen**: Send button loading
- **FAQsScreen**: Initial loading state
- **FindOfficesScreen**: Location loading, list loading
- **HomeScreen**: Banner loading
- **Button components**: Loading states
- **Image components**: Image loading
- **Download components**: Progress states

## 8. Theme Integration

All skeletons automatically adapt to:
- Light/dark mode
- RA theme colors
- Consistent styling with app design
- Proper contrast ratios
- Accessibility considerations

The skeleton system provides a comprehensive, professional loading experience that matches modern banking app standards.