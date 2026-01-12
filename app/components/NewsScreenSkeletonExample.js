import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { NewsScreenSkeleton, EnhancedNewsScreenSkeleton } from './index';

/**
 * Example component showing how to use the News Screen Skeleton loaders
 * This is for demonstration purposes and testing
 */
export function NewsScreenSkeletonExample() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Standard News Screen Skeleton</Text>
        <NewsScreenSkeleton 
          animated={true}
          showSearch={true}
          showFilters={true}
          cardCount={3}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>Enhanced News Screen Skeleton</Text>
        <EnhancedNewsScreenSkeleton 
          animated={true}
          showSearch={true}
          showFilters={true}
          showResultsCount={true}
          cardCount={3}
          filterCount={4}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    flex: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    padding: 16,
    textAlign: 'center',
  },
});

export default NewsScreenSkeletonExample;