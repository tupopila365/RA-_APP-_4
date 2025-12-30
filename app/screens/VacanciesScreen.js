import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { vacanciesService } from '../services/vacanciesService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { LoadingSpinner, ErrorState, FilterBar, EmptyState } from '../components';

export default function VacanciesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedVacancy, setExpandedVacancy] = useState(null);
  const [vacancies, setVacancies] = useState([]);
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

  const filters = ['All', 'Full-time', 'Part-time', 'Bursaries', 'Internships'];

  // Map filter names to API type values
  const filterTypeMap = {
    'All': null,
    'Full-time': 'full-time',
    'Part-time': 'part-time',
    'Bursaries': 'bursary',
    'Internships': 'internship',
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vacanciesService.getVacancies();
      // Ensure data is always an array
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vacancies:', err);
      setError('Failed to load vacancies. Please try again.');
      setVacancies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVacancies();
    setRefreshing(false);
  };

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vacancy.department && vacancy.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vacancy.location && vacancy.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const filterType = filterTypeMap[selectedFilter];
    const matchesFilter = !filterType || vacancy.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedVacancy(expandedVacancy === id ? null : id);
  };

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

  const handleDownload = async (vacancy) => {
    // Validate PDF URL exists
    if (!vacancy.pdfUrl) {
      Alert.alert('No PDF Available', 'This vacancy does not have an application form attached.');
      return;
    }

    // Validate PDF URL is not empty or invalid
    if (typeof vacancy.pdfUrl !== 'string' || vacancy.pdfUrl.trim() === '') {
      Alert.alert('Invalid PDF', 'The PDF URL for this vacancy is invalid.');
      return;
    }

    // Prevent multiple simultaneous downloads
    if (isDownloading) {
      return;
    }

    // Set the current download ID
    setCurrentDownloadId(vacancy._id);

    // Start the download
    const result = await startDownload(vacancy.pdfUrl, vacancy.title || 'vacancy');

    if (result.success) {
      // Show success alert with Open and Share options
      Alert.alert(
        'Download Complete',
        'The application form has been downloaded successfully.',
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
                vacancy.title || 'vacancy',
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
              setTimeout(() => handleDownload(vacancy), 100);
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
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatType = (type) => {
    const typeMap = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'bursary': 'Bursaries',
      'internship': 'Internships',
    };
    return typeMap[type] || type;
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
        <ErrorState message={error} onRetry={fetchVacancies} />
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
            placeholder="Search vacancies..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <FilterBar
          filters={filters}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          testID="vacancies-filter-bar"
          accessibilityLabel="Vacancy type filters"
        />
      </View>

      {/* Vacancies List */}
      <ScrollView 
        style={styles.contentScrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredVacancies.length === 0 ? (
          <EmptyState
            icon="briefcase-outline"
            message={vacancies.length === 0 ? 'No vacancies available' : 'No vacancies match your search'}
            accessibilityLabel="No vacancies found"
          />
        ) : 
          filteredVacancies.map((vacancy) => {
            const isExpanded = expandedVacancy === vacancy._id;
            const isVacancyDownloading = isDownloading && currentDownloadId === vacancy._id;
            return (
              <TouchableOpacity 
                key={vacancy._id} 
                style={styles.vacancyCard} 
                activeOpacity={0.7}
                onPress={() => toggleExpand(vacancy._id)}
              >
                <View style={styles.vacancyHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.typeText, { color: colors.secondary }]}>
                      {formatType(vacancy.type)}
                    </Text>
                  </View>
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <Text style={styles.vacancyTitle} numberOfLines={2} ellipsizeMode="tail">{vacancy.title}</Text>
                <View style={styles.vacancyDetails}>
                  {vacancy.department && (
                    <View style={styles.detailItem}>
                      <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{vacancy.department}</Text>
                    </View>
                  )}
                  {vacancy.location && (
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{vacancy.location}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.closingDate}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.closingDateText, { color: colors.primary }]} numberOfLines={1} ellipsizeMode="tail">
                    Closes: {formatDate(vacancy.closingDate)}
                  </Text>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    
                    {vacancy.salary && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Salary</Text>
                        <Text style={styles.sectionText}>{vacancy.salary}</Text>
                      </View>
                    )}

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.sectionText}>{vacancy.description}</Text>
                    </View>

                    {vacancy.requirements && vacancy.requirements.length > 0 && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {vacancy.requirements.map((req, index) => (
                          <View key={`req-${vacancy._id}-${index}`} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{req}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Responsibilities</Text>
                        {vacancy.responsibilities.map((resp, index) => (
                          <View key={`resp-${vacancy._id}-${index}`} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{resp}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {vacancy.pdfUrl && typeof vacancy.pdfUrl === 'string' && vacancy.pdfUrl.trim() !== '' && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.downloadButton,
                            { backgroundColor: colors.primary },
                            isVacancyDownloading && styles.downloadButtonDisabled,
                          ]}
                          onPress={() => handleDownload(vacancy)}
                          disabled={isVacancyDownloading}
                        >
                          {isVacancyDownloading ? (
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
                                Download Application Form
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        {isVacancyDownloading && (
                          <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.primary }]} />
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        }
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
      paddingTop: 15,
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
    vacancyCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 140,
    },
    vacancyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    typeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    vacancyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    vacancyDetails: {
      flexDirection: 'row',
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
      marginBottom: 5,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 5,
    },
    closingDate: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    closingDateText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
    },
    expandedContent: {
      marginTop: 15,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 15,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingRight: 10,
    },
    bullet: {
      fontSize: 14,
      color: colors.primary,
      marginRight: 8,
      fontWeight: 'bold',
    },
    listText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginTop: 10,
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

