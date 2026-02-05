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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { RATheme } from '../theme/colors';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { UnifiedSkeletonLoader, ErrorState, EmptyState, SearchInput } from '../components';
import { raServicesService } from '../services/raServicesService';
import { spacing } from '../theme/spacing';

const FILTERS = ['All', 'Licensing', 'Vehicle Registration', 'Permits & Authorisations', 'Other'];

export default function RAServicesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

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

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <UnifiedSkeletonLoader type="list-item" count={5} />
      </View>
    );
  }

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
                <TouchableOpacity
                  key={item.id || `service-${index}`}
                  style={styles.serviceCard}
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.serviceHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.categoryText, { color: '#fff' }]} maxFontSizeMultiplier={1.3}>
                        {item.category}
                      </Text>
                    </View>
                    {item.fee ? (
                      <Text style={styles.feeBadge} maxFontSizeMultiplier={1.3}>
                        {item.fee}
                      </Text>
                    ) : null}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    style={styles.serviceTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    maxFontSizeMultiplier={1.3}
                  >
                    {item.name}
                  </Text>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />

                      {item.description ? (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                            Description
                          </Text>
                          <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>
                            {item.description}
                          </Text>
                        </View>
                      ) : null}

                      {item.requirements && item.requirements.length > 0 ? (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                            Required Documents
                          </Text>
                          {item.requirements.map((req, reqIndex) => (
                            <View key={reqIndex} style={styles.requirementItem}>
                              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                              <Text style={styles.requirementText} maxFontSizeMultiplier={1.3}>
                                {req}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}

                      {item.fee ? (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                            Fee
                          </Text>
                          <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>
                            {item.fee}
                          </Text>
                        </View>
                      ) : null}

                      {item.ageRestriction ? (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                            Age / Eligibility
                          </Text>
                          <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>
                            {item.ageRestriction}
                          </Text>
                        </View>
                      ) : null}

                      {item.pdfs && item.pdfs.length > 0 ? (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>
                            Application Forms
                          </Text>
                          {item.pdfs.map((doc, docIndex) => {
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
                                    <Text
                                      style={styles.downloadButtonText}
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                      maxFontSizeMultiplier={1.3}
                                    >
                                      Downloading {progress}%
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                    <Text
                                      style={styles.downloadButtonText}
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                      maxFontSizeMultiplier={1.3}
                                    >
                                      {doc.title || doc.fileName || `Application Form ${docIndex + 1}`}
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : null}

                      {item.contactInfo ? (
                        <View style={styles.section}>
                          <TouchableOpacity
                            style={[styles.contactButton, { borderColor: colors.primary }]}
                            onPress={() => handleContactPress(item.contactInfo)}
                          >
                            <Ionicons name="call-outline" size={20} color={colors.primary} />
                            <Text
                              style={[styles.contactButtonText, { color: colors.primary }]}
                              maxFontSizeMultiplier={1.3}
                            >
                              Contact / Book Appointment
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}

                      {isDownloading && currentDownloadId && (
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${progress}%`, backgroundColor: colors.primary },
                            ]}
                          />
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
    serviceCard: {
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
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      flexWrap: 'wrap',
      gap: spacing.sm,
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
    feeBadge: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    serviceTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
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
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    requirementText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
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
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 8,
      borderWidth: 2,
      gap: spacing.sm,
    },
    contactButtonText: {
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
