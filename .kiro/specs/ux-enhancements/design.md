# Design Document

## Overview

This design document outlines the technical approach for implementing skeleton loaders, pull-to-refresh functionality, infinite scroll, and enhanced visual feedback (haptics and animations) in the Roads Authority Namibia mobile application. The implementation will leverage React Native's built-in components, Expo's haptics API, and the Animated API to create a smooth, responsive user experience.

## Architecture

### Component Architecture

```
components/
├── SkeletonLoader.js          # Base skeleton component with shimmer animation
├── SkeletonCard.js            # Skeleton for card layouts (news, vacancies, tenders)
├── SkeletonDetail.js          # Skeleton for detail views
├── SkeletonList.js            # Skeleton wrapper for list views
├── AnimatedPressable.js       # Pressable with scale animation
├── AnimatedView.js            # View with fade/slide animations
└── index.js                   # Export all components

hooks/
├── useHaptics.js              # Haptic feedback utilities
├── useAnimation.js            # Animation utilities and presets
├── useInfiniteScroll.js       # Infinite scroll logic
└── index.js                   # Export all hooks

utils/
├── animations.js              # Animation constants and helpers
└── haptics.js                 # Haptic feedback patterns
```

### Dependencies

**New Dependencies Required:**
- `expo-haptics` - Already installed for haptic feedback
- `react-native-linear-gradient` - For shimmer effect (via expo-linear-gradient - already installed)

**Existing Dependencies:**
- `react-native` Animated API - For animations
- `@react-navigation` - For screen transitions

## Components and Interfaces

### 1. Skeleton Loader Components

#### SkeletonLoader (Base Component)

**Purpose:** Reusable skeleton element with shimmer animation

**Props:**
```javascript
{
  width: number | string,        // Width of skeleton (default: '100%')
  height: number,                // Height of skeleton (required)
  borderRadius: number,          // Border radius (default: 4)
  style: ViewStyle,              // Additional styles
  shimmerColors: string[],       // Custom shimmer colors (optional)
}
```

**Features:**
- Animated shimmer effect using LinearGradient
- Configurable dimensions and styling
- Respects theme colors (light/dark mode)
- 1.5s animation loop

#### SkeletonCard

**Purpose:** Skeleton placeholder for card-based content (news, vacancies, tenders)

**Props:**
```javascript
{
  variant: 'news' | 'vacancy' | 'tender',  // Card type
  count: number,                            // Number of skeletons (default: 3)
  style: ViewStyle,                         // Container style
}
```

**Layout:**
- News: Image placeholder + title lines + metadata
- Vacancy: Badge + title + details + date
- Tender: Status badge + title + reference + details

#### SkeletonDetail

**Purpose:** Skeleton for detail/article views

**Props:**
```javascript
{
  variant: 'article' | 'vacancy' | 'tender',
  style: ViewStyle,
}
```

**Layout:**
- Header image placeholder
- Title lines
- Content paragraph placeholders
- Metadata sections

#### SkeletonList

**Purpose:** Wrapper component that displays skeleton loaders while data loads

**Props:**
```javascript
{
  loading: boolean,              // Show skeleton when true
  children: ReactNode,           // Actual content
  skeletonComponent: ReactNode,  // Custom skeleton component
  count: number,                 // Number of skeleton items (default: 5)
}
```

### 2. Animation Components

#### AnimatedPressable

**Purpose:** Touchable component with scale-down press animation

**Props:**
```javascript
{
  onPress: () => void,
  children: ReactNode,
  scaleValue: number,            // Scale factor (default: 0.98)
  hapticFeedback: boolean,       // Enable haptics (default: true)
  hapticType: 'light' | 'medium' | 'heavy',
  style: ViewStyle,
  ...TouchableOpacityProps
}
```

**Behavior:**
- Scale down on press (98% by default)
- Optional haptic feedback
- Smooth spring animation
- Accessible

#### AnimatedView

**Purpose:** View with entrance/exit animations

**Props:**
```javascript
{
  children: ReactNode,
  animation: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight',
  duration: number,              // Animation duration (default: 300ms)
  delay: number,                 // Delay before animation (default: 0)
  style: ViewStyle,
}
```

**Animations:**
- fadeIn: Opacity 0 → 1
- slideUp: TranslateY 50 → 0
- slideDown: TranslateY -50 → 0
- slideLeft: TranslateX 50 → 0
- slideRight: TranslateX -50 → 0

### 3. Pull-to-Refresh Integration

**Implementation:** Use React Native's built-in `RefreshControl` component

**Integration Points:**
- NewsScreen
- VacanciesScreen
- TendersScreen
- FAQsScreen

**Features:**
- Custom tint color matching theme
- Haptic feedback on refresh trigger
- Clear cache on refresh
- Error handling with retry

**Usage Pattern:**
```javascript
<FlatList
  data={data}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  }
/>
```

### 4. Infinite Scroll Implementation

**Strategy:** Use FlatList's `onEndReached` prop

**Hook: useInfiniteScroll**

**Interface:**
```javascript
{
  data: Array,                   // Current data array
  loading: boolean,              // Initial loading state
  loadingMore: boolean,          // Loading more items
  hasMore: boolean,              // More items available
  error: Error | null,           // Error state
  loadMore: () => Promise<void>, // Load next page function
  refresh: () => Promise<void>,  // Refresh from start
}
```

