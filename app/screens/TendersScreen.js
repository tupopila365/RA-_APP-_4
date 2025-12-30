import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { tendersService } from '../services/tendersService';
import { documentDownloadService } from '../services/documentDownloadService';
import { useDebounce } from '../hooks/useDebounce';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { LoadingSpinner, ErrorState, EmptyState, Badge, Card, FilterBar } from '../components';

export default function TendersScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  
  // Use the document download hook
  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadedUri,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
    { label: 'Upcoming', value: 'upcoming' },
  ];

  const fetchTenders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {};
      
      // Add status filter if not 'all'
      if (selectedFilter !== 'all') {
        params.status = selectedFilter;
      }
      
      // Add search query if present
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response = await tendersService.getTenders(params);
      // Ensure data is always an array
      const data = response.data || response;
      setTenders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError(err.message || 'Failed to load tenders');
      setTenders([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, debouncedSearch]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const onRefresh = useCallback(() => {
    fetchTenders(true);
  }, [fetchTenders]);

  /**
   * Get a user-friendly error title based on the error message
   */
  const getErrorTitle = (errorMessage) => {
    if (!errorMessage) return 'Download Failed';
    
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return 'Network Error';
    } else if (errorLower.includes('invalid') || errorLower.includes('inaccessible') || errorLower.includes('404') || errorLower.includes('not found') || errorLower.includes('could not be found')) {
      return 'Invalid Document';
    } else if (errorLower.includes('storage') || errorLower.includes('space')) {
      return 'Storage Full';
    } else if (errorLower.includes('permission')) {
      return 'Permission Denied';
    } else {
      return 'Download Failed';
    }
  };

  /**
   * Get additional help text based on error type
   */
  const getErrorHelpText = (errorMessage) => {
    if (!errorMessage) return '';
    
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return '\n\nPlease check your internet connection and try again.';
    } else if (errorLower.includes('invalid') || errorLower.includes('inaccessible')) {
      return '\n\nThe document link may be broken or expired.';
    } else if (errorLower.includes('storage') || errorLower.includes('space')) {
      return '\n\nPlease free up some storage space on your device.';
    } else if (errorLower.includes('permission')) {
      return '\n\nPlease check app permissions in your device settings.';
    } else {
      return '\n\nPlease try again or contact support if the problem persists.';
    }
  };

  const handleDownload = async (tender) => {
    // Validate PDF URL exists
    if (!tender.pdfUrl) {
      Alert.alert('Error', 'No PDF document available for this tender');
      return;
    }

    // Validate PDF URL is not empty or invalid
    if (typeof tender.pdfUrl !== 'string' || tender.pdfUrl.trim() === '') {
      Alert.alert('Invalid PDF', 'The PDF URL for this tender is invalid.');
      return;
    }

    // Prevent multiple simultaneous downloads
    if (isDownloading) {
      return;
    }

    // Set the current download ID
    setCurrentDownloadId(tender._id);

    // Start the download
    const result = await startDownload(tender.pdfUrl, tender.title || tender.referenceNumber || 'tender');

    if (result.success) {
      // Show success alert with Open and Share options
      Alert.alert(
        'Download Complete',
        'The document has been downloaded successfully.',
        [
          {
            text: 'Open',
            onPress: async () => {
              const openResult = await documentDownloadService.openFile(result.uri);
              if (!openResult.success) {
                Alert.alert('Error', openResult.error || 'Failed to open file');
              }
              resetDownload();
              setCurrentDownloadId(null);
            },
          },
          {
            text: 'Share',
            onPress: async () => {
              const filename = documentDownloadService.generateSafeFilename(
                tender.title || tender.referenceNumber || 'tender',
                'pdf'
              );
              const shareResult = await documentDownloadService.shareFile(result.uri, filename);
              if (!shareResult.success) {
                Alert.alert('Error', shareResult.error || 'Failed to share file');
              }
              resetDownload();
              setCurrentDownloadId(null);
            },
          },
          {
            text: 'Done',
            style: 'cancel',
            onPress: () => {
              resetDownload();
              setCurrentDownloadId(null);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // Clean up partial downloads (already handled by service, but ensure state is reset)
      resetDownload();
      
      // Show specific error alert based on error type
      const errorMessage = result.error || 'Download failed. Please try again.';
      const errorTitle = getErrorTitle(errorMessage);
      const helpText = getErrorHelpText(errorMessage);
      const fullMessage = errorMessage + helpText;
      
      Alert.alert(
        errorTitle,
        fullMessage,
        [
          {
            text: 'Retry',
            onPress: () => {
              setCurrentDownloadId(null);
              // Retry the download
              setTimeout(() => handleDownload(tender), 100);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setCurrentDownloadId(null);
            },
          },
        ]
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatValue = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'number') {
      return `N$ ${value.toLocaleString()}`;
    }
    return value;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'open':
        return colors.success;
      case 'closed':
        return colors.textSecondary;
      case 'upcoming':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const styles = getStyles(colors);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ErrorState
          message={error}
          onRetry={fetchTenders}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Search and Filters */}
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tenders..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <FilterBar
          filters={filters}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          testID="tenders-filter-bar"
          accessibilityLabel="Tender status filters"
        />
      </View>

      {/* Tenders List */}
      <ScrollView
        style={styles.contentScrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {tenders.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            message={searchQuery || selectedFilter !== 'all' ? 'No tenders found matching your criteria' : 'No tenders available'}
          />
        ) : (
          tenders.map((tender) => {
            const isTenderDownloading = isDownloading && currentDownloadId === tender._id;
            const statusColor = getStatusColor(tender.status);
            return (
              <Card key={tender._id} style={styles.tenderCard}>
                <View style={styles.tenderHeader}>
                  <Badge
                    label={getStatusLabel(tender.status)}
                    backgroundColor={statusColor + '20'}
                    textColor={statusColor}
                    size="small"
                  />
                  {tender.category && (
                    <Badge label={tender.category} variant="info" size="small" />
                  )}
                </View>
                <Text style={styles.tenderTitle} numberOfLines={2} ellipsizeMode="tail">
                  {tender.title}
                </Text>
                {tender.referenceNumber && (
                  <Text style={styles.tenderReference} numberOfLines={1} ellipsizeMode="tail">
                    Ref: {tender.referenceNumber}
                  </Text>
                )}
                <View style={styles.tenderDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                      Closing: {formatDate(tender.closingDate)}
                    </Text>
                  </View>
                  {tender.value && (
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                        Value: {formatValue(tender.value)}
                      </Text>
                    </View>
                  )}
                </View>
                {tender.pdfUrl && typeof tender.pdfUrl === 'string' && tender.pdfUrl.trim() !== '' && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.downloadButton,
                        { backgroundColor: colors.primary },
                        isTenderDownloading && styles.downloadButtonDisabled,
                      ]}
                      onPress={() => handleDownload(tender)}
                      disabled={isTenderDownloading}
                    >
                      {isTenderDownloading ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">
                            Downloading {progress}%
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">
                            Download Document
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                    {isTenderDownloading && (
                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.primary }]} />
                      </View>
                    )}
                  </>
                )}
              </Card>
            );
          })
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
    header: {
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 15,
      marginBottom: 10,
      borderRadius: 25,
      paddingHorizontal: 15,
      height: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    contentScrollView: {
      flex: 1,
    },
    content: {
      padding: 15,
      paddingBottom: 25,
    },
    tenderCard: {
      minHeight: 180,
    },
    tenderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    },
    tenderTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    tenderReference: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    tenderDetails: {
      marginBottom: 15,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      flex: 1,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
    },
    downloadButtonDisabled: {
      opacity: 0.7,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
    },
  });
}

