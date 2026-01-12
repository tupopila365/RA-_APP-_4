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

// Card Skeleton - Banking app style card loading
const CardSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <SkeletonBox style={styles.avatar} />
      <View style={styles.cardHeaderText}>
        <SkeletonBox style={styles.titleLine} />
        <SkeletonBox style={styles.subtitleLine} />
      </View>
      <SkeletonBox style={styles.iconPlaceholder} />
    </View>
    <SkeletonBox style={styles.contentLine1} />
    <SkeletonBox style={styles.contentLine2} />
    <SkeletonBox style={styles.contentLine3} />
    <View style={styles.cardFooter}>
      <SkeletonBox style={styles.footerButton} />
      <SkeletonBox style={styles.footerInfo} />
    </View>
  </View>
);

// List Item Skeleton - Clean list item loading
const ListItemSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.listItem}>
    <SkeletonBox style={styles.listIcon} />
    <View style={styles.listContent}>
      <SkeletonBox style={styles.listTitle} />
      <SkeletonBox style={styles.listSubtitle} />
    </View>
    <SkeletonBox style={styles.listAction} />
  </View>
);

// News Skeleton - News article loading
const NewsSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.newsCard}>
    <SkeletonBox style={styles.newsImage} />
    <View style={styles.newsContent}>
      <View style={styles.newsHeader}>
        <SkeletonBox style={styles.newsBadge} />
        <SkeletonBox style={styles.newsDate} />
      </View>
      <SkeletonBox style={styles.newsTitle1} />
      <SkeletonBox style={styles.newsTitle2} />
      <SkeletonBox style={styles.newsExcerpt1} />
      <SkeletonBox style={styles.newsExcerpt2} />
    </View>
  </View>
);

// Profile Skeleton - User profile loading
const ProfileSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.profile}>
    <SkeletonBox style={styles.profileAvatar} />
    <SkeletonBox style={styles.profileName} />
    <SkeletonBox style={styles.profileEmail} />
    <View style={styles.profileStats}>
      <SkeletonBox style={styles.statItem} />
      <SkeletonBox style={styles.statItem} />
      <SkeletonBox style={styles.statItem} />
    </View>
  </View>
);

// Table Row Skeleton - Data table loading
const TableRowSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.tableRow}>
    <SkeletonBox style={styles.tableCell1} />
    <SkeletonBox style={styles.tableCell2} />
    <SkeletonBox style={styles.tableCell3} />
    <SkeletonBox style={styles.tableCell4} />
  </View>
);

// Button Skeleton - Button loading
const ButtonSkeleton = ({ SkeletonBox, styles, width, height }) => (
  <SkeletonBox style={[
    styles.button, 
    width && { width },
    height && { height }
  ]} />
);

// Text Skeleton - Text line loading
const TextSkeleton = ({ SkeletonBox, styles, width, height }) => (
  <SkeletonBox style={[
    styles.textLine, 
    width && { width },
    height && { height }
  ]} />
);

// Circle Skeleton - Circular loading (avatars, icons)
const CircleSkeleton = ({ SkeletonBox, styles, size }) => (
  <SkeletonBox style={[
    styles.circle, 
    { width: size, height: size, borderRadius: size / 2 }
  ]} />
);

// Form Skeleton - Form field loading
const FormSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.form}>
    <SkeletonBox style={styles.formLabel} />
    <SkeletonBox style={styles.formInput} />
    <SkeletonBox style={styles.formLabel} />
    <SkeletonBox style={styles.formInput} />
    <SkeletonBox style={styles.formButton} />
  </View>
);

