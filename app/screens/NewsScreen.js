import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import { UnifiedCard } from '../components/UnifiedCard';
import { LoadingOverlay, NewsScreenSkeleton } from '../components';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { SearchInput } from '../components/SearchInput';
import { CachedImage } from '../components/CachedImage';
import { Badge, Card, NewsListSkeleton } from '../components';
import { useNewsViewModel } from '../src/presentation/viewModels/useNewsViewModel';
import { useNewsUseCases } from '../src/presentation/di/DependencyContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

export default function NewsScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Get use cases from dependency injection
  const { getNewsUseCase, searchNewsUseCase } = useNewsUseCases();
  
  // Use view model for state management
  const {
    news,
    categories,
    loading,
    refreshing,
    error,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    clearSearch,
    refresh,
    retry,
    isEmpty,
    hasError,
  } = useNewsViewModel({ getNewsUseCase, searchNewsUseCase });

  const styles = getStyles(colors);

  // Show error state if initial load fails
  if (hasError && isEmpty && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ErrorState
          message={error?.message || 'Failed to load news'}
          onRetry={retry}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  const isInitialLoading = loading && news.length === 0;

  // Handle search with simple state management
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh} 
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <SearchInput
            placeholder="Search news..."
            onSearch={handleSearch}
            onClear={clearSearch}
            style={styles.searchInput}
            accessibilityLabel="Search news articles"
            accessibilityHint="Type to filter news by title or category"
          />
        </View>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === 'All' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={[
                  styles.filterChipText,
                  selectedCategory === 'All' && styles.filterChipTextActive,
                ]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}>
                All
              </Text>
            </TouchableOpacity>
            {categories.filter(c => c !== 'All').map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive,
                  ]}
                  numberOfLines={1}
                 maxFontSizeMultiplier={1.3}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Results Count */}
        {news.length > 0 && (searchQuery.trim() || selectedCategory !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount} maxFontSizeMultiplier={1.3}>
              {news.length} {news.length === 1 ? 'article' : 'articles'} found
            </Text>
          </View>
        )}

        {/* News List */}
        {news.length > 0 ? (
          <View style={styles.content}>
            {news.map((item) => (
              <UnifiedCard
                key={item.id}
                onPress={() => navigation.navigate('NewsDetail', { article: item })}
                style={styles.newsCard}
                variant="elevated"
                padding="none"
                accessible={true}
                accessibilityLabel={`${item.title}, ${item.category}, ${item.getFormattedDate()}`}
                accessibilityHint="Double tap to read full article"
              >
                {item.hasImage() && (
                  <CachedImage
                    uri={item.imageUrl}
                    style={styles.newsImage}
                    resizeMode="cover"
                    accessibilityLabel={`Featured image for ${item.title}`}
                    testID={`news-image-${item.id}`}
                  />
                )}
                <View style={styles.newsContent}>
                  <View style={styles.newsHeader}>
                    <Badge label={item.category} variant="info" />
                    <Text style={styles.dateText} maxFontSizeMultiplier={1.3}>{item.getTimeAgo()}</Text>
                  </View>
                  <Text style={styles.newsTitle} maxFontSizeMultiplier={1.3}>{item.title}</Text>
                  <Text style={styles.newsExcerpt} numberOfLines={2} maxFontSizeMultiplier={1.3}>{item.getShortExcerpt()}</Text>
                  <View style={styles.readMore}>
                    <Text style={[styles.readMoreText, { color: colors.primary }]} maxFontSizeMultiplier={1.3}>Read More</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
              </UnifiedCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              message={searchQuery || selectedCategory !== 'All' 
                ? "No news articles match your filters" 
                : "No news articles found"}
              icon="newspaper-outline"
              accessibilityLabel="No news available"
            />
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={isInitialLoading} message="Loading news..." />
    </SafeAreaView>
  );
}

NewsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.xl,
      padding: spacing.lg,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    searchInput: {
      margin: 0,
    },
    filterContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      flexDirection: 'row',
      flexWrap: 'nowrap',
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      minWidth: 60,
      maxWidth: 120,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      ...typography.bodySmall,
      fontWeight: '500',
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      textAlign: 'center',
      numberOfLines: 1,
      flexShrink: 1,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    resultsCountContainer: {
      paddingHorizontal: 0,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    resultsCount: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    emptyStateContainer: {
      padding: spacing.xl,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 0,
    },
    newsCard: {
      overflow: 'hidden',
      marginBottom: spacing.md,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    newsImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.surface,
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
    dateText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    newsTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.sm,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontSize: 18,
      fontWeight: '600',
    },
    newsExcerpt: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.md,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontSize: 14,
    },
    readMore: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    readMoreText: {
      ...typography.bodySmall,
      fontWeight: '600',
      marginRight: spacing.xs,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
  });
}

NewsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

