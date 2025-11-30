import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { SearchInput } from '../components/SearchInput';
import { FilterChip } from '../components/FilterChip';
import { NewsCardSkeleton } from '../components/NewsCardSkeleton';
import { CachedImage } from '../components/CachedImage';
import { useNewsViewModel } from '../src/presentation/viewModels/useNewsViewModel';
import { useNewsUseCases } from '../src/presentation/di/DependencyContext';

const { width } = Dimensions.get('window');

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchInput
        placeholder="Search news..."
        onSearch={setSearchQuery}
        onClear={clearSearch}
        style={styles.searchInput}
        accessibilityLabel="Search news articles"
        accessibilityHint="Type to filter news by title or category"
      />

      {/* Category Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        accessibilityRole="tablist"
        accessibilityLabel="Category filters"
      >
        {categories.map((category) => (
          <FilterChip
            key={category}
            label={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            testID={`category-filter-${category}`}
            accessibilityLabel={`Filter by ${category}`}
          />
        ))}
      </ScrollView>

      {/* News List */}
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh} 
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isInitialLoading ? (
          // Show skeleton loading screens
          <>
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </>
        ) : news.length > 0 ? (
          news.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.newsCard} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('NewsDetail', { article: item })}
              accessible={true}
              accessibilityLabel={`${item.title}, ${item.category}, ${item.getFormattedDate()}`}
              accessibilityHint="Double tap to read full article"
              accessibilityRole="button"
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
                  <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.categoryText, { color: colors.primary }]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>{item.getTimeAgo()}</Text>
                </View>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsExcerpt} numberOfLines={2}>{item.getShortExcerpt()}</Text>
                <View style={styles.readMore}>
                  <Text style={[styles.readMoreText, { color: colors.primary }]}>Read More</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            message={searchQuery || selectedCategory !== 'All' 
              ? "No news articles match your filters" 
              : "No news articles found"}
            icon="newspaper-outline"
            accessibilityLabel="No news available"
          />
        )}
      </ScrollView>
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
    header: {
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    searchInput: {
      margin: 15,
      marginTop: 20,
      marginBottom: 10,
    },
    filterContainer: {
      paddingHorizontal: 15,
      paddingBottom: 10,
    },
    content: {
      padding: 20,
    },
    newsCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    newsImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.surface,
    },
    newsContent: {
      padding: 20,
    },
    newsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    newsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    newsExcerpt: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    readMore: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    readMoreText: {
      fontSize: 14,
      fontWeight: '600',
      marginRight: 5,
    },

  });
}

NewsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

