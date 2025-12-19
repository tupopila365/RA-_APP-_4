import React from 'react';
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
import { ErrorState } from '../components';
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        ) : isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No FAQs available</Text>
            <Text style={styles.emptySubtext}>Check back later for updates</Text>
          </View>
        ) : (
          faqs.map((faq) => (
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
          ))
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    emptySubtext: {
      marginTop: 8,
      fontSize: 14,
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

