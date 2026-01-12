import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

/**
 * News Screen Loading Skeleton
 * Matches the exact layout of NewsScreen with search, filters, and news cards
 */
export function NewsScreenSkeleton({ 
  animated = true,
  showSearch = true,
  showFilters = true,
  cardCount = 5,
  testID = 'news-screen-skeleton'
}) {
  const { colors } = useTheme();
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

  return (
    <View style={styles.container} testID={testID}>
      {/* Search Input Skeleton */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <SkeletonBox style={styles.searchInput} />
        </View>
      )}

      {/* Category Filter Chips Skeleton */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <SkeletonBox style={styles.filterChip} />
          <SkeletonBox style={[styles.filterChip, { width: 85 }]} />
          <SkeletonBox style={[styles.filterChip, { width: 95 }]} />
          <SkeletonBox style={[styles.filterChip, { width: 75 }]} />
          <SkeletonBox style={[styles.filterChip, { width: 110 }]} />
        </View>
      )}

      {/* Results Count Skeleton */}
      {showFilters && (
        <View style={styles.resultsCountContainer}>
          <SkeletonBox style={styles.resultsCount} />
        </View>
      )}

      {/* News Cards Skeleton */}
      <View style={styles.content}>
        {Array.from({ length: cardCount }, (_, index) => (
          <NewsCardSkeleton 
            key={`news-card-${index}`} 
            SkeletonBox={SkeletonBox} 
            styles={styles}
            hasImage={index % 3 !== 2} // More realistic image distribution
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Individual News Card Skeleton
 */
const NewsCardSkeleton = ({ SkeletonBox, styles, hasImage = true }) => (
  <View style={styles.newsCard}>
    {/* News Image Skeleton */}
    {hasImage && (
      <SkeletonBox style={styles.newsImage} />
    )}
    
    {/* News Content */}
    <View style={styles.newsContent}>
      {/* News Header (Badge + Date) */}
      <View style={styles.newsHeader}>
        <SkeletonBox style={styles.newsBadge} />
        <SkeletonBox style={styles.newsDate} />
      </View>

      {/* News Title - More realistic multi-line title */}
      <SkeletonBox style={styles.newsTitle1} />
      <SkeletonBox style={styles.newsTitle2} />

      {/* News Excerpt - Exactly 2 lines to match numberOfLines={2} */}
      <SkeletonBox style={styles.newsExcerpt1} />
      <SkeletonBox style={styles.newsExcerpt2} />

      {/* Read More Section */}
      <View style={styles.readMoreContainer}>
        <SkeletonBox style={styles.readMoreText} />
        <SkeletonBox style={styles.readMoreIcon} />
      </View>
    </View>
  </View>
);

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    skeletonBase: {
      backgroundColor: colors.border,
      overflow: 'hidden',
      borderRadius: 8,
    },
    shimmer: {
      backgroundColor: colors.background,
      opacity: 0.6,
      width: '40%',
    },

    // Search Input Skeleton
    searchContainer: {
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    searchInput: {
      width: '100%',
      height: 48,
      borderRadius: 8,
    },

    // Filter Chips Skeleton
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      marginBottom: spacing.sm,
      flexWrap: 'nowrap',
    },
    filterChip: {
      width: 70,
      height: 36,
      borderRadius: 8,
      minWidth: 60,
      maxWidth: 120,
    },

    // Results Count Skeleton
    resultsCountContainer: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      marginBottom: spacing.sm,
    },
    resultsCount: {
      width: 150,
      height: 14,
    },

    // Content Container
    content: {
      gap: spacing.md,
    },

    // News Card Skeleton
    newsCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },

    // News Image
    newsImage: {
      width: '100%',
      height: 200,
    },

    // News Content
    newsContent: {
      padding: spacing.xl,
    },

    // News Header (Badge + Date)
    newsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    newsBadge: {
      width: 90,
      height: 24,
      borderRadius: 12,
    },
    newsDate: {
      width: 70,
      height: 14,
    },

    // News Title - Better spacing and sizing
    newsTitle1: {
      width: '100%',
      height: 20,
      marginBottom: 4,
    },
    newsTitle2: {
      width: '70%',
      height: 20,
      marginBottom: spacing.sm,
    },

    // News Excerpt - Match the 2-line excerpt exactly
    newsExcerpt1: {
      width: '100%',
      height: 16,
      marginBottom: 4,
    },
    newsExcerpt2: {
      width: '80%',
      height: 16,
      marginBottom: spacing.md,
    },

    // Read More Section
    readMoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    readMoreText: {
      width: 80,
      height: 14,
    },
    readMoreIcon: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
  });

export default NewsScreenSkeleton;