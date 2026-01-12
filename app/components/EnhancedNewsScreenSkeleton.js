import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Enhanced News Screen Loading Skeleton
 * A more advanced skeleton loader that perfectly matches the NewsScreen layout
 * with improved animations and realistic content distribution
 */
export function EnhancedNewsScreenSkeleton({ 
  animated = true,
  showSearch = true,
  showFilters = true,
  showResultsCount = true,
  cardCount = 5,
  filterCount = 5,
  testID = 'enhanced-news-screen-skeleton'
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    // Shimmer effect
    const shimmerLoop = Animated.loop(
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

    // Subtle pulse effect
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 0.95,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    shimmerLoop.start();
    pulseLoop.start();
    
    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [shimmerAnimation, pulseAnimation, animated]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  const SkeletonBox = ({ style: boxStyle, children, noPulse = false }) => (
    <Animated.View 
      style={[
        styles.skeletonBase, 
        boxStyle,
        !noPulse && { transform: [{ scale: pulseAnimation }] }
      ]}
    >
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
    </Animated.View>
  );

  // Generate realistic filter widths
  const filterWidths = [50, 85, 95, 75, 110, 65, 90];

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
          {Array.from({ length: filterCount }, (_, index) => (
            <SkeletonBox 
              key={`filter-${index}`}
              style={[
                styles.filterChip, 
                { width: filterWidths[index % filterWidths.length] }
              ]} 
            />
          ))}
        </View>
      )}

      {/* Results Count Skeleton */}
      {showResultsCount && showFilters && (
        <View style={styles.resultsCountContainer}>
          <SkeletonBox style={styles.resultsCount} />
        </View>
      )}

      {/* News Cards Skeleton */}
      <View style={styles.content}>
        {Array.from({ length: cardCount }, (_, index) => (
          <EnhancedNewsCardSkeleton 
            key={`news-card-${index}`} 
            SkeletonBox={SkeletonBox} 
            styles={styles}
            hasImage={index % 3 !== 2} // Realistic image distribution
            index={index}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Enhanced Individual News Card Skeleton
 */
const EnhancedNewsCardSkeleton = ({ SkeletonBox, styles, hasImage = true, index = 0 }) => {
  // Vary title and excerpt lengths for more realistic appearance
  const titleWidths = ['100%', '85%', '95%', '75%', '90%'];
  const excerptWidths = ['100%', '90%', '95%', '80%', '85%'];
  const badgeWidths = [80, 95, 70, 105, 85];
  
  const titleWidth1 = titleWidths[index % titleWidths.length];
  const titleWidth2 = titleWidths[(index + 1) % titleWidths.length];
  const excerptWidth1 = excerptWidths[index % excerptWidths.length];
  const excerptWidth2 = excerptWidths[(index + 2) % excerptWidths.length];
  const badgeWidth = badgeWidths[index % badgeWidths.length];

  return (
    <View style={styles.newsCard}>
      {/* News Image Skeleton */}
      {hasImage && (
        <SkeletonBox style={styles.newsImage} noPulse />
      )}
      
      {/* News Content */}
      <View style={styles.newsContent}>
        {/* News Header (Badge + Date) */}
        <View style={styles.newsHeader}>
          <SkeletonBox style={[styles.newsBadge, { width: badgeWidth }]} />
          <SkeletonBox style={styles.newsDate} />
        </View>

        {/* News Title - Varied lengths for realism */}
        <SkeletonBox style={[styles.newsTitle1, { width: titleWidth1 }]} />
        <SkeletonBox style={[styles.newsTitle2, { width: titleWidth2 }]} />

        {/* News Excerpt - Varied lengths for realism */}
        <SkeletonBox style={[styles.newsExcerpt1, { width: excerptWidth1 }]} />
        <SkeletonBox style={[styles.newsExcerpt2, { width: excerptWidth2 }]} />

        {/* Read More Section */}
        <View style={styles.readMoreContainer}>
          <SkeletonBox style={styles.readMoreText} />
          <SkeletonBox style={styles.readMoreIcon} />
        </View>
      </View>
    </View>
  );
};

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
      opacity: 0.5,
      width: '30%',
      borderRadius: 8,
    },

    // Search Input Skeleton
    searchContainer: {
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    searchInput: {
      width: '100%',
      height: 48,
      borderRadius: 12,
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
      width: 160,
      height: 16,
      borderRadius: 4,
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
      borderWidth: 1,
      borderColor: colors.border,
    },

    // News Image
    newsImage: {
      width: '100%',
      height: 200,
      borderRadius: 0,
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
      borderRadius: 4,
    },

    // News Title - Better spacing and sizing
    newsTitle1: {
      width: '100%',
      height: 20,
      marginBottom: 4,
      borderRadius: 4,
    },
    newsTitle2: {
      width: '70%',
      height: 20,
      marginBottom: spacing.sm,
      borderRadius: 4,
    },

    // News Excerpt - Match the 2-line excerpt exactly
    newsExcerpt1: {
      width: '100%',
      height: 16,
      marginBottom: 4,
      borderRadius: 4,
    },
    newsExcerpt2: {
      width: '80%',
      height: 16,
      marginBottom: spacing.md,
      borderRadius: 4,
    },

    // Read More Section
    readMoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    readMoreText: {
      width: 80,
      height: 16,
      borderRadius: 4,
    },
    readMoreIcon: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
  });

export default EnhancedNewsScreenSkeleton;