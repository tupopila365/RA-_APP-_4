import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { LoadingOverlay, ErrorState, EmptyState, SearchInput } from '../components';
import { formsService } from '../services/formsService';
import { spacing } from '../theme/spacing';

export default function FormsScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedForm, setExpandedForm] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);

  // Use the document download hook
  const {
    isDownloading,
    progress,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  // Filter options
  const filters = [
    'All',
    'Procurement',
    'Roads & Infrastructure',
    'Plans & Strategies',
    'Conferences & Events',
    'Legislation & Policy',
  ];

  const fetchForms = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching forms...');
      const formsData = await formsService.getForms();
      console.log('Fetched forms count:', formsData?.length || 0);
      
      setForms(formsData || []);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError(err.message || 'Failed to load forms');
      if (isRefresh) {
        Alert.alert('Error', 'Failed to refresh forms. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // Apply search and filter
  const filteredData = forms.filter((item) => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesFilter = selectedFilter === 'All' || item.category === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedForm(expandedForm === id ? null : id);
  };

  const handleDownload = async (document, formName) => {
    if (!document?.url) {
      Alert.alert('Error', 'No document available for download');
      return;
    }

    try {
      setCurrentDownloadId(document.url);
      resetDownload();
      await startDownload(document.url, document.fileName || document.title);
      setCurrentDownloadId(null);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download document. Please try again.');
      setCurrentDownloadId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchForms(true);
  };

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error}
          onRetry={() => fetchForms()}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <SearchInput
            placeholder="Search forms..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search forms"
            accessibilityHint="Search by name or category"
          />
        </View>

        {/* Category Filter Chips */}
        <View style={styles.filterSectionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map((filter, index) => (
              <TouchableOpacity
                key={filter || `filter-${index}`}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive,
                  ]}
                 numberOfLines={1}
                 maxFontSizeMultiplier={1.3}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        {filteredData.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount} maxFontSizeMultiplier={1.3}>
              {filteredData.length} {filteredData.length === 1 ? 'form' : 'forms'} found
            </Text>
          </View>
        )}

        {/* Forms List */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="document-text-outline"
              message={forms.length === 0 ? 'No forms available' : 'No forms match your search'}
              accessibilityLabel="No forms found"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredData.map((item, index) => {
              const isExpanded = expandedForm === item.id;
              return (
                <TouchableOpacity 
                  key={item.id || `form-${index}`} 
                  style={styles.formCard} 
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.formHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.categoryText, { color:'#fff'  }]} maxFontSizeMultiplier={1.3}>
                        {item.category}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text style={styles.formTitle} numberOfLines={2} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                    {item.name}
                  </Text>
                  <View style={styles.formDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="document-attach-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                        {item.documents?.length || 0} {item.documents?.length === 1 ? 'document' : 'documents'}
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Documents</Text>
                        {item.documents && item.documents.length > 0 ? (
                          item.documents.map((doc, docIndex) => {
                            const isDocDownloading = isDownloading && currentDownloadId === doc.url;
                            return (
                              <TouchableOpacity
                                key={docIndex}
                                style={[
                                  styles.downloadButton,
                                  { backgroundColor: colors.primary },
                                  isDocDownloading && styles.downloadButtonDisabled,
                                ]}
                                onPress={() => handleDownload(doc, item.name)}
                                disabled={isDocDownloading}
                              >
                                {isDocDownloading ? (
                                  <>
                                    <UnifiedSkeletonLoader type="circle" width={16} height={16} />
                                    <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                                      Downloading {progress}%
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                                      {doc.title || doc.fileName || `Document ${docIndex + 1}`}
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            );
                          })
                        ) : (
                          <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>No documents available</Text>
                        )}
                      </View>
                      {isDownloading && currentDownloadId && (
                        <View style={styles.progressBarContainer}>
                          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.primary }]} />
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={loading && !refreshing} message="Loading forms..." />
    </SafeAreaView>
  );
}

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
    filterSectionContainer: {
      paddingHorizontal: 0,
      paddingVertical: spacing.sm,
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
      maxWidth: 180,
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
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      numberOfLines: 1,
      flexShrink: 1,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    resultsCountContainer: {
      paddingHorizontal: 0,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    resultsCount: {
      fontSize: 14,
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
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: spacing.xl,
      marginBottom: spacing.md,
      shadowColor: '#fff',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    categoryBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    formDetails: {
      flexDirection: 'row',
      marginBottom: spacing.md,
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.lg,
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    expandedContent: {
      marginTop: spacing.lg,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    sectionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 8,
      marginTop: spacing.sm,
      gap: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    downloadButtonDisabled: {
      opacity: 0.7,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
    },
  });
}
