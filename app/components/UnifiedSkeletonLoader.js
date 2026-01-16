import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

/**
 * Unified Skeleton Loader Component - Bank-grade, government-ready
 * Matches the shape and layout of actual content
 * Based on approved design from locked pages
 */
export function UnifiedSkeletonLoader({
  type = 'card',
  count = 1,
  animated = true,
  style,
  testID,
}) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const shimmerColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border + '30', colors.background + '70'],
  });

  const styles = getStyles(colors);

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <View style={styles.cardSkeleton}>
            <View style={styles.cardHeader}>
              <Animated.View style={[styles.iconSkeleton, { backgroundColor: shimmerColor }]} />
              <View style={styles.cardHeaderText}>
                <Animated.View style={[styles.titleSkeleton, { backgroundColor: shimmerColor }]} />
                <Animated.View style={[styles.subtitleSkeleton, { backgroundColor: shimmerColor }]} />
              </View>
              <Animated.View style={[styles.chevronSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
            <Animated.View style={[styles.descriptionSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.descriptionSkeleton, styles.descriptionSkeletonShort, { backgroundColor: shimmerColor }]} />
            <View style={styles.cardFooter}>
              <Animated.View style={[styles.buttonSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
          </View>
        );

      case 'list-item':
        return (
          <View style={styles.listItemSkeleton}>
            <Animated.View style={[styles.iconSkeleton, { backgroundColor: shimmerColor }]} />
            <View style={styles.listItemContent}>
              <Animated.View style={[styles.titleSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.subtitleSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
            <Animated.View style={[styles.chevronSkeleton, { backgroundColor: shimmerColor }]} />
          </View>
        );

      case 'news-card':
        return (
          <View style={styles.newsCardSkeleton}>
            <Animated.View style={[styles.newsImageSkeleton, { backgroundColor: shimmerColor }]} />
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <Animated.View style={[styles.badgeSkeleton, { backgroundColor: shimmerColor }]} />
                <Animated.View style={[styles.dateSkeleton, { backgroundColor: shimmerColor }]} />
              </View>
              <Animated.View style={[styles.titleSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.titleSkeleton, styles.titleSkeletonShort, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.descriptionSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.descriptionSkeleton, styles.descriptionSkeletonShort, { backgroundColor: shimmerColor }]} />
            </View>
          </View>
        );

      case 'office-card':
        return (
          <View style={styles.officeCardSkeleton}>
            <View style={styles.officeHeader}>
              <Animated.View style={[styles.badgeSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.distanceSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
            <Animated.View style={[styles.titleSkeleton, { backgroundColor: shimmerColor }]} />
            <View style={styles.officeDetail}>
              <Animated.View style={[styles.iconSmallSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.addressSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
            <View style={styles.officeDetail}>
              <Animated.View style={[styles.iconSmallSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.contactSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
            <View style={styles.officeActions}>
              <Animated.View style={[styles.actionButtonSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.actionButtonSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
          </View>
        );

      case 'report-card':
        return (
          <View style={styles.reportCardSkeleton}>
            <View style={styles.reportHeader}>
              <Animated.View style={[styles.idSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.statusSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
            <Animated.View style={[styles.titleSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.descriptionSkeleton, { backgroundColor: shimmerColor }]} />
            <View style={styles.reportFooter}>
              <Animated.View style={[styles.dateSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.locationSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
          </View>
        );

      case 'form-field':
        return (
          <View style={styles.formFieldSkeleton}>
            <Animated.View style={[styles.labelSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.inputSkeleton, { backgroundColor: shimmerColor }]} />
          </View>
        );

      case 'button':
        return (
          <Animated.View style={[styles.buttonSkeleton, { backgroundColor: shimmerColor }]} />
        );

      case 'text-line':
        return (
          <Animated.View style={[styles.textLineSkeleton, { backgroundColor: shimmerColor }]} />
        );

      case 'header':
        return (
          <View style={styles.headerSkeleton}>
            <Animated.View style={[styles.titleSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.subtitleSkeleton, { backgroundColor: shimmerColor }]} />
          </View>
        );

      case 'search-bar':
        return (
          <View style={styles.searchBarSkeleton}>
            <Animated.View style={[styles.iconSmallSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.searchInputSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.iconSmallSkeleton, { backgroundColor: shimmerColor }]} />
          </View>
        );

      case 'filter-chips':
        return (
          <View style={styles.filterChipsSkeleton}>
            <Animated.View style={[styles.chipSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.chipSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.chipSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.chipSkeleton, { backgroundColor: shimmerColor }]} />
          </View>
        );

      case 'table-row':
        return (
          <View style={styles.tableRowSkeleton}>
            <Animated.View style={[styles.cellSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.cellSkeleton, { backgroundColor: shimmerColor }]} />
            <Animated.View style={[styles.cellSkeleton, { backgroundColor: shimmerColor }]} />
          </View>
        );

      case 'banner':
        return (
          <View style={styles.bannerSkeleton}>
            <Animated.View style={[styles.bannerImageSkeleton, { backgroundColor: shimmerColor }]} />
            <View style={styles.bannerOverlaySkeleton}>
              <Animated.View style={[styles.bannerTitleSkeleton, { backgroundColor: shimmerColor }]} />
              <Animated.View style={[styles.bannerSubtitleSkeleton, { backgroundColor: shimmerColor }]} />
            </View>
          </View>
        );

      default:
        return (
          <Animated.View style={[styles.defaultSkeleton, { backgroundColor: shimmerColor }]} />
        );
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.skeletonItem}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    skeletonItem: {
      marginBottom: spacing.md,
    },

    // Card Skeleton
    cardSkeleton: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    cardHeaderText: {
      flex: 1,
      marginLeft: spacing.md,
    },
    cardFooter: {
      marginTop: spacing.md,
    },

    // List Item Skeleton
    listItemSkeleton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    listItemContent: {
      flex: 1,
      marginLeft: spacing.md,
    },

    // News Card Skeleton
    newsCardSkeleton: {
      backgroundColor: colors.card,
      borderRadius: 15,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    newsImageSkeleton: {
      width: '100%',
      height: 200,
    },
    newsContent: {
      padding: spacing.xl,
    },
    newsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },

    // Office Card Skeleton
    officeCardSkeleton: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    officeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    officeDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    officeActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },

    // Report Card Skeleton
    reportCardSkeleton: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    reportFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
    },

    // Form Field Skeleton
    formFieldSkeleton: {
      marginBottom: spacing.lg,
    },

    // Header Skeleton
    headerSkeleton: {
      marginBottom: spacing.lg,
    },

    // Search Bar Skeleton
    searchBarSkeleton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 25,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInputSkeleton: {
      flex: 1,
      height: 20,
      borderRadius: 4,
      marginHorizontal: spacing.sm,
    },

    // Filter Chips Skeleton
    filterChipsSkeleton: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chipSkeleton: {
      width: 80,
      height: 32,
      borderRadius: 16,
    },

    // Table Row Skeleton
    tableRowSkeleton: {
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cellSkeleton: {
      flex: 1,
      height: 16,
      borderRadius: 4,
    },

    // Individual Elements
    iconSkeleton: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    iconSmallSkeleton: {
      width: 18,
      height: 18,
      borderRadius: 9,
      marginRight: spacing.sm,
    },
    titleSkeleton: {
      height: 20,
      borderRadius: 4,
      marginBottom: spacing.xs,
    },
    titleSkeletonShort: {
      width: '70%',
    },
    subtitleSkeleton: {
      height: 14,
      borderRadius: 4,
      width: '60%',
    },
    descriptionSkeleton: {
      height: 16,
      borderRadius: 4,
      marginBottom: spacing.xs,
    },
    descriptionSkeletonShort: {
      width: '80%',
    },
    buttonSkeleton: {
      height: 48,
      borderRadius: 8,
    },
    actionButtonSkeleton: {
      flex: 1,
      height: 40,
      borderRadius: 8,
    },
    chevronSkeleton: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    badgeSkeleton: {
      width: 60,
      height: 20,
      borderRadius: 10,
    },
    dateSkeleton: {
      width: 80,
      height: 14,
      borderRadius: 4,
    },
    addressSkeleton: {
      flex: 1,
      height: 16,
      borderRadius: 4,
    },
    contactSkeleton: {
      flex: 1,
      height: 16,
      borderRadius: 4,
    },
    distanceSkeleton: {
      width: 50,
      height: 16,
      borderRadius: 8,
    },
    idSkeleton: {
      width: 60,
      height: 16,
      borderRadius: 4,
    },
    statusSkeleton: {
      width: 80,
      height: 20,
      borderRadius: 10,
    },
    locationSkeleton: {
      width: 100,
      height: 14,
      borderRadius: 4,
    },
    labelSkeleton: {
      width: 100,
      height: 14,
      borderRadius: 4,
      marginBottom: spacing.sm,
    },
    inputSkeleton: {
      height: 52,
      borderRadius: 12,
    },
    textLineSkeleton: {
      height: 16,
      borderRadius: 4,
    },
    defaultSkeleton: {
      height: 100,
      borderRadius: 8,
    },

    // Banner Skeleton
    bannerSkeleton: {
      width: '100%',
      height: 180,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: colors.card,
    },
    bannerImageSkeleton: {
      width: '100%',
      height: '100%',
    },
    bannerOverlaySkeleton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.xl,
    },
    bannerTitleSkeleton: {
      height: 24,
      borderRadius: 4,
      width: '70%',
      marginBottom: spacing.sm,
    },
    bannerSubtitleSkeleton: {
      height: 16,
      borderRadius: 4,
      width: '50%',
    },
  });