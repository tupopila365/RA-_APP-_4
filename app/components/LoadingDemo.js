import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';
import { NewsCardSkeleton, NewsCardSkeletonList } from './NewsCardSkeleton';
import { LoadingStates, SmartLoadingState } from './LoadingStates';

/**
 * Demo component to showcase different loading states
 * This can be used for testing and development purposes
 */
export function LoadingDemo() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [currentDemo, setCurrentDemo] = useState('skeleton');

  const demos = [
    { key: 'skeleton', label: 'Skeleton Cards', component: () => <NewsCardSkeletonList count={3} showImage={true} /> },
    { key: 'skeleton-no-image', label: 'Skeleton No Image', component: () => <NewsCardSkeletonList count={2} showImage={false} /> },
    { key: 'loading-initial', label: 'Initial Loading', component: () => <LoadingStates type="initial" /> },
    { key: 'loading-search', label: 'Search Loading', component: () => <LoadingStates type="search" /> },
    { key: 'loading-refresh', label: 'Refresh Loading', component: () => <LoadingStates type="refresh" /> },
    { key: 'smart-initial', label: 'Smart: Initial Load', component: () => <SmartLoadingState isInitialLoad={true} /> },
    { key: 'smart-search', label: 'Smart: Searching', component: () => <SmartLoadingState isSearching={true} searchQuery="test" /> },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loading States Demo</Text>
      
      {/* Demo Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
        {demos.map((demo) => (
          <TouchableOpacity
            key={demo.key}
            style={[
              styles.selectorButton,
              currentDemo === demo.key && styles.selectorButtonActive,
            ]}
            onPress={() => setCurrentDemo(demo.key)}
          >
            <Text
              style={[
                styles.selectorButtonText,
                currentDemo === demo.key && styles.selectorButtonTextActive,
              ]}
            >
              {demo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Demo Content */}
      <ScrollView style={styles.demoContent}>
        {demos.find(demo => demo.key === currentDemo)?.component()}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    selectorContainer: {
      marginBottom: 20,
    },
    selectorButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
    },
    selectorButtonActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    selectorButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    selectorButtonTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    demoContent: {
      flex: 1,
    },
  });