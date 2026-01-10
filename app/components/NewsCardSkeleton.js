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

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const shimmerTranslate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const SkeletonBox = ({ style: boxStyle, children }) => (
    <View style={[boxStyle, styles.skeletonBase]}>
      <Animated.View 
        style={[
          StyleSheet.absoluteFillObject,
          styles.shimmer,
          {
            opacity,
            transform: [{ translateX: shimmerTranslate }],
          },
        ]} 
      />
      {children}
    </View>
  );

  return (
    <View style={[styles.card, style]} testID={testID}>
      {/* Image Skeleton */}
      {showImage && (
        <SkeletonBox style={styles.image} />
      )}
      
      {/* Content */}
      <View style={styles.content}>
        {/* Header with badge and date */}
        <View style={styles.header}>
          <SkeletonBox style={styles.categoryBadge} />
          <SkeletonBox style={styles.date} />
        </View>

        {/* Title - 2 lines */}
        <SkeletonBox style={styles.titleLine1} />
        <SkeletonBox style={styles.titleLine2} />

        {/* Excerpt - 2 lines */}
        <SkeletonBox style={styles.excerptLine1} />
        <SkeletonBox style={styles.excerptLine2} />

        {/* Read More */}
        <SkeletonBox style={styles.readMore} />
      </View>
    </View>
  );
}

// Multiple skeleton cards for loading state
export function NewsCardSkeletonList({ count = 3, showImage = true }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <NewsCardSkeleton 
          key={`skeleton-${index}`} 
          showImage={showImage}
          testID={`news-card-skeleton-${index}`}
        />
      ))}
    </>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 15,
      overflow: 'hidden',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: 200,
      backgroundColor: colors.surface,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryBadge: {
      width: 80,
      height: 24,
      borderRadius: 12,
    },
    date: {
      width: 70,
      height: 12,
      borderRadius: 6,
    },
    titleLine1: {
      width: '100%',
      height: 18,
      borderRadius: 4,
      marginBottom: 6,
    },
    titleLine2: {
      width: '75%',
      height: 18,
      borderRadius: 4,
      marginBottom: 12,
    },
    excerptLine1: {
      width: '100%',
      height: 14,
      borderRadius: 4,
      marginBottom: 6,
    },
    excerptLine2: {
      width: '85%',
      height: 14,
      borderRadius: 4,
      marginBottom: 12,
    },
    readMore: {
      width: 90,
      height: 16,
      borderRadius: 4,
    },
    skeletonBase: {
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    shimmer: {
      backgroundColor: colors.background,
      opacity: 0.5,
      width: '30%',
    },
  });
