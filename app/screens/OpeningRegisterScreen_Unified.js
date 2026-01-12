import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import unified design system components
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
import { useTheme } from '../hooks/useTheme';
import { procurementOpeningRegisterService } from '../services/procurementService';
import useDocumentDownload from '../hooks/useDocumentDownload';

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Get status color for badge
 */
function getStatusColor(status, colors) {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'open' || statusLower === 'active') {
    return colors.success;
  } else if (statusLower === 'closed') {
    return colors.textSecondary;
  }
  return colors.primary;
}

export default function OpeningRegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [procurementOpportunities, setProcurementOpportunities] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [error, setError] = useState(null);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);

  // Use the document download hook
  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadedUri,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  const styles = getStyles(colors, insets);

  const fetchItems = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      // Fetch both types
      const [opportunities, rfqItems] = await Promise.all([
        procurementOpeningRegisterService.getItemsByType('opportunities'),
        procurementOpeningRegisterService.getItemsByType('rfq'),
      ]);

      setProcurementOpportunities(opportunities || []);
      setRfqs(rfqItems || []);
    } catch (err) {
      console.error('Error fetching opening register items:', err);
      setError(err.message || 'Failed to load items');
      if (isRefresh) {
        Alert.alert('Error', 'Failed to refresh items. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Get base data based on active tab
  const baseData = activeTab === 'opportunities' ? procurementOpportunities : rfqs;
  
  // Apply search filter
  const filteredData = baseData.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesReference = item.reference?.toLowerCase().includes(searchLower);
    const matchesDescription = item.description?.toLowerCase().includes(searchLower);
    const matchesDate = formatDate(item.bidOpeningDate).toLowerCase().includes(searchLower);
    
    return matchesReference || matchesDescription || matchesDate;
  });

  const handleDownload = async (item) => {
    if (!item.noticeUrl) {
      Alert.alert('Document Unavailable', 'No document is available for download for this item.');
      return;
    }

    try {
      setCurrentDownloadId(item.id);
      resetDownload();
      await startDownload(item.noticeUrl, item.noticeFileName || item.reference);
      setCurrentDownloadId(null);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Download Error', 'Unable to download the document. Please check your connection and try again.');
      setCurrentDownloadId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems(true);
  };

  const handleRetry = () => {
    setError(null);
    fetchItems();
  };

  if (loading && baseData.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <GlobalHeader
          title="Opening Register"
          subtitle="Procurement opportunities and RFQs"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.loadingContainer}>
          <UnifiedSkeletonLoader type="list-item" count={5} />
          <Text style={styles.loadingText}>Loading procurement data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && baseData.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <GlobalHeader
          title="Opening Register"
          subtitle="Procurement opportunities and RFQs"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Unable to Load Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <UnifiedButton
            label="Try Again"
            onPress={handleRetry}
            variant="primary"
            size="medium"
            iconName="refresh"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <GlobalHeader
        title="Opening Register"
        subtitle={`${procurementOpportunities.length + rfqs.length} items available`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

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
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Selection */}
        <UnifiedCard variant="flat" padding="medium" style={styles.tabCard}>
          <Text style={styles.tabLabel}>Category</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'opportunities' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('opportunities')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="briefcase-outline" 
                size={20} 
                color={activeTab === 'opportunities' ? colors.primary : colors.textSecondary} 
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'opportunities' && styles.tabTextActive,
                ]}
              >
                Procurement Opportunities
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{procurementOpportunities.length}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'rfqs' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('rfqs')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'rfqs' ? colors.primary : colors.textSecondary} 
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'rfqs' && styles.tabTextActive,
                ]}
              >
                Request for Quotations
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{rfqs.length}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </UnifiedCard>

        {/* Search */}
        {baseData.length > 0 && (
          <UnifiedCard variant="flat" padding="medium" style={styles.searchCard}>
            <UnifiedFormInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQs'}...`}
              label="Search"
              leftIcon="search-outline"
              clearButtonMode="while-editing"
            />
          </UnifiedCard>
        )}

        {/* Results Count */}
        {filteredData.length > 0 && searchQuery.trim() && (
          <UnifiedCard variant="outlined" padding="small" style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Ionicons name="funnel-outline" size={16} color={colors.primary} />
              <Text style={styles.resultsCount}>
                {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'} found
              </Text>
            </View>
            <UnifiedButton
              label="Clear Search"
              variant="ghost"
              size="small"
              iconName="close"
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            />
          </UnifiedCard>
        )}

        {/* Content */}
        {filteredData.length === 0 ? (
          <UnifiedCard variant="default" padding="large" style={styles.emptyStateCard}>
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <Ionicons 
                  name={searchQuery.trim() ? "search-outline" : "document-text-outline"} 
                  size={48} 
                  color={colors.textSecondary} 
                />
              </View>
              <Text style={styles.emptyStateTitle}>
                {searchQuery.trim() ? 'No Results Found' : 'No Items Available'}
              </Text>
              <Text style={styles.emptyStateMessage}>
                {searchQuery.trim()
                  ? `No ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQs'} match your search criteria. Try different keywords or clear your search.`
                  : `No ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQs'} are currently available. Check back later for new postings.`}
              </Text>
              {searchQuery.trim() && (
                <UnifiedButton
                  label="Clear Search"
                  variant="outline"
                  size="medium"
                  iconName="refresh"
                  onPress={() => setSearchQuery('')}
                  style={styles.emptyStateButton}
                />
              )}
            </View>
          </UnifiedCard>
        ) : (
          <View style={styles.itemsContainer}>
            {filteredData.map((item) => {
              const statusColor = getStatusColor(item.status, colors);
              const isItemDownloading = isDownloading && currentDownloadId === item.id;
              
              return (
                <UnifiedCard 
                  key={item.id} 
                  variant="default" 
                  padding="large" 
                  style={styles.itemCard}
                >
                  {/* Status Badge */}
                  <View style={styles.itemHeader}>
                    <View
                      style={[
                        styles.statusBadge,
                        { 
                          backgroundColor: statusColor + '15',
                          borderColor: statusColor + '40',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: statusColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColor },
                        ]}
                      >
                        {item.status || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Reference Number */}
                  <Text style={styles.referenceNumber}>{item.reference}</Text>

                  {/* Opening Date */}
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={styles.dateLabel}>Opening Date:</Text>
                    <Text style={styles.dateValue}>{formatDate(item.bidOpeningDate)}</Text>
                  </View>

                  {/* Description */}
                  {item.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionLabel}>Description</Text>
                      <Text style={styles.descriptionText}>{item.description}</Text>
                    </View>
                  )}

                  {/* Download Button */}
                  {item.noticeUrl && (
                    <View style={styles.downloadContainer}>
                      <UnifiedButton
                        label={isItemDownloading ? `Downloading... ${Math.round(progress)}%` : (item.noticeFileName || 'Download Notice')}
                        onPress={() => handleDownload(item)}
                        variant="outline"
                        size="medium"
                        iconName={isItemDownloading ? "download" : "document-outline"}
                        loading={isItemDownloading}
                        disabled={isItemDownloading}
                        fullWidth
                      />
                    </View>
                  )}
                </UnifiedCard>
              );
            })}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors, insets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.xl,
      paddingBottom: spacing.xxl + (insets?.bottom || 0),
    },

    // Loading State
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },

    // Error State
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorTitle: {
      ...typography.h3,
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    errorText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },

    // Tab Selection
    tabCard: {
      marginBottom: spacing.lg,
    },
    tabLabel: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    tabContainer: {
      gap: spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    tabActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    tabText: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    tabBadge: {
      backgroundColor: colors.textSecondary + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      minWidth: 24,
      alignItems: 'center',
    },
    tabBadgeText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
    },

    // Search
    searchCard: {
      marginBottom: spacing.lg,
    },

    // Results
    resultsCard: {
      marginBottom: spacing.lg,
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    resultsCount: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
    },
    clearSearchButton: {
      alignSelf: 'flex-start',
      marginTop: spacing.sm,
    },

    // Empty State
    emptyStateCard: {
      marginTop: spacing.xl,
    },
    emptyStateContainer: {
      alignItems: 'center',
    },
    emptyStateIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    emptyStateTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    emptyStateMessage: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.xl,
    },
    emptyStateButton: {
      alignSelf: 'center',
    },

    // Items List
    itemsContainer: {
      gap: spacing.lg,
    },
    itemCard: {
      overflow: 'hidden',
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: spacing.md,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 16,
      borderWidth: 1,
      gap: spacing.xs,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      ...typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    referenceNumber: {
      ...typography.h4,
      color: colors.primary,
      fontWeight: '700',
      fontFamily: 'monospace',
      marginBottom: spacing.md,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    dateLabel: {
      ...typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
    },
    dateValue: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      flex: 1,
    },
    descriptionContainer: {
      marginBottom: spacing.lg,
    },
    descriptionLabel: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    descriptionText: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    downloadContainer: {
      marginTop: spacing.md,
    },
  });
}