import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import unified design system components
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
import { useTheme } from '../hooks/useTheme';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { CachedImage } from '../components/CachedImage';
import { Badge } from '../components';
import { useNewsViewModel } from '../src/presentation/viewModels/useNewsViewModel';
import { useNewsUseCases } from '../src/presentation/di/DependencyContext';

export default function NewsScreen({ navigation }) {
  const { colors } = useTheme();
  
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
      <ErrorState
        message={error?.message || 'Failed to load news'}
        onRetry={retry}
        fullScreen
      />
    );
  }

  const isInitialLoading = loading && news.length === 0;

  // Handle search with simple state management
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(selectedCategory === category ? 'All' : category);
  }, [selectedCategory, setSelectedCategory]);

  const renderNewsItem = ({ item, index }) => (
    <UnifiedCard
      variant="default"
      padding="none"
      style={styles.newsCard}
      onPress={() => navigation.navigate('NewsDetail', { article: item })}
      testID={`news-item-${index}`}
      accessibilityLabel={`News article: ${item.title}`}
    >
      {item.imageUrl && (
        <CachedImage
          source={{ uri: item.imageUrl }}
          style={styles.newsImage}
          placeholder={
            <UnifiedSkeletonLoader
              type="news-card"
              width="100%"
              height={200}
              animated={false}
            />
          }
        />
      )}
      
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          {item.category && (
            <Badge
              label={item.category}
              variant="primary"
              size="small"
            />
          )}
          <Text style={styles.newsDate}>
            {formatDate(item.publishedAt)}
          </Text>
        </View>
        
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.excerpt && (
          <Text style={styles.newsExcerpt} numberOfLines={3}>
            {item.excerpt}
          </Text>
        )}
        
        <View style={styles.newsFooter}>
          <View style={styles.newsAuthor}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.newsAuthorText}>
              {item.author || 'Roads Authority'}
            </Text>
          </View>
          
          <View style={styles.newsReadTime}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.newsReadTimeText}>
              {item.readTime || '2 min read'}
            </Text>
          </View>
        </View>
      </View>
    </UnifiedCard>
  );

  const renderCategoryChip = ({ item }) => (
    <UnifiedButton
      variant={selectedCategory === item ? "primary" : "outline"}
      size="small"
      label={item}
      onPress={() => handleCategorySelect(item)}
      style={styles.categoryChip}
      textStyle={styles.categoryChipText}
      accessibilityState={{ selected: selectedCategory === item }}
      accessibilityLabel={`Category ${item}`}
    />
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      <UnifiedSkeletonLoader type="list-item" count={5} />
    </View>
  );

  const renderEmptyState = () => {
    const isFiltered = searchQuery.trim() || selectedCategory !== 'All';
    return (
      <EmptyState
        icon={isFiltered ? "search-outline" : "newspaper-outline"}
        title={isFiltered ? "No articles found" : "No news available"}
        message={
          isFiltered
            ? "No news articles match your search or filters."
            : "Check back later for the latest updates."
        }
        primaryActionLabel={isFiltered ? "Clear filters" : "Refresh"}
        onPrimaryAction={() => {
          if (isFiltered) {
            clearSearch();
            setSelectedCategory('All');
          } else {
            refresh();
          }
        }}
        secondaryActionLabel={isFiltered ? "Refresh" : undefined}
        onSecondaryAction={isFiltered ? refresh : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Unified Header */}
      <GlobalHeader
        title="News & Updates"
        subtitle="Latest from Roads Authority"
        rightActions={[
          {
            icon: 'notifications-outline',
            onPress: () => navigation.navigate('Notifications'),
            accessibilityLabel: 'View notifications'
          }
        ]}
        testID="news-header"
      />

      <View style={styles.content}>
        {/* Search Section */}
        <UnifiedCard variant="flat" padding="medium" style={styles.searchCard}>
          <UnifiedFormInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search news articles..."
            leftIcon="search"
            rightIcon={searchQuery ? "close-circle" : undefined}
            onRightIconPress={searchQuery ? clearSearch : undefined}
            testID="news-search-input"
            accessibilityLabel="Search news articles"
            accessibilityHint="Type to filter news by title or content"
          />
        </UnifiedCard>

        {/* Category Filter */}
        {categories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Categories</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All', ...categories.filter(c => c !== 'All')]}
              renderItem={renderCategoryChip}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoriesContainer}
              ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            />
          </View>
        )}

        {/* Results Count */}
        {news.length > 0 && (searchQuery.trim() || selectedCategory !== 'All') && (
          <UnifiedCard variant="outlined" padding="small" style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.resultsText}>
                {news.length} {news.length === 1 ? 'article' : 'articles'} found
              </Text>
            </View>
          </UnifiedCard>
        )}

        {/* News List */}
        {isInitialLoading ? (
          renderLoadingSkeleton()
        ) : news.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={news}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.newsList}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={refresh} 
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            ListFooterComponent={() => <View style={{ height: spacing.xxl }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
    },

    // Search Section
    searchCard: {
      marginBottom: spacing.lg,
    },

    // Categories Section
    categoriesSection: {
      marginBottom: spacing.lg,
    },
    categoriesTitle: {
      ...typography.h5,
      color: colors.text,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    categoriesContainer: {
      paddingHorizontal: spacing.sm,
    },
    categoryChip: {
      minWidth: 80,
    },
    categoryChipText: {
      fontSize: 14,
    },

    // Results Section
    resultsCard: {
      marginBottom: spacing.lg,
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    resultsText: {
      ...typography.bodySmall,
      color: colors.text,
      marginLeft: spacing.sm,
      fontWeight: '500',
    },

    // Loading Section
    loadingContainer: {
      flex: 1,
      paddingTop: spacing.lg,
    },
    skeletonCard: {
      marginBottom: spacing.lg,
    },

    // News List
    newsList: {
      paddingTop: spacing.sm,
    },
    newsCard: {
      overflow: 'hidden',
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
      marginBottom: spacing.md,
    },
    newsDate: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    newsTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.sm,
      lineHeight: 28,
    },
    newsExcerpt: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: spacing.lg,
    },
    newsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    newsAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    newsAuthorText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
      fontWeight: '500',
    },
    newsReadTime: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    newsReadTimeText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
      fontWeight: '500',
    },
  });