// Dashboard Skeleton - Dashboard widget loading
const DashboardSkeleton = ({ SkeletonBox, styles }) => (
  <View style={styles.dashboard}>
    <View style={styles.dashboardHeader}>
      <SkeletonBox style={styles.dashboardTitle} />
      <SkeletonBox style={styles.dashboardAction} />
    </View>
    <View style={styles.dashboardGrid}>
      <SkeletonBox style={styles.dashboardCard} />
      <SkeletonBox style={styles.dashboardCard} />
      <SkeletonBox style={styles.dashboardCard} />
      <SkeletonBox style={styles.dashboardCard} />
    </View>
  </View>
);

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    skeletonItem: {
      marginBottom: 12,
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
    
    // Card Skeleton Styles
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    cardHeaderText: {
      flex: 1,
    },
    titleLine: {
      width: '70%',
      height: 16,
      marginBottom: 6,
    },
    subtitleLine: {
      width: '50%',
      height: 12,
    },
    iconPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 4,
    },
    contentLine1: {
      width: '100%',
      height: 14,
      marginBottom: 8,
    },
    contentLine2: {
      width: '85%',
      height: 14,
      marginBottom: 8,
    },
    contentLine3: {
      width: '60%',
      height: 14,
      marginBottom: 16,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerButton: {
      width: 80,
      height: 32,
      borderRadius: 16,
    },
    footerInfo: {
      width: 60,
      height: 12,
    },
    
    // List Item Skeleton Styles
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    listIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
    },
    listContent: {
      flex: 1,
    },
    listTitle: {
      width: '80%',
      height: 16,
      marginBottom: 6,
    },
    listSubtitle: {
      width: '60%',
      height: 12,
    },
    listAction: {
      width: 24,
      height: 24,
      borderRadius: 4,
    },
    
    // News Skeleton Styles
    newsCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    newsImage: {
      width: '100%',
      height: 180,
    },
    newsContent: {
      padding: 16,
    },
    newsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    newsBadge: {
      width: 70,
      height: 20,
      borderRadius: 10,
    },
    newsDate: {
      width: 60,
      height: 12,
    },
    newsTitle1: {
      width: '100%',
      height: 18,
      marginBottom: 6,
    },
    newsTitle2: {
      width: '75%',
      height: 18,
      marginBottom: 12,
    },
    newsExcerpt1: {
      width: '100%',
      height: 14,
      marginBottom: 6,
    },
    newsExcerpt2: {
      width: '85%',
      height: 14,
    },
    
    // Profile Skeleton Styles
    profile: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    profileAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 16,
    },
    profileName: {
      width: 120,
      height: 20,
      marginBottom: 8,
    },
    profileEmail: {
      width: 160,
      height: 14,
      marginBottom: 20,
    },
    profileStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    statItem: {
      width: 60,
      height: 40,
      borderRadius: 8,
    },
    
    // Table Row Skeleton Styles
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tableCell1: {
      flex: 2,
      height: 16,
      marginRight: 12,
    },
    tableCell2: {
      flex: 1,
      height: 16,
      marginRight: 12,
    },
    tableCell3: {
      flex: 1,
      height: 16,
      marginRight: 12,
    },
    tableCell4: {
      flex: 1,
      height: 16,
    },
    
    // Button Skeleton Styles
    button: {
      width: 120,
      height: 44,
      borderRadius: 22,
    },
    
    // Text Skeleton Styles
    textLine: {
      width: '80%',
      height: 16,
    },
    
    // Circle Skeleton Styles
    circle: {
      backgroundColor: colors.border,
    },
    
    // Form Skeleton Styles
    form: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    formLabel: {
      width: '40%',
      height: 14,
      marginBottom: 8,
    },
    formInput: {
      width: '100%',
      height: 44,
      borderRadius: 8,
      marginBottom: 16,
    },
    formButton: {
      width: '100%',
      height: 48,
      borderRadius: 24,
      marginTop: 8,
    },
    
    // Dashboard Skeleton Styles
    dashboard: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    dashboardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    dashboardTitle: {
      width: 120,
      height: 20,
    },
    dashboardAction: {
      width: 60,
      height: 16,
    },
    dashboardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    dashboardCard: {
      width: '48%',
      height: 80,
      borderRadius: 8,
      marginBottom: 12,
    },
  });

export default SkeletonLoader;