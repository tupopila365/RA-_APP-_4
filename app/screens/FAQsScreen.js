import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { ErrorState, EmptyState, SearchInput } from '../components';
import { useFAQUseCases } from '../src/presentation/di/DependencyContext';
import { useFAQsViewModel } from '../src/presentation/viewModels/useFAQsViewModel';

export default function FAQsScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Get use cases from dependency injection
  const { getFAQsUseCase, searchFAQsUseCase } = useFAQUseCases();
  
  // Use view model for state management
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

  const styles = getStyles(colors);

  // Show error state if initial load fails
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

  // Filter FAQs based on search query (if view model doesn't handle it)
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.question?.toLowerCase().includes(query) ||
      faq.answer?.toLowerCase().includes(query) ||
      faq.category?.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  const hasSearchResults = filteredFAQs.length > 0;
  const showEmptyState = !isInitialLoading && (isEmpty || (!hasSearchResults && searchQuery.trim()));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Input */}
      {!isInitialLoading && !isEmpty && (
        <SearchInput
          placeholder="Search FAQs..."
          onSearch={setSearchQuery}
          onClear={clearSearch}
          style={styles.searchInput}
          accessibilityLabel="Search FAQs"
          accessibilityHint="Search by question, answer, or category"
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && faqs.length > 0}
            onRefresh={retry}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Ionicons name="help-circle" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
        </View>

        {isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading FAQs...</Text>
          </View>
        ) : showEmptyState ? (
          <EmptyState
            icon={searchQuery.trim() ? "search-outline" : "document-text-outline"}
            message={searchQuery.trim() ? "No FAQs match your search" : "No FAQs available"}
            accessibilityLabel={searchQuery.trim() ? "No search results" : "No FAQs found"}
          />
        ) : (
          <>
            {searchQuery.trim() && (
              <Text style={styles.resultsCount}>
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
              </Text>
            )}
            {filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={[
                styles.faqCard,
                expandedId === faq.id && styles.faqCardExpanded,
              ]}
              onPress={() => toggleExpanded(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.primary}
                />
              </View>
              {expandedId === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  {faq.category && (
                    <View style={styles.categoryContainer}>
                      <Ionicons name="pricetag" size={14} color={colors.textSecondary} />
                      <Text style={styles.categoryText}>{faq.category}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    searchInput: {
      margin: 15,
      marginTop: 20,
      marginBottom: 10,
    },
    resultsCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    faqCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    faqCardExpanded: {
      borderColor: colors.primary,
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    faqQuestion: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginRight: 10,
    },
    faqAnswerContainer: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    faqAnswer: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    categoryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    categoryText: {
      marginLeft: 6,
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });
}

