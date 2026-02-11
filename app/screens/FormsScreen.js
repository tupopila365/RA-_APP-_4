import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import {
  ErrorState,
  SearchInput,
  UnifiedCard,
  FilterDropdownBox,
} from '../components';
import { NoDataDisplay } from '../components/NoDataDisplay';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SpinnerCore } from '../components/SpinnerCore';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { formsService } from '../services/formsService';

// Category to icon and accent color
const CATEGORY_CONFIG = {
  Procurement: { icon: 'briefcase-outline', colorKey: 'primary' },
  'Roads & Infrastructure': { icon: 'construct-outline', colorKey: 'primary' },
  'Plans & Strategies': { icon: 'map-outline', colorKey: 'primary' },
  'Conferences & Events': { icon: 'calendar-outline', colorKey: 'primary' },
  'Legislation & Policy': { icon: 'shield-checkmark-outline', colorKey: 'primary' },
  default: { icon: 'document-text-outline', colorKey: 'primary' },
};

const FILTERS = [
  'All',
  'Procurement',
  'Roads & Infrastructure',
  'Plans & Strategies',
  'Conferences & Events',
  'Legislation & Policy',
];

export default function FormsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const bg = colors.backgroundSecondary || colors.background;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedForm, setExpandedForm] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);

  const {
    isDownloading,
    progress,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  const fetchForms = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const formsData = await formsService.getForms();
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

  const filteredData = useMemo(() => {
    return forms.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === 'All' || item.category === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [forms, searchQuery, selectedFilter]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredData.forEach((item) => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {});
  }, [filteredData]);

  const toggleExpand = (id) => {
    setExpandedForm((prev) => (prev === id ? null : id));
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
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download document. Please try again.');
    } finally {
      setCurrentDownloadId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchForms(true);
  };

  const getCategoryStyle = (category) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
  };

  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <ErrorState message={error} onRetry={() => fetchForms()} fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={[styles.welcomeIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="document-text-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Forms & Documents</Text>
            <Text style={styles.welcomeSubtitle}>
              Download official Roads Authority forms, policies, and documents
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search forms or documents..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search forms"
            accessibilityHint="Search by name or category"
          />
        </View>

        {/* Category Filter */}
        <View style={styles.filterRow}>
          <FilterDropdownBox
            label="Category"
            placeholder="Category"
            value={selectedFilter === 'All' ? null : selectedFilter}
            options={FILTERS}
            nullMapsToOption="All"
            onSelect={(item) => setSelectedFilter(item)}
            onClear={() => setSelectedFilter('All')}
            accessibilityLabel="Filter by category"
            testID="filter-category"
          />
        </View>

        {/* Results count */}
        {filteredData.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsRow}>
            <Text style={styles.resultsCount}>
              {filteredData.length} {filteredData.length === 1 ? 'form' : 'forms'} found
            </Text>
          </View>
        )}

        {/* Content */}
        {filteredData.length === 0 ? (
          <NoDataDisplay
            preset="forms"
            title={forms.length === 0 ? 'No forms available' : 'No forms match your search'}
            message={
              forms.length === 0
                ? 'Forms and documents will appear here when available.'
                : 'Try a different search term or category filter.'
            }
          />
        ) : (
          <View style={styles.content}>
            {Object.entries(groupedByCategory).map(([category, items]) => {
              const config = getCategoryStyle(category);
              return (
                <View key={category} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIconWrap, { backgroundColor: colors.primary + '18' }]}>
                      <Ionicons name={config.icon} size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                        {items.length}
                      </Text>
                    </View>
                  </View>

                  {items.map((item, index) => {
                    const isExpanded = expandedForm === item.id;
                    const docCount = item.documents?.length || 0;

                    return (
                      <UnifiedCard
                        key={item.id || `form-${index}`}
                        variant="default"
                        padding="none"
                        style={styles.formCard}
                      >
                        <TouchableOpacity
                          style={styles.formCardHeader}
                          onPress={() => toggleExpand(item.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.formCardLeft}>
                            <View style={[styles.formIconWrap, { backgroundColor: colors.primary + '12' }]}>
                              <Ionicons
                                name={getCategoryStyle(item.category).icon}
                                size={22}
                                color={colors.primary}
                              />
                            </View>
                            <View style={styles.formCardTitleWrap}>
                              <Text style={styles.formTitle} numberOfLines={2}>
                                {item.name}
                              </Text>
                              <View style={styles.formMeta}>
                                <Ionicons name="document-attach-outline" size={14} color={colors.textSecondary} />
                                <Text style={styles.formMetaText}>
                                  {docCount} {docCount === 1 ? 'document' : 'documents'}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={22}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>

                        {isExpanded && item.documents?.length > 0 && (
                          <View style={styles.documentsList}>
                            <View style={[styles.documentsDivider, { backgroundColor: colors.border }]} />
                            {item.documents.map((doc, docIndex) => {
                              const isDocDownloading =
                                isDownloading && currentDownloadId === doc.url;
                              const docTitle =
                                doc.title || doc.fileName || `Document ${docIndex + 1}`;

                              return (
                                <TouchableOpacity
                                  key={docIndex}
                                  style={[
                                    styles.documentRow,
                                    docIndex < item.documents.length - 1 && styles.documentRowBorder,
                                  ]}
                                  onPress={() => handleDownload(doc, item.name)}
                                  disabled={isDocDownloading}
                                  activeOpacity={0.7}
                                >
                                  <View style={styles.documentRowLeft}>
                                    <View style={[styles.docIconWrap, { backgroundColor: colors.error + '15' }]}>
                                      <Ionicons name="document-outline" size={18} color={colors.error} />
                                    </View>
                                    <Text style={styles.documentTitle} numberOfLines={2}>
                                      {docTitle}
                                    </Text>
                                  </View>
                                  <View style={[styles.downloadBtn, { backgroundColor: colors.primary }]}>
                                    {isDocDownloading ? (
                                      <SpinnerCore size="small" color="#FFFFFF" />
                                    ) : (
                                      <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                    )}
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                            {isDownloading && currentDownloadId && (
                              <View style={styles.progressWrap}>
                                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                                  <View
                                    style={[
                                      styles.progressFill,
                                      { width: `${progress}%`, backgroundColor: colors.primary },
                                    ]}
                                  />
                                </View>
                                <Text style={styles.progressText}>{progress}%</Text>
                              </View>
                            )}
                          </View>
                        )}

                        {isExpanded && (!item.documents || item.documents.length === 0) && (
                          <View style={styles.documentsList}>
                            <View style={[styles.documentsDivider, { backgroundColor: colors.border }]} />
                            <Text style={styles.noDocsText}>No documents available</Text>
                          </View>
                        )}
                      </UnifiedCard>
                    );
                  })}
                </View>
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
      backgroundColor: colors.backgroundSecondary || colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    welcomeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
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
      color: colors.text,
      marginBottom: 4,
    },
    welcomeSubtitle: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    searchContainer: {
      marginBottom: spacing.md,
    },
    searchInput: {
      margin: 0,
    },
    filterRow: {
      marginBottom: spacing.md,
    },
    resultsRow: {
      marginBottom: spacing.sm,
    },
    resultsCount: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    content: {
      marginTop: spacing.sm,
    },
    categorySection: {
      marginBottom: spacing.xl,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    categoryIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryTitle: {
      ...typography.h4,
      flex: 1,
      fontWeight: '600',
      color: colors.text,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 8,
      minWidth: 28,
      alignItems: 'center',
    },
    categoryBadgeText: {
      ...typography.caption,
      fontWeight: '700',
      fontSize: 12,
    },
    formCard: {
      marginBottom: spacing.md,
      overflow: 'hidden',
      padding: 0,
    },
    formCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    formCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      gap: spacing.md,
    },
    formIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formCardTitleWrap: {
      flex: 1,
      minWidth: 0,
    },
    formTitle: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      lineHeight: 22,
    },
    formMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    formMetaText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    documentsList: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    documentsDivider: {
      height: 1,
      marginBottom: spacing.md,
    },
    documentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    documentRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    documentRowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minWidth: 0,
    },
    docIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    documentTitle: {
      ...typography.body,
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    downloadBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressWrap: {
      marginTop: spacing.md,
      gap: spacing.xs,
    },
    progressTrack: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
    progressText: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    noDocsText: {
      ...typography.body,
      color: colors.textSecondary,
      fontStyle: 'italic',
      paddingVertical: spacing.md,
    },
  });
}
