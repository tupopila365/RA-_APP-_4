import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme, Dimensions, Platform } from 'react-native';
import { RATheme } from '../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Road Status Screen Loading Skeleton
 * Matches the exact layout of RoadStatusScreen with view toggles, filters, and roadwork cards
 */
export function RoadStatusSkeleton({ 
  animated = true,
  showFilters = true,
  showViewToggle = true,
  cardCount = 4,
  testID = 'road-status-skeleton'
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

  return (
    <View style={styles.container} testID={testID}>
      {/* View Mode Toggle Skeleton */}
      {showViewToggle && (
        <View style={styles.viewToggleContainer}>
          <View style={styles.viewToggleButton}>
            <SkeletonBox style={styles.viewToggleIcon} />
            <SkeletonBox style={styles.viewToggleText} />
          </View>
          <View style={styles.viewToggleButton}>
            <SkeletonBox style={styles.viewToggleIcon} />
            <SkeletonBox style={styles.viewToggleText} />
          </View>
        </View>
      )}

      {/* Status Legend Skeleton */}
      {showFilters && (
        <View style={styles.legendContainer}>
          <SkeletonBox style={styles.legendTitle} />
          <View style={styles.legendItems}>
            <SkeletonBox style={styles.legendItem} />
            <SkeletonBox style={styles.legendItem} />
            <SkeletonBox style={styles.legendItem} />
            <SkeletonBox style={styles.legendItem} />
          </View>
        </View>
      )}

      {/* Search Input Skeleton */}
      {showFilters && (
        <View style={styles.searchContainer}>
          <SkeletonBox style={styles.searchInput} />
        </View>
      )}

      {/* Status Filter Chips Skeleton */}
      {showFilters && (
        <View style={styles.filterChipsContainer}>
          <SkeletonBox style={styles.filterChip} />
          <SkeletonBox style={styles.filterChip} />
          <SkeletonBox style={styles.filterChip} />
          <SkeletonBox style={styles.filterChip} />
          <SkeletonBox style={styles.filterChip} />
        </View>
      )}

      {/* Region Filter Skeleton */}
      {showFilters && (
        <View style={styles.regionFilterContainer}>
          <View style={styles.regionFilterHeader}>
            <SkeletonBox style={styles.regionFilterTitle} />
            <SkeletonBox style={styles.locationButton} />
          </View>
          <View style={styles.regionChipsContainer}>
            <SkeletonBox style={styles.regionChip} />
            <SkeletonBox style={styles.regionChip} />
            <SkeletonBox style={styles.regionChip} />
          </View>
        </View>
      )}

      {/* Roadwork Cards Skeleton */}
      <View style={styles.cardsContainer}>
        {Array.from({ length: cardCount }, (_, index) => (
          <RoadworkCardSkeleton 
            key={`roadwork-card-${index}`} 
            SkeletonBox={SkeletonBox} 
            styles={styles}
            isCritical={index === 0} // First card as critical example
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Individual Roadwork Card Skeleton
 */
const RoadworkCardSkeleton = ({ SkeletonBox, styles, isCritical = false }) => (
  <View style={[styles.card, isCritical && styles.criticalCard]}>
    {/* Status Badge */}
    <View style={styles.statusBadgeContainer}>
      <SkeletonBox style={styles.statusIcon} />
      <SkeletonBox style={styles.statusText} />
    </View>

    {/* Card Header */}
    <View style={styles.cardHeader}>
      <SkeletonBox style={styles.cardTitle} />
      <SkeletonBox style={styles.cardRoad} />
    </View>

    {/* Card Body - Info Rows */}
    <View style={styles.cardBody}>
      <View style={styles.cardRow}>
        <SkeletonBox style={styles.cardIcon} />
        <SkeletonBox style={styles.cardRowText} />
      </View>
      <View style={styles.cardRow}>
        <SkeletonBox style={styles.cardIcon} />
        <SkeletonBox style={styles.cardRowTextShort} />
      </View>
      <View style={styles.cardRow}>
        <SkeletonBox style={styles.cardIcon} />
        <SkeletonBox style={styles.cardRowText} />
      </View>
      {isCritical && (
        <View style={styles.cardRow}>
          <SkeletonBox style={styles.cardIcon} />
          <SkeletonBox style={styles.cardRowTextLong} />
        </View>
      )}
    </View>

    {/* Action Buttons */}
    <View style={styles.actionButtons}>
      <SkeletonBox style={styles.actionButton} />
      <SkeletonBox style={styles.actionButton} />
    </View>

    {/* Critical Alternative Route (for critical cards) */}
    {isCritical && (
      <View style={styles.alternativeRouteContainer}>
        <View style={styles.alternativeRouteHeader}>
          <SkeletonBox style={styles.alternativeRouteIcon} />
          <SkeletonBox style={styles.alternativeRouteTitle} />
        </View>
        <SkeletonBox style={styles.alternativeRouteDescription} />
        <SkeletonBox style={styles.alternativeRouteButton} />
      </View>
    )}

    {/* Last Updated */}
    <View style={styles.cardFooter}>
      <SkeletonBox style={styles.lastUpdated} />
    </View>
  </View>
);

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
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

    // View Toggle Skeleton
    viewToggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 4,
      marginBottom: 16,
      gap: 4,
    },
    viewToggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      gap: 8,
    },
    viewToggleIcon: {
      width: 20,
      height: 20,
      borderRadius: 4,
    },
    viewToggleText: {
      width: 60,
      height: 14,
    },

    // Status Legend Skeleton
    legendContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    legendTitle: {
      width: 120,
      height: 16,
      marginBottom: 12,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    legendItem: {
      width: 70,
      height: 24,
      borderRadius: 12,
    },

    // Search Input Skeleton
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      width: '100%',
      height: 48,
      borderRadius: 8,
    },

    // Filter Chips Skeleton
    filterChipsContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
    },
    filterChip: {
      width: 60,
      height: 32,
      borderRadius: 8,
    },

    // Region Filter Skeleton
    regionFilterContainer: {
      marginBottom: 20,
    },
    regionFilterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    regionFilterTitle: {
      width: 120,
      height: 16,
    },
    locationButton: {
      width: 80,
      height: 24,
      borderRadius: 12,
    },
    regionChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    regionChip: {
      width: 80,
      height: 32,
      borderRadius: 8,
    },

    // Cards Container
    cardsContainer: {
      gap: 16,
    },

    // Card Skeleton
    card: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    criticalCard: {
      borderLeftWidth: 4,
      borderLeftColor: '#DC2626',
    },

    // Status Badge
    statusBadgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    statusIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    statusText: {
      width: 80,
      height: 16,
    },

    // Card Header
    cardHeader: {
      marginBottom: 12,
    },
    cardTitle: {
      width: '85%',
      height: 18,
      marginBottom: 6,
    },
    cardRoad: {
      width: '65%',
      height: 14,
    },

    // Card Body
    cardBody: {
      marginBottom: 16,
      gap: 10,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    cardRowText: {
      width: '70%',
      height: 14,
    },
    cardRowTextShort: {
      width: '50%',
      height: 14,
    },
    cardRowTextLong: {
      width: '85%',
      height: 14,
    },

    // Action Buttons
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    actionButton: {
      flex: 1,
      height: 40,
      borderRadius: 8,
    },

    // Alternative Route (Critical Cards)
    alternativeRouteContainer: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    alternativeRouteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    alternativeRouteIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    alternativeRouteTitle: {
      width: 140,
      height: 16,
    },
    alternativeRouteDescription: {
      width: '90%',
      height: 14,
      marginBottom: 12,
    },
    alternativeRouteButton: {
      width: '100%',
      height: 44,
      borderRadius: 8,
    },

    // Card Footer
    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    lastUpdated: {
      width: 140,
      height: 12,
    },
  });

export default RoadStatusSkeleton;