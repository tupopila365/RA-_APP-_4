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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { EmptyState, LoadingSpinner, TabBar, DetailCard, Badge, SearchInput } from '../components';
import { procurementOpeningRegisterService } from '../services/procurementService';
import useDocumentDownload from '../hooks/useDocumentDownload';

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
  
  // Generate suggestions from the data
  const suggestions = useMemo(() => {
    const uniqueSuggestions = new Set();
    
    baseData.forEach((item) => {
      // Add reference numbers
      if (item.reference) {
        uniqueSuggestions.add(item.reference);
      }
      
      // Add key words from descriptions (split and add meaningful words)
      if (item.description) {
        const words = item.description
          .split(/[\s,.-]+/)
          .filter(word => word.length > 3) // Only words longer than 3 chars
          .slice(0, 3); // Take first 3 meaningful words
        
        words.forEach(word => uniqueSuggestions.add(word));
        
        // Also add the full description
        uniqueSuggestions.add(item.description);
      }
    });
    
    return Array.from(uniqueSuggestions).sort();
  }, [baseData]);
  
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
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="list-outline" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Opening Register</Text>
          <Text style={styles.headerSubtitle}>Track procurement opportunities and RFQ openings</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabBarContainer}>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            testID="opening-register-tabs"
          />
        </View>

        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <SearchInput
            placeholder={`Search ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'}...`}
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            suggestions={suggestions}
            showSuggestions={true}
            onSuggestionSelect={setSearchQuery}
            maxSuggestions={7}
            style={styles.searchInput}
            testID="opening-register-search"
            accessibilityLabel={`Search ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'}`}
            accessibilityHint="Type to search and see suggestions"
          />
        </View>

        {/* Results Count */}
        {filteredData.length > 0 && searchQuery.trim() && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount}>
              {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'} found
            </Text>
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="document-text-outline"
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
            const statusColor = getStatusColor(item.status, colors);
            const isItemDownloading = isDownloading && currentDownloadId === item.id;
            
            return (
              <DetailCard
                key={item.id}
                badgeLabel={item.status || 'N/A'}
                badgeColor={statusColor}
                badgeBackgroundColor={statusColor + '20'}
                title={item.reference}
                titleStyle={{ color: colors.primary, fontSize: 16, fontWeight: '700', fontFamily: 'monospace' }}
                metadata={[
                  {
                    icon: 'calendar-outline',
                    text: `Opening: ${formatDate(item.bidOpeningDate)}`,
                    iconColor: colors.primary,
                  },
                ]}
                footer={
                  <View style={styles.footerContent}>
                    <Text style={styles.footerText}>{item.description}</Text>
                  </View>
                }
                downloadButton={!!item.noticeUrl}
                downloadButtonText={item.noticeFileName || 'Download Notice'}
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
