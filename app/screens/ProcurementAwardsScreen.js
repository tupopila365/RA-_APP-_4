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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { LoadingSpinner, ErrorState, EmptyState, SearchInput, TabBar, DetailCard } from '../components';
import { procurementAwardsService } from '../services/procurementService';


export default function ProcurementAwardsScreen({ navigation: nav }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Tabs for different award types (these act as filters)
  const tabs = [
    {
      id: 'opportunities',
      label: 'Open Procurement Opportunities',
      count: awards.filter(item => item.type === 'opportunities' || !item.type).length,
    },
    {
      id: 'rfqs',
      label: 'Request for Quotations',
      count: awards.filter(item => item.type === 'rfq').length,
    },
  ];

  // Filter by active tab (opportunities vs rfqs)
  const tabFilteredData = awards.filter((item) => {
    if (activeTab === 'opportunities') {
      return item.type === 'opportunities' || !item.type;
    } else if (activeTab === 'rfqs') {
      return item.type === 'rfq';
    }
    return true;
  });
  
  // Apply search filter
  const filteredData = tabFilteredData.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesReference = item.procurementReference?.toLowerCase().includes(searchLower);
    const matchesDescription = item.description?.toLowerCase().includes(searchLower);
    const matchesBidder = item.successfulBidder?.toLowerCase().includes(searchLower);
    const matchesDate = formatDate(item.dateAwarded).toLowerCase().includes(searchLower);
    
    return matchesReference || matchesDescription || matchesBidder || matchesDate;
  });

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
        <LoadingSpinner message="Loading awards..." />
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
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="trophy-outline" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Awards</Text>
          <Text style={styles.headerSubtitle}>View awarded procurement contracts and successful bidders</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabBarContainer}>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            testID="procurement-awards-tabs"
          />
        </View>

        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <SearchInput
            placeholder={`Search ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'}...`}
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            testID="procurement-awards-search"
            accessibilityLabel={`Search ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'}`}
          />
        </View>

        {/* Results Count */}
        {filteredData.length > 0 && searchQuery.trim() && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount}>
              {filteredData.length} {filteredData.length === 1 ? 'award' : 'awards'} found
            </Text>
          </View>
        )}

        {/* Content */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : error && !refreshing ? (
          <View style={styles.errorContainer}>
            <ErrorState
              message={error}
              onRetry={() => fetchAwards()}
            />
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="trophy-outline"
              message={
                searchQuery.trim()
                  ? `No ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'} found matching "${searchQuery}"`
                  : `No ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'} available`
              }
              accessibilityLabel="No data available"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredData.map((item) => {
            const isItemDownloading = isDownloading && currentDownloadId === item.id;
            return (
              <DetailCard
                key={item.id}
                title={item.procurementReference}
                titleStyle={{ color: colors.primary, fontSize: 16, fontWeight: '700', fontFamily: 'monospace' }}
                metadata={[
                  {
                    icon: 'business-outline',
                    text: item.successfulBidder,
                    iconColor: colors.primary,
                    numberOfLines: 2,
                  },
                  {
                    icon: 'calendar-outline',
                    text: `Awarded: ${formatDate(item.dateAwarded)}`,
                    iconColor: colors.primary,
                  },
                ]}
                footer={
                  <View style={styles.footerContent}>
                    <Text style={styles.footerText}>{item.description}</Text>
                  </View>
                }
                downloadButton={!!item.executiveSummary?.url}
                downloadButtonText={item.executiveSummary?.title || item.executiveSummary?.fileName || 'Download Executive Summary'}
                downloadButtonDisabled={isItemDownloading}
                isDownloading={isItemDownloading}
                downloadProgress={progress}
                onDownloadPress={() => handleDownload(item)}
              />
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
      paddingBottom: 20,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      marginTop: 20,
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
      textAlign: 'center',
    },
    tabBarContainer: {
      paddingHorizontal: 0,
      paddingTop: 16,
      paddingBottom: 8,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      paddingTop: 8,
      paddingBottom: 8,
    },
    searchInput: {
      margin: 0,
    },
    resultsCountContainer: {
      paddingHorizontal: 0,
      paddingTop: 8,
      paddingBottom: 8,
    },
    resultsCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    loadingContainer: {
      padding: 20,
    },
    errorContainer: {
      padding: 20,
    },
    emptyStateContainer: {
      padding: 20,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 0,
    },
    footerContent: {
      flex: 1,
    },
    footerText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}

