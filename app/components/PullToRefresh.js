import React from 'react';
import { ScrollView, FlatList, RefreshControl, useColorScheme, Platform } from 'react-native';
import { RATheme } from '../theme/colors';

/**
 * PullToRefresh - A wrapper component that adds pull-to-refresh functionality to ScrollView
 * 
 * @param {Object} props
 * @param {boolean} props.refreshing - Whether refresh is in progress
 * @param {Function} props.onRefresh - Callback when user pulls to refresh
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {Object} props.style - Additional styles for ScrollView
 * @param {Object} props.contentContainerStyle - Styles for content container
 * @param {string} props.testID - Test identifier
 * @param {boolean} props.enabled - Enable/disable pull to refresh (default: true)
 * @param {string} props.tintColor - Color of refresh indicator (iOS)
 * @param {Array<string>} props.colors - Colors for refresh indicator (Android)
 * 
 * @example
 * <PullToRefresh
 *   refreshing={isRefreshing}
 *   onRefresh={handleRefresh}
 * >
 *   <YourContent />
 * </PullToRefresh>
 */
export function PullToRefresh({
  refreshing = false,
  onRefresh,
  children,
  style,
  contentContainerStyle,
  testID,
  enabled = true,
  tintColor,
  colors: refreshColors,
  ...scrollViewProps
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Use primary blue color for refresh indicator
  const defaultTintColor = tintColor || colors.primary;
  const defaultColors = refreshColors || [colors.primary];

  return (
    <ScrollView
      testID={testID}
      style={style}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        enabled ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={defaultTintColor}
            colors={defaultColors}
            progressBackgroundColor={colors.surface}
            {...(Platform.OS === 'android' && {
              progressViewOffset: 0,
            })}
          />
        ) : undefined
      }
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
}

/**
 * PullToRefreshFlatList - A wrapper component that adds pull-to-refresh functionality to FlatList
 * 
 * @param {Object} props
 * @param {boolean} props.refreshing - Whether refresh is in progress
 * @param {Function} props.onRefresh - Callback when user pulls to refresh
 * @param {Array} props.data - Data array for FlatList
 * @param {Function} props.renderItem - Render function for items
 * @param {string} props.testID - Test identifier
 * @param {boolean} props.enabled - Enable/disable pull to refresh (default: true)
 * @param {string} props.tintColor - Color of refresh indicator (iOS)
 * @param {Array<string>} props.colors - Colors for refresh indicator (Android)
 * @param {Object} props.flatListProps - Additional props to pass to FlatList
 * 
 * @example
 * <PullToRefreshFlatList
 *   refreshing={isRefreshing}
 *   onRefresh={handleRefresh}
 *   data={items}
 *   renderItem={({ item }) => <Item data={item} />}
 * />
 */
export function PullToRefreshFlatList({
  refreshing = false,
  onRefresh,
  data,
  renderItem,
  testID,
  enabled = true,
  tintColor,
  colors: refreshColors,
  ...flatListProps
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Use primary blue color for refresh indicator
  const defaultTintColor = tintColor || colors.primary;
  const defaultColors = refreshColors || [colors.primary];

  return (
    <FlatList
      testID={testID}
      data={data}
      renderItem={renderItem}
      refreshControl={
        enabled ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={defaultTintColor}
            colors={defaultColors}
            progressBackgroundColor={colors.surface}
            {...(Platform.OS === 'android' && {
              progressViewOffset: 0,
            })}
          />
        ) : undefined
      }
      {...flatListProps}
    />
  );
}

