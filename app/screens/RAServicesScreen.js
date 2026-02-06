import { useState, useEffect, useCallback } from 'react';
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
import useDocumentDownload from '../hooks/useDocumentDownload';
import { LoadingOverlay, ErrorState, EmptyState, SearchInput } from '../components';
import { raServicesService } from '../services/raServicesService';

// Import Unified Design System Components
import {
  UnifiedCard,
  UnifiedButton,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

const FILTERS = ['All', 'Licensing', 'Vehicle Registration', 'Permits & Authorisations', 'Other'];

export default function RAServicesScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
      if (!isRefresh) {
        setLoading(true);
      }
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

  const filteredData = services.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || item.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedService(expandedService === id ? null : id);
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
      setCurrentDownloadId(null);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download document. Please try again.');
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

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={() => fetchServices()} />
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
        <View style={styles.searchInputContainer}>
          <SearchInput
            placeholder="Search services..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search RA services"
            accessibilityHint="Search by name, description or category"
          />
        </View>

        <View style={styles.filterSectionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {FILTERS.map((filter, index) => (
              <TouchableOpacity
                key={filter || `filter-${index}`}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive,
                  ]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredData.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount} maxFontSizeMultiplier={1.3}>
              {filteredData.length} {filteredData.length === 1 ? 'service' : 'services'} found
            </Text>
          </View>
        )}

        {filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="construct-outline"
              message={
                services.length === 0 ? 'No RA services available' : 'No services match your search'
              }
              accessibilityLabel="No services found"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredData.map((item, index) => {
              const isExpanded = expandedService === item.id;
              return (
                <UnifiedCard 
                  key={item.id || `service-${index}`}
                  variant="elevated"
                  padding="large"
                  style={styles.serviceCard}
                >
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(item.id)}
                  >
                    <View style={styles.serviceHeader}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText} maxFontSizeMultiplier={1.3}>
                          {item.category}
                        </Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={24} 
                        color={colors.primary} 
                      />
                    </View>
                    
                    <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.sm }]} maxFontSizeMultiplier={1.3}>
                      {item.name}
                    </Text>
                    
                    {item.fee && (
                      <View style={styles.feeContainer}>
                        <Ionicons name="cash-outline" size={16} color={colors.primary} />
                        <Text style={[typography.bodySmall, { color: colors.primary, marginLeft: spacing.xs }]} maxFontSizeMultiplier={1.3}>
                          {item.fee}
                        </Text>
                      </View>
                    )}

                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {item.description && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]} maxFontSizeMultiplier={1.3}>
                            Description
                          </Text>
                          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]} maxFontSizeMultiplier={1.3}>
                            {item.description}
                          </Text>
                        </View>
                      )}

                      {item.requirements && item.requirements.length > 0 && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]} maxFontSizeMultiplier={1.3}>
                            Required Documents
                          </Text>
                          {item.requirements.map((req, reqIndex) => (
                            <View key={reqIndex} style={styles.requirementItem}>
                              <Text style={[typography.body, { color: colors.primary }]}>•</Text>
                              <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]} maxFontSizeMultiplier={1.3}>
                                {req}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {item.fee && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]} maxFontSizeMultiplier={1.3}>
                            Fee
                          </Text>
                          <Text style={[typography.body, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
                            {item.fee}
                          </Text>
                        </View>
                      )}

                      {item.ageRestriction && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]} maxFontSizeMultiplier={1.3}>
                            Age / Eligibility
                          </Text>
                          <Text style={[typography.body, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
                            {item.ageRestriction}
                          </Text>
                        </View>
                      )}

                      {item.pdfs && item.pdfs.length > 0 && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.sm }]} maxFontSizeMultiplier={1.3}>
                            Application Forms
                          </Text>
                          {item.pdfs.map((doc, docIndex) => {
                            const isDocDownloading = isDownloading && currentDownloadId === doc.url;
                            return (
                              <UnifiedButton
                                key={docIndex}
                                label={isDocDownloading ? `Downloading ${progress}%` : (doc.title || doc.fileName || `Application Form ${docIndex + 1}`)}
                                onPress={() => handleDownload(doc, item.name)}
                                variant="primary"
                                size="small"
                                iconName={isDocDownloading ? "hourglass-outline" : "download-outline"}
                                iconPosition="left"
                                loading={isDocDownloading}
                                disabled={isDocDownloading}
                                fullWidth
                                style={{ marginBottom: spacing.sm }}
                              />
                            );
                          })}
                        </View>
                      )}

                      {item.contactInfo && (
                        <View style={styles.section}>
                          <UnifiedButton
                            label="Contact / Book Appointment"
                            onPress={() => handleContactPress(item.contactInfo)}
                            variant="outline"
                            size="small"
                            iconName="call-outline"
                            iconPosition="left"
                            fullWidth
                          />
                        </View>
                      )}

                    </View>
                  )}
                </UnifiedCard>
              );
            })}
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={loading && !refreshing} message="Loading services..." />
    </SafeAreaView>
  );
}

function getStyles(colors, isDark) {
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
    serviceCard: {
      marginBottom: spacing.md,
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      backgroundColor: colors.primary + '20',
    },
    categoryText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    feeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    expandedContent: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.lg,
    },
    section: {
      gap: spacing.sm,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
  });
}
