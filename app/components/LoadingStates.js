import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';
import { LoadingIndicator } from './LoadingIndicator';
import { NewsCardSkeletonList } from './NewsCardSkeleton';

/**
 * Centralized loading states component for different scenarios
 */
export function LoadingStates({ 
  type = 'initial', // 'initial', 'search', 'refresh', 'skeleton'
  message,
  count = 3,
  showImage = true,
  style,
  testID
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  switch (type) {
    case 'skeleton':
      return (
        <View style={[styles.container, style]} testID={testID}>
          <NewsCardSkeletonList count={count} showImage={showImage} />
        </View>
      );

    case 'search':
      return (
        <View style={[styles.searchContainer, style]} testID={testID}>
          <LoadingIndicator 
            size="small" 
            message={message || "Searching..."} 
            color={colors.primary}
          />
        </View>
      );

    case 'refresh':
      return (
        <View style={[styles.refreshContainer, style]} testID={testID}>
          <LoadingIndicator 
            size="medium" 
            message={message || "Refreshing..."} 
            color={colors.primary}
          />
        </View>
      );

    case 'initial':
    default:
      return (
        <View style={[styles.initialContainer, style]} testID={testID}>
          <LoadingIndicator 
            size="large" 
            message={message || "Loading news..."} 
            color={colors.primary}
          />
        </View>
      );
  }
}

/**
 * Smart loading component that chooses the best loading state
 * based on context and data availability
 */
export function SmartLoadingState({
  isInitialLoad = false,
  isSearching = false,
  isRefreshing = false,
  hasExistingData = false,
  searchQuery = '',
  style,
  testID
}) {
  // If refreshing and we have data, show minimal loading
  if (isRefreshing && hasExistingData) {
    return null; // RefreshControl handles this
  }

  // If searching with existing data, show search loading
  if (isSearching && hasExistingData && searchQuery.trim()) {
    return (
      <LoadingStates 
        type="search" 
        message="Searching..." 
        style={style}
        testID={testID}
      />
    );
  }

  // If initial load or searching without data, show skeleton
  if (isInitialLoad || (isSearching && !hasExistingData)) {
    return (
      <LoadingStates 
        type="skeleton" 
        count={isInitialLoad ? 5 : 3}
        showImage={true}
        style={style}
        testID={testID}
      />
    );
  }

  return null;
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    initialContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    searchContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    refreshContainer: {
      alignItems: 'center',
      paddingVertical: 30,
    },
  });