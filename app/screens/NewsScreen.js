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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { SearchInput } from '../components/SearchInput';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { CachedImage } from '../components/CachedImage';
import { Badge, Card, NewsCardSkeletonList } from '../components';
import { useNewsViewModel } from '../src/presentation/viewModels/useNewsViewModel';
import { useNewsUseCases } from '../src/presentation/di/DependencyContext';

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
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

        {/* Category Filter Chips - matching Road Status design */}
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
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === 'All' && styles.filterChipTextActive,
                ]}
              >
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
                onPress={() => setSelectedCategory(selectedCategory === category ? 'All' : category)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Results Count */}
        {news.length > 0 && (searchQuery.trim() || selectedCategory !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount}>
              {news.length} {news.length === 1 ? 'article' : 'articles'} found
            </Text>
          </View>
        )}

        {/* News List */}
        {isInitialLoading ? (
          <View style={styles.content}>
            <NewsCardSkeletonList count={5} showImage={true} />
          </View>
        ) : news.length > 0 ? (
          <View style={styles.content}>
            {news.map((item) => (
              <Card
                key={item.id}
                onPress={() => navigation.navigate('NewsDetail', { article: item })}
                style={styles.newsCard}
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
                    <Text style={styles.dateText}>{item.getTimeAgo()}</Text>
                  </View>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsExcerpt} numberOfLines={2}>{item.getShortExcerpt()}</Text>
                  <View style={styles.readMore}>
                    <Text style={[styles.readMoreText, { color: colors.primary }]}>Read More</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
              </Card>
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
      paddingBottom: 20,
      padding: 20,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      paddingTop: 16,
      paddingBottom: 8,
    },
    searchInput: {
      margin: 0,
    },
    filterContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      gap: 10,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    resultsCountContainer: {
      paddingHorizontal: 0,
      paddingTop: 8,
      paddingBottom: 8,
    },
    resultsCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    loadingContainer: {
      padding: 20,
    },
    emptyStateContainer: {
      padding: 20,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 0,
    },
    newsCard: {
      overflow: 'hidden',
      padding: 0,
      marginBottom: 15,
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