**Features:**
- Automatic pagination
- Prevents duplicate requests
- Configurable threshold (default: 0.5 = 50% from bottom)
- Loading indicator at list footer
- End-of-list message
- Error handling

**Usage:**
```javascript
const {
  data,
  loading,
  loadingMore,
  hasMore,
  loadMore,
  refresh
} = useInfiniteScroll({
  fetchFunction: (page) => newsService.getNews({ page }),
  pageSize: 10,
});
```

## Data Models

### Animation Configuration

```javascript
const AnimationConfig = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: Easing.bezier(0.25, 0.1, 0.25, 1),
    spring: Easing.elastic(1),
    bounce: Easing.bounce,
  },
  scale: {
    press: 0.98,
    active: 0.95,
  },
  stagger: {
    listItem: 50,  // ms delay between items
  },
};
```

### Haptic Patterns

```javascript
const HapticPatterns = {
  light: 'light',           // Button taps, selections
  medium: 'medium',         // Important actions
  heavy: 'heavy',           // Errors, warnings
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  selection: 'selectionClick',
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',
};
```

### Pagination State

```javascript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

## Error Handling

### Skeleton Loader Errors
- Fallback to simple loading spinner if shimmer fails
- Graceful degradation on older devices

### Infinite Scroll Errors
- Display error message at list footer
- Provide retry button
- Don't block existing content
- Log errors for debugging

### Haptic Errors
- Silent failure (device may not support haptics)
- Check availability before triggering
- No user-facing errors

### Animation Errors
- Fallback to instant transitions
- Reduce motion for accessibility
- Performance monitoring

## Testing Strategy

### Unit Tests
- Skeleton component rendering
- Animation timing calculations
- Haptic feedback triggers
- Infinite scroll pagination logic

### Integration Tests
- Pull-to-refresh data updates
- Infinite scroll loading more items
- Skeleton → content transitions
- Animation sequences

### Manual Testing
- Test on iOS and Android
- Verify haptics on physical devices
- Check performance with large lists
- Test with slow network conditions
- Verify accessibility with screen readers
- Test dark mode compatibility

### Performance Testing
- FlatList performance with 1000+ items
- Animation frame rates (target: 60fps)
- Memory usage during infinite scroll
- Skeleton rendering performance

## Implementation Details

### Shimmer Animation Implementation

```javascript
// Animated shimmer using LinearGradient
const shimmerAnimation = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.timing(shimmerAnimation, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
}, []);

const translateX = shimmerAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [-width, width],
});
```

### Scale Animation Implementation

```javascript
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.98,
    useNativeDriver: true,
    tension: 300,
    friction: 10,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
    tension: 300,
    friction: 10,
  }).start();
};
```

### Infinite Scroll Implementation

```javascript
const handleEndReached = () => {
  if (!loadingMore && hasMore && !error) {
    loadMore();
  }
};

<FlatList
  data={data}
  onEndReached={handleEndReached}
  onEndReachedThreshold={0.5}
  ListFooterComponent={() => {
    if (loadingMore) return <LoadingSpinner />;
    if (!hasMore) return <Text>No more items</Text>;
    return null;
  }}
/>
```

### Haptic Integration

```javascript
import * as Haptics from 'expo-haptics';

const triggerHaptic = (type = 'light') => {
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Silent fail - device may not support haptics
  }
};
```

## Screen Integration Plan

### NewsScreen
- Replace LoadingSpinner with SkeletonCard (variant: 'news')
- Add RefreshControl with haptic feedback
- Implement infinite scroll with useInfiniteScroll hook
- Wrap news cards in AnimatedView with fadeIn
- Use AnimatedPressable for card taps

### VacanciesScreen
- Add SkeletonCard (variant: 'vacancy')
- Implement pull-to-refresh
- Add infinite scroll
- Animate vacancy card expansion/collapse
- Haptic feedback on filter selection

### TendersScreen
- Add SkeletonCard (variant: 'tender')
- Implement pull-to-refresh
- Add infinite scroll
- Haptic feedback on download button

### NewsDetailScreen
- Add SkeletonDetail (variant: 'article')
- Animate content entrance
- Haptic feedback on share/bookmark actions

## Accessibility Considerations

- Respect `prefers-reduced-motion` system setting
- Provide alternative loading indicators for screen readers
- Ensure haptics don't interfere with VoiceOver/TalkBack
- Maintain touch target sizes (minimum 44x44)
- Provide loading announcements for screen readers
- Test with accessibility tools

## Performance Optimizations

- Use `useNativeDriver: true` for all animations
- Implement `getItemLayout` for FlatList when possible
- Memoize skeleton components with React.memo
- Debounce infinite scroll triggers
- Use `removeClippedSubviews` for long lists
- Optimize shimmer animation with transform only
- Lazy load images in list items

## Theme Integration

All components will respect the existing theme system:
- Use `useTheme` hook for colors
- Support light/dark mode
- Use theme spacing constants
- Apply theme border radius
- Use theme shadows

## Migration Strategy

1. Create all new components and hooks
2. Update one screen at a time (start with NewsScreen)
3. Test thoroughly before moving to next screen
4. Maintain backward compatibility
5. Document usage patterns
6. Update existing components to use new animation utilities

## Future Enhancements

- Skeleton customization per screen
- Advanced animation presets (bounce, elastic)
- Gesture-based interactions (swipe actions)
- Parallax effects on scroll
- Custom pull-to-refresh indicators
- Animated transitions between screens
- Lottie animations for complex loaders
