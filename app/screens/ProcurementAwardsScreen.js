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
import { UnifiedSkeletonLoader, ErrorState, EmptyState, SearchInput } from '../components';
import { procurementAwardsService } from '../services/procurementService';
import { spacing } from '../theme/spacing';


export default function ProcurementAwardsScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedAward, setExpandedAward] = useState(null);
  const [awards, setAwards] = useState([]);
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

  // Filter options for the second filter system
  const filters = ['All', 'Recent', 'High Value', 'Construction', 'Services'];

  // Map filter names to filter logic
  const filterLogicMap = {
    'All': () => true,
    'Recent': (item) => {
      const awardDate = new Date(item.dateAwarded);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return awardDate >= threeMonthsAgo;
    },
    'High Value': (item) => {
      // Assume high value if description contains certain keywords
      const desc = item.description?.toLowerCase() || '';
      return desc.includes('million') || desc.includes('high value') || desc.includes('major');
    },
    'Construction': (item) => {
      const desc = item.description?.toLowerCase() || '';
      return desc.includes('construction') || desc.includes('building') || desc.includes('infrastructure');
    },
    'Services': (item) => {
      const desc = item.description?.toLowerCase() || '';
      return desc.includes('service') || desc.includes('consulting') || desc.includes('maintenance');
    },
  };

  const fetchAwards = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching awards with published: true...');
      const awards = await procurementAwardsService.getAwards({ published: true });
      console.log('Fetched awards count:', awards?.length || 0);
      console.log('Fetched awards:', JSON.stringify(awards, null, 2));
      
      // Log executive summary info for debugging
      if (awards && awards.length > 0) {
        awards.forEach(award => {
          console.log(`Award: ${award.procurementReference}, Published: ${award.published}, Type: ${award.type}`);
          if (award.executiveSummary) {
            console.log(`  - Has executive summary:`, {
              hasUrl: !!award.executiveSummary.url,
              url: award.executiveSummary.url,
              title: award.executiveSummary.title,
              fileName: award.executiveSummary.fileName,
            });
          } else {
            console.log(`  - NO executive summary`);
          }
        });
      } else {
        console.warn('No awards returned from API. Check if any awards are published in the admin dashboard.');
      }
      
      setAwards(awards || []);
    } catch (err) {
      console.error('Error fetching awards:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.message || 'Failed to load awards');
      if (isRefresh) {
        Alert.alert('Error', 'Failed to refresh awards. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  // Filter by active tab (opportunities vs rfqs)
  const tabFilteredData = awards.filter((item) => {
    if (activeTab === 'opportunities') {
      return item.type === 'opportunities' || !item.type;
    } else if (activeTab === 'rfqs') {
      return item.type === 'rfq';
    }
    return true;
  });
  
  // Apply search and filter chip filters
  const filteredData = tabFilteredData.filter((item) => {
    // Search filter
    const matchesSearch = !searchQuery.trim() || 
      item.procurementReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.successfulBidder?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(item.dateAwarded).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter chip logic
    const filterLogic = filterLogicMap[selectedFilter];
    const matchesFilter = !filterLogic || filterLogic(item);
    
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedAward(expandedAward === id ? null : id);
  };

  const handleDownload = async (item) => {
    if (!item.executiveSummary?.url) {
      Alert.alert('Error', 'No document available for download');
      return;
    }

    try {
      setCurrentDownloadId(item.id);
      resetDownload();
      await startDownload(item.executiveSummary.url, item.executiveSummary.fileName || item.executiveSummary.title);
      setCurrentDownloadId(null);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download document. Please try again.');
      setCurrentDownloadId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAwards(true);
  };

  const formatDate = (dateString) => {
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
        <ErrorState
          message={error}
          onRetry={() => fetchAwards()}
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
            placeholder="Search awards..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search procurement awards"
            accessibilityHint="Search by reference, description, or bidder"
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

        {/* Category Filter Chips - Second Filter System */}
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
              {filteredData.length} {filteredData.length === 1 ? 'award' : 'awards'} found
            </Text>
          </View>
        )}

        {/* Awards List */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="trophy-outline"
              message={awards.length === 0 ? 'No awards available' : 'No awards match your search'}
              accessibilityLabel="No awards found"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredData.map((item, index) => {
              const isExpanded = expandedAward === item.id;
              const isItemDownloading = isDownloading && currentDownloadId === item.id;
              return (
                <TouchableOpacity 
                  key={item.id || `award-${index}`} 
                  style={styles.awardCard} 
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.awardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.typeText, { color:'#fff'  }]} maxFontSizeMultiplier={1.3}>
                        {activeTab === 'opportunities' ? 'OPPORTUNITY' : 'RFQ'}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text style={styles.awardTitle} numberOfLines={2} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                    {item.procurementReference}
                  </Text>
                  <View style={styles.awardDetails}>
                    {item.successfulBidder && (
                      <View style={styles.detailItem}>
                        <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                          {item.successfulBidder}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.awardDate}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={[styles.awardDateText, { color: '#000' }]} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                      Awarded: {formatDate(item.dateAwarded)}
                    </Text>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Description</Text>
                        <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>{item.description}</Text>
                      </View>

                      {item.executiveSummary?.url && (
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
                              <UnifiedSkeletonLoader type="circle" width={16} height={16} />
                              <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                                Downloading {progress}%
                              </Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                              <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                                {item.executiveSummary?.title || item.executiveSummary?.fileName || 'Download Executive Summary'}
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
    emptyStateContainer: {
      padding: spacing.xl,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 0,
    },
    awardCard: {
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
    awardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    typeBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    typeText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    awardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    awardDetails: {
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
    awardDate: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.xs,
    },
    awardDateText: {
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

