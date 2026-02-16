import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { LoadingOverlay, EmptyState, SearchInput } from '../components';
import { procurementOpeningRegisterService } from '../services/procurementService';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { spacing } from '../theme/spacing';

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
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

export default function OpeningRegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedItem, setExpandedItem] = useState(null);
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

  // Filter options for the second filter system
  const filters = ['All', 'Open', 'Closing Soon', 'Recent', 'High Value'];

  // Map filter names to filter logic
  const filterLogicMap = {
    'All': () => true,
    'Open': (item) => {
      const status = item.status?.toLowerCase() || '';
      return status === 'open' || status === 'active';
    },
    'Closing Soon': (item) => {
      const openingDate = new Date(item.bidOpeningDate);
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      return openingDate <= oneWeekFromNow && openingDate >= new Date();
    },
    'Recent': (item) => {
      const openingDate = new Date(item.bidOpeningDate);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return openingDate >= oneMonthAgo;
    },
    'High Value': (item) => {
      const desc = item.description?.toLowerCase() || '';
      return desc.includes('million') || desc.includes('high value') || desc.includes('major');
    },
  };

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

  const tabs = [
    {
      id: 'opportunities',
      label: 'Open Procurement Opportunities',
      count: procurementOpportunities.length,
    },
    {
      id: 'rfqs',
      label: 'RFQS',
      count: rfqs.length,
    },
  ];

  // Get base data based on active tab
  const baseData = activeTab === 'opportunities' ? procurementOpportunities : rfqs;
  
  // Apply search and filter chip filters
  const filteredData = baseData.filter((item) => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      item.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(item.bidOpeningDate).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter chip logic
    const filterLogic = filterLogicMap[selectedFilter];
    const matchesFilter = !filterLogic || filterLogic(item);
    
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleDownload = async (item) => {
    if (!item.noticeUrl) {
      Alert.alert('Error', 'No document available for download');
      return;
    }

    try {
      setCurrentDownloadId(item.id);
      resetDownload();
      await startDownload(item.noticeUrl, item.noticeFileName || item.reference);
      setCurrentDownloadId(null);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download document. Please try again.');
      setCurrentDownloadId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems(true);
  };

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
            placeholder="Search opening register..."
            value={searchQuery}
            onSearch={setSearchQuery}
            onChangeTextImmediate={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search opening register"
            accessibilityHint="Search by reference, description, or date"
          />
        </View>

        {/* Tab Filter Chips - First Filter System */}
        <View style={styles.filterSectionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeTab === 'opportunities' && styles.filterChipActive,
              ]}
              onPress={() => setActiveTab('opportunities')}
            >
              <Text style={[
                  styles.filterChipText,
                  activeTab === 'opportunities' && styles.filterChipTextActive,
                ]}
               numberOfLines={1}
               maxFontSizeMultiplier={1.3}>
                Opportunities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeTab === 'rfqs' && styles.filterChipActive,
              ]}
              onPress={() => setActiveTab('rfqs')}
            >
              <Text style={[
                  styles.filterChipText,
                  activeTab === 'rfqs' && styles.filterChipTextActive,
                ]}
               numberOfLines={1}
               maxFontSizeMultiplier={1.3}>
                RFQs
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Status Filter Chips - Second Filter System */}
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
              {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'} found
            </Text>
          </View>
        )}

        {/* Items List */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="document-text-outline"
              message={baseData.length === 0 ? 'No items available' : 'No items match your search'}
              accessibilityLabel="No items found"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredData.map((item, index) => {
              const isExpanded = expandedItem === item.id;
              const isItemDownloading = isDownloading && currentDownloadId === item.id;
              const statusColor = getStatusColor(item.status, colors);
              
              return (
                <TouchableOpacity 
                  key={item.id || `item-${index}`} 
                  style={styles.itemCard} 
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.itemHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                      <Text style={[styles.statusText, { color: statusColor }]} maxFontSizeMultiplier={1.3}>
                        {item.status || 'N/A'}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text style={styles.itemTitle} numberOfLines={2} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                    {item.reference}
                  </Text>
                  <View style={styles.itemDate}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={[styles.itemDateText, { color: colors.primary }]} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                      Opening: {formatDate(item.bidOpeningDate)}
                    </Text>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Description</Text>
                        <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>{item.description}</Text>
                      </View>

                      {item.noticeUrl && (
                        <TouchableOpacity
                          style={[
                            styles.downloadButton,
                            { backgroundColor: colors.primary },
                            isItemDownloading && styles.downloadButtonDisabled,
                          ]}
                          onPress={() => handleDownload(item)}
                          disabled={isItemDownloading}
                        >
                          {isItemDownloading ? (
                            <>
                              <UnifiedSkeletonLoader type="text-line" style={{ width: 16, height: 16, borderRadius: 8 }} />
                              <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                                Downloading {progress}%
                              </Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                              <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                                {item.noticeFileName || 'Download Notice'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                      {isItemDownloading && (
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
      <LoadingOverlay loading={loading} message="Loading opening register..." />
    </SafeAreaView>
  );
}

function getStyles(colors) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  
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
      maxWidth: 120,
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
    loadingContainer: {
      padding: spacing.xl,
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
    itemCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: spacing.xl,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    statusBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    itemDate: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.xs,
    },
    itemDateText: {
      fontSize: 14,
      fontWeight: '600',
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
      marginTop: spacing.md,
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
