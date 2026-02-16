import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { LoadingOverlay, ErrorState, EmptyState, SearchInput, UnifiedCard } from '../components';
import { useFAQUseCases } from '../src/presentation/di/DependencyContext';
import { useFAQsViewModel } from '../src/presentation/viewModels/useFAQsViewModel';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function FaqItem({ faq, isExpanded, onPress, colors }) {
  return (
    <UnifiedCard
      variant="outlined"
      padding="none"
      onPress={onPress}
      style={[itemStyles.card, isExpanded && { borderLeftWidth: 4, borderLeftColor: colors.primary }]}
      accessibilityLabel={faq.question}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      accessibilityHint={isExpanded ? 'Collapse answer' : 'Expand to read answer'}
    >
      <View style={itemStyles.inner}>
        <View style={itemStyles.headerRow}>
          <Text style={[itemStyles.question, { color: colors.text }]} numberOfLines={isExpanded ? 0 : 2}>
            {faq.question}
          </Text>
          <View style={[itemStyles.chevronWrap, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </View>
        </View>
        {isExpanded && (
          <View style={[itemStyles.answerWrap, { borderTopColor: colors.border }]}>
            <Text style={[itemStyles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
            {faq.category ? (
              <View style={itemStyles.categoryRow}>
                <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
                <Text style={[itemStyles.category, { color: colors.textMuted }]}>{faq.category}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </UnifiedCard>
  );
}

const itemStyles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    minHeight: 56,
    overflow: 'hidden',
  },
  inner: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  question: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  chevronWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerWrap: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  answer: {
    ...typography.bodySmall,
    lineHeight: 22,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  category: {
    ...typography.caption,
  },
});

export default function FAQsScreen() {
  const { colors } = useTheme();
  const { getFAQsUseCase, searchFAQsUseCase } = useFAQUseCases();
  const {
    faqs,
    loading,
    error,
    expandedId,
    searchQuery,
    setSearchQuery,
    clearSearch,
    toggleExpanded,
    retry,
    isEmpty,
    hasError,
  } = useFAQsViewModel({ getFAQsUseCase, searchFAQsUseCase });

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleToggle = (id) => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    toggleExpanded(id);
  };

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question?.toLowerCase().includes(query) ||
        faq.answer?.toLowerCase().includes(query) ||
        faq.category?.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  const hasSearchResults = filteredFAQs.length > 0;
  const showEmptyState =
    !(loading && faqs.length === 0) &&
    (isEmpty || (!hasSearchResults && searchQuery.trim()));

  if (hasError && isEmpty && !loading) {
    return (
      <ErrorState
        message={error?.message || 'Failed to load FAQs'}
        onRetry={retry}
        fullScreen
      />
    );
  }

  const isInitialLoading = loading && faqs.length === 0;

  const bg = colors.backgroundSecondary || colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && faqs.length > 0}
            onRefresh={retry}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.welcomeRow}>
          <View style={[styles.welcomeIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="search-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Find answers to common questions about Roads Authority services
            </Text>
          </View>
        </View>

        {!isInitialLoading && !isEmpty && (
          <View style={styles.searchWrap}>
            <SearchInput
              placeholder="Search FAQs..."
              value={searchQuery}
              onSearch={setSearchQuery}
              onChangeTextImmediate={setSearchQuery}
              onClear={clearSearch}
              style={styles.searchInput}
              accessibilityLabel="Search FAQs"
              accessibilityHint="Search by question, answer, or category"
            />
          </View>
        )}

        {showEmptyState ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              icon={searchQuery.trim() ? 'search-outline' : 'document-text-outline'}
              message={
                searchQuery.trim() ? 'No FAQs match your search' : 'No FAQs available'
              }
              accessibilityLabel={
                searchQuery.trim() ? 'No search results' : 'No FAQs found'
              }
            />
          </View>
        ) : (
          <View style={styles.listWrap}>
            {searchQuery.trim() ? (
              <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
              </Text>
            ) : null}
            {filteredFAQs.map((faq) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedId === faq.id}
                onPress={() => handleToggle(faq.id)}
                colors={colors}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={isInitialLoading} message="Loading FAQs..." />
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    welcomeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    welcomeIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeText: {
      flex: 1,
    },
    welcomeTitle: {
      ...typography.h3,
      fontWeight: '600',
      marginBottom: 4,
    },
    welcomeSubtitle: {
      ...typography.body,
      fontSize: 14,
      lineHeight: 20,
    },
    searchWrap: {
      marginBottom: spacing.sm,
    },
    searchInput: {
      margin: 0,
    },
    resultsCount: {
      ...typography.caption,
      marginBottom: spacing.lg,
    },
    listWrap: {
      paddingTop: spacing.sm,
    },
    emptyWrap: {
      paddingTop: spacing.lg,
    },
  });
}
