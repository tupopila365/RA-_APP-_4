import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import { UnifiedCard } from '../components/UnifiedCard';
import { LoadingOverlay } from '../components';
import { ErrorState } from '../components/ErrorState';
import { NoDataDisplay } from '../components/NoDataDisplay';
import { SearchInput } from '../components/SearchInput';
import { CachedImage } from '../components/CachedImage';
import { Badge } from '../components/Badge';
import { useNewsViewModel } from '../src/presentation/viewModels/useNewsViewModel';
import { useNewsUseCases } from '../src/presentation/di/DependencyContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const NEWS_IMAGE_HEIGHT = 180;

export default function NewsScreen({ navigation }) {
  const { colors } = useTheme();
  const { getNewsUseCase, searchNewsUseCase } = useNewsUseCases();
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

  const handleSearch = useCallback((query) => setSearchQuery(query), [setSearchQuery]);
  const styles = getStyles(colors);

  if (hasError && isEmpty && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ErrorState
          message={error?.message || 'Failed to load news'}
          onRetry={retry}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  const isInitialLoading = loading && news.length === 0;
  const hasFilters = searchQuery.trim() || selectedCategory !== 'All';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeTitle}>Latest News</Text>
          <Text style={styles.welcomeSubtitle}>
            Updates and announcements from Roads Authority
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search articles..."
            value={searchQuery}
            onSearch={handleSearch}
            onChangeTextImmediate={setSearchQuery}
            onClear={clearSearch}
            style={styles.searchInput}
            accessibilityLabel="Search news articles"
            accessibilityHint="Search by title or category"
          />
        </View>

        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === 'All' && styles.filterChipActive]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === 'All' && styles.filterChipTextActive,
                ]}
                numberOfLines={1}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories
              .filter((c) => c !== 'All')
              .map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === category && styles.filterChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        )}

        {news.length > 0 && hasFilters && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount}>
              {news.length} {news.length === 1 ? 'article' : 'articles'} found
            </Text>
          </View>
        )}

        {news.length > 0 ? (
          <View style={styles.content}>
            {news.map((item) => (
              <UnifiedCard
                key={item.id}
                onPress={() => navigation.navigate('NewsDetail', { article: item })}
                variant="elevated"
                padding="none"
                style={styles.newsCard}
                accessible
                accessibilityLabel={`${item.title}, ${item.category}`}
                accessibilityHint="Double tap to read full article"
              >
                {item.hasImage() ? (
                  <CachedImage
                    uri={item.imageUrl}
                    style={styles.newsImage}
                    resizeMode="cover"
                    accessibilityLabel={`Featured image for ${item.title}`}
                  />
                ) : (
                  <View style={[styles.newsImagePlaceholder, { backgroundColor: colors.card }]}>
                    <Ionicons
                      name="newspaper-outline"
                      size={48}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
                <View style={styles.newsContent}>
                  <View style={styles.newsMeta}>
                    {item.category && (
                      <Badge label={item.category} variant="info" size="small" />
                    )}
                    <Text style={styles.dateText}>
                      {item.getTimeAgo ? item.getTimeAgo() : ''}
                    </Text>
                  </View>
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.newsExcerpt} numberOfLines={2}>
                    {item.getShortExcerpt ? item.getShortExcerpt() : item.excerpt || ''}
                  </Text>
                  <View style={styles.readMoreRow}>
                    <Text style={[styles.readMoreText, { color: colors.primary }]}>
                      Read article
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </View>
                </View>
              </UnifiedCard>
            ))}
          </View>
        ) : (
          <NoDataDisplay
            preset="news"
            message={
              hasFilters
                ? 'No articles match your search or filter.'
                : 'No news articles available.'
            }
            style={styles.emptyState}
          />
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
      backgroundColor: colors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    welcomeRow: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    welcomeTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.xs,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    welcomeSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    searchContainer: {
      paddingBottom: spacing.sm,
    },
    searchInput: {
      margin: 0,
    },
    filterContainer: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      minWidth: 70,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
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
    },
    filterChipTextActive: {
      color: colors.textInverse || '#FFFFFF',
      fontWeight: '600',
    },
    resultsCountContainer: {
      paddingBottom: spacing.sm,
    },
    resultsCount: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    content: {
      paddingTop: spacing.xs,
    },
    newsCard: {
      marginBottom: spacing.lg,
      overflow: 'hidden',
    },
    newsImage: {
      width: '100%',
      height: NEWS_IMAGE_HEIGHT,
      backgroundColor: colors.surface,
    },
    newsImagePlaceholder: {
      width: '100%',
      height: NEWS_IMAGE_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    newsContent: {
      padding: spacing.lg,
    },
    newsMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    dateText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    newsTitle: {
      ...typography.h5,
      color: colors.text,
      marginBottom: spacing.sm,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    newsExcerpt: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.md,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    readMoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    readMoreText: {
      ...typography.bodySmall,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    emptyState: {
      minHeight: 260,
      paddingVertical: spacing.xxxl,
    },
  });
}
