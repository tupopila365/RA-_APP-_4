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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import {
  ErrorState,
  SearchInput,
  UnifiedCard,
  FilterDropdownBox,
  UnifiedButton,
} from '../components';
import { NoDataDisplay } from '../components/NoDataDisplay';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SpinnerCore } from '../components/SpinnerCore';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { raServicesService } from '../services/raServicesService';

const CATEGORY_CONFIG = {
  Licensing: { icon: 'id-card-outline', colorKey: 'primary' },
  'Vehicle Registration': { icon: 'car-outline', colorKey: 'primary' },
  'Permits & Authorisations': { icon: 'document-text-outline', colorKey: 'primary' },
  Other: { icon: 'ellipsis-horizontal-outline', colorKey: 'primary' },
  default: { icon: 'construct-outline', colorKey: 'primary' },
};

const FILTERS = [
  'All',
  'Licensing',
  'Vehicle Registration',
  'Permits & Authorisations',
  'Other',
];

export default function RAServicesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const bg = colors.backgroundSecondary || colors.background;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedService, setExpandedService] = useState(null);
  const [services, setServices] = useState([]);
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

  const fetchServices = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const servicesData = await raServicesService.getServices();
      setServices(servicesData || []);
    } catch (err) {
      console.error('Error fetching RA services:', err);
      setError(err.message || 'Failed to load RA services');
      if (isRefresh) {
        Alert.alert('Error', 'Failed to refresh services. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredData = useMemo(() => {
    return services.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === 'All' || item.category === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [services, searchQuery, selectedFilter]);

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
    setExpandedService((prev) => (prev === id ? null : id));
  };

  const handleDownload = async (document, serviceName) => {
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

  const handleContactPress = async (contactInfo) => {
    if (!contactInfo?.trim()) return;
    const url = contactInfo.trim();
    const isUrl = url.startsWith('http://') || url.startsWith('https://');
    const isTel = url.startsWith('tel:');
    const isMail = url.startsWith('mailto:');
    try {
      if (isUrl) {
        await WebBrowser.openBrowserAsync(url);
      } else if (isTel || isMail) {
        await Linking.openURL(url);
      } else if (url.includes('@')) {
        await Linking.openURL(`mailto:${url}`);
      } else if (/^[\d\s+()-]+$/.test(url.replace(/\s/g, ''))) {
        await Linking.openURL(`tel:${url}`);
      } else {
        await WebBrowser.openBrowserAsync(url.startsWith('http') ? url : `https://${url}`);
      }
    } catch (err) {
      console.error('Error opening link:', err);
      Alert.alert('Error', 'Could not open link. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices(true);
  };

  const getCategoryStyle = (category) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
  };

  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <ErrorState message={error} onRetry={() => fetchServices()} fullScreen />
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
        {/* Welcome - Calm, reassuring for stressed users */}
        <View style={styles.welcomeRow}>
          <View style={[styles.welcomeIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="construct-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>RA Services</Text>
            <Text style={styles.welcomeSubtitle}>
              Find what you need—licensing, registration, permits. We're here to help.
            </Text>
          </View>
        </View>

        {/* Search - Prominent */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search services (e.g. licence, registration)..."
            value={searchQuery}
            onSearch={setSearchQuery}
            onChangeTextImmediate={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search RA services"
            accessibilityHint="Search by name, description or category"
          />
        </View>

        {/* Category Filter */}
        <View style={styles.filterRow}>
          <FilterDropdownBox
            label="Category"
            placeholder="All categories"
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
              {filteredData.length} {filteredData.length === 1 ? 'service' : 'services'} found
            </Text>
          </View>
        )}

        {/* Content */}
        {filteredData.length === 0 ? (
          <NoDataDisplay
            icon="construct-outline"
            title={services.length === 0 ? 'No services available' : 'No services match your search'}
            message={
              services.length === 0
                ? 'Services will appear here when available. Pull down to refresh.'
                : 'Try a different search term or category.'
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
                    const isExpanded = expandedService === item.id;
                    const hasContact = !!item.contactInfo;
                    const hasPdfs = item.pdfs?.length > 0;

                    return (
                      <UnifiedCard
                        key={item.id || `service-${index}`}
                        variant="default"
                        padding="none"
                        style={styles.serviceCard}
                      >
                        <TouchableOpacity
                          style={styles.cardHeader}
                          onPress={() => toggleExpand(item.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.cardHeaderLeft}>
                            <View style={[styles.serviceIconWrap, { backgroundColor: colors.primary + '12' }]}>
                              <Ionicons
                                name={getCategoryStyle(item.category).icon}
                                size={22}
                                color={colors.primary}
                              />
                            </View>
                            <View style={styles.cardHeaderText}>
                              <Text style={styles.serviceName} numberOfLines={2}>
                                {item.name}
                              </Text>
                              <View style={styles.cardMeta}>
                                {item.fee && (
                                  <View style={[styles.feeBadge, { backgroundColor: colors.success + '18' }]}>
                                    <Ionicons name="cash-outline" size={12} color={colors.success} />
                                    <Text style={[styles.feeText, { color: colors.success }]} numberOfLines={1}>
                                      {item.fee}
                                    </Text>
                                  </View>
                                )}
                                {item.description && (
                                  <Text style={styles.previewText} numberOfLines={1}>
                                    {item.description}
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={22}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>

                        {/* Quick Contact - visible without expanding when user is in a hurry */}
                        {hasContact && !isExpanded && (
                          <TouchableOpacity
                            style={[styles.quickContactRow, { borderTopColor: colors.border }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleContactPress(item.contactInfo);
                            }}
                          >
                            <Ionicons name="call-outline" size={18} color={colors.primary} />
                            <Text style={[styles.quickContactText, { color: colors.primary }]}>
                              Contact / Book
                            </Text>
                          </TouchableOpacity>
                        )}

                        {isExpanded && (
                          <View style={styles.expandedContent}>
                            <View style={[styles.expandedDivider, { backgroundColor: colors.border }]} />

                            {item.description && (
                              <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Description</Text>
                                <Text style={styles.detailText}>{item.description}</Text>
                              </View>
                            )}

                            {item.requirements?.length > 0 && (
                              <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Required Documents</Text>
                                {item.requirements.map((req, i) => (
                                  <View key={i} style={styles.bulletRow}>
                                    <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
                                    <Text style={styles.bulletText}>{req}</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {item.fee && (
                              <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Fee</Text>
                                <Text style={styles.detailText}>{item.fee}</Text>
                              </View>
                            )}

                            {item.ageRestriction && (
                              <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Age / Eligibility</Text>
                                <Text style={styles.detailText}>{item.ageRestriction}</Text>
                              </View>
                            )}

                            {hasPdfs && (
                              <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Application Forms</Text>
                                {item.pdfs.map((doc, docIndex) => {
                                  const isDocDownloading =
                                    isDownloading && currentDownloadId === doc.url;
                                  const docTitle =
                                    doc.title || doc.fileName || `Form ${docIndex + 1}`;

                                  return (
                                    <TouchableOpacity
                                      key={docIndex}
                                      style={[
                                        styles.documentRow,
                                        docIndex < item.pdfs.length - 1 && styles.documentRowBorder,
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
                              </View>
                            )}

                            {hasContact && (
                              <UnifiedButton
                                label="Contact / Book Appointment"
                                onPress={() => handleContactPress(item.contactInfo)}
                                variant="outline"
                                size="medium"
                                iconName="call-outline"
                                iconPosition="left"
                                fullWidth
                              />
                            )}

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
                      </UnifiedCard>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={loading && !refreshing} message="Loading services..." />
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
    serviceCard: {
      marginBottom: spacing.md,
      overflow: 'hidden',
      padding: 0,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      gap: spacing.md,
    },
    serviceIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardHeaderText: {
      flex: 1,
      minWidth: 0,
    },
    serviceName: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      lineHeight: 22,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    feeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 6,
      gap: 4,
      maxWidth: 140,
    },
    feeText: {
      ...typography.caption,
      fontSize: 12,
      fontWeight: '600',
    },
    previewText: {
      ...typography.caption,
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
    },
    quickContactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderTopWidth: 1,
      gap: spacing.sm,
    },
    quickContactText: {
      ...typography.body,
      fontWeight: '600',
      fontSize: 14,
    },
    expandedContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    expandedDivider: {
      height: 1,
      marginBottom: spacing.lg,
    },
    detailSection: {
      marginBottom: spacing.lg,
    },
    detailLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    detailText: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    bullet: {
      fontSize: 14,
      lineHeight: 22,
    },
    bulletText: {
      ...typography.body,
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
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
  });
}
