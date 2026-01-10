import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { vacanciesService } from '../services/vacanciesService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { LoadingSpinner, ErrorState, EmptyState, SearchInput } from '../components';

export default function VacanciesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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
        'The application form has been downloaded successfully. Choose an option below:',
        [
          {
            text: 'Open PDF',
            onPress: async () => {
              console.log('User chose to open PDF:', result.uri);
              
              // Show a brief loading state
              Alert.alert(
                'Opening PDF...',
                'Please wait while we open your document.',
                [],
                { cancelable: false }
              );
              
              // Small delay to show the loading message
              setTimeout(async () => {
                const openResult = await documentDownloadService.openFile(result.uri);
                
                if (!openResult.success) {
                  Alert.alert(
                    'Cannot Open PDF', 
                    `${openResult.error || 'Failed to open file'}\n\nYou can try sharing the file instead to open it with another app.`,
                    [
                      {
                        text: 'Share Instead',
                        onPress: async () => {
                          const filename = documentDownloadService.generateSafeFilename(
                            vacancy.title || 'vacancy',
                            'pdf'
                          );
                          const shareResult = await documentDownloadService.shareFile(result.uri, filename);
                          if (!shareResult.success) {
                            Alert.alert('Error', shareResult.error || 'Failed to share file');
                          }
                        },
                      },
                      {
                        text: 'OK',
                        style: 'cancel',
                      },
                    ]
                  );
                } else {
                  console.log('PDF opened successfully');
                }
                
                resetDownload();
                setCurrentDownloadId(null);
              }, 500);
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
            placeholder="Search vacancies..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search vacancies"
            accessibilityHint="Search by title, department, or location"
          />
        </View>

        {/* Type Filter Chips - matching Road Status design */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'All' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter('All')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === 'All' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {filters.filter(f => f !== 'All').map((filter, index) => (
            <TouchableOpacity
              key={filter || `filter-${index}`}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(selectedFilter === filter ? 'All' : filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Count */}
        {filteredVacancies.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount}>
              {filteredVacancies.length} {filteredVacancies.length === 1 ? 'vacancy' : 'vacancies'} found
            </Text>
          </View>
        )}

        {/* Vacancies List */}
        {filteredVacancies.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="briefcase-outline"
              message={vacancies.length === 0 ? 'No vacancies available' : 'No vacancies match your search'}
              accessibilityLabel="No vacancies found"
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredVacancies.map((vacancy, index) => {
              const isExpanded = expandedVacancy === vacancy._id;
              const isVacancyDownloading = isDownloading && currentDownloadId === vacancy._id;
              return (
                <TouchableOpacity 
                  key={vacancy._id || `vacancy-${index}`} 
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
                          <View key={`req-${vacancy._id || 'unknown'}-${index}`} style={styles.listItem}>
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
                          <View key={`resp-${vacancy._id || 'unknown'}-${index}`} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listText}>{resp}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Contact Information & Application Submission */}
                    {(vacancy.contactName || vacancy.contactEmail || vacancy.contactTelephone || 
                      vacancy.submissionEmail || vacancy.submissionLink || vacancy.submissionInstructions) && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>How to Apply</Text>
                        
                        {/* Contact Information */}
                        {(vacancy.contactName || vacancy.contactEmail || vacancy.contactTelephone) && (
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Contact Information:</Text>
                            {vacancy.contactName && (
                              <View style={styles.contactItem}>
                                <Ionicons name="person-outline" size={16} color={colors.primary} />
                                <Text style={styles.contactText}>{vacancy.contactName}</Text>
                              </View>
                            )}
                            {vacancy.contactEmail && (
                              <TouchableOpacity 
                                style={styles.contactItem}
                                onPress={() => Linking.openURL(`mailto:${vacancy.contactEmail}`)}
                              >
                                <Ionicons name="mail-outline" size={16} color={colors.primary} />
                                <Text style={[styles.contactText, styles.contactLink]}>{vacancy.contactEmail}</Text>
                              </TouchableOpacity>
                            )}
                            {vacancy.contactTelephone && (
                              <TouchableOpacity 
                                style={styles.contactItem}
                                onPress={() => Linking.openURL(`tel:${vacancy.contactTelephone}`)}
                              >
                                <Ionicons name="call-outline" size={16} color={colors.primary} />
                                <Text style={[styles.contactText, styles.contactLink]}>{vacancy.contactTelephone}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {/* Application Submission Options */}
                        {(vacancy.submissionEmail || vacancy.submissionLink) && (
                          <View style={styles.submissionOptions}>
                            <Text style={styles.contactTitle}>Submit Your Application:</Text>
                            
                            {vacancy.submissionEmail && (
                              <TouchableOpacity 
                                style={styles.submissionButton}
                                onPress={() => Linking.openURL(`mailto:${vacancy.submissionEmail}?subject=Application for ${vacancy.title}`)}
                              >
                                <Ionicons name="mail" size={20} color="#FFFFFF" />
                                <Text style={styles.submissionButtonText}>Email Application</Text>
                              </TouchableOpacity>
                            )}

                            {vacancy.submissionLink && (
                              <TouchableOpacity 
                                style={[styles.submissionButton, { backgroundColor: colors.secondary }]}
                                onPress={() => Linking.openURL(vacancy.submissionLink)}
                              >
                                <Ionicons name="link" size={20} color="#FFFFFF" />
                                <Text style={styles.submissionButtonText}>Apply Online</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {/* Application Instructions */}
                        {vacancy.submissionInstructions && (
                          <View style={styles.instructionsContainer}>
                            <Text style={styles.contactTitle}>Application Instructions:</Text>
                            <Text style={styles.instructionsText}>{vacancy.submissionInstructions}</Text>
                          </View>
                        )}
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
          })}
          </View>
        )}
      </ScrollView>
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
      paddingBottom: 20,
      padding: 20,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      paddingTop: 16,
      paddingBottom: 8,
    },
    searchInput: {
      margin: 0,
    },
    filterContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      gap: 10,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.primary,
      fontWeight: '600',
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
    emptyStateContainer: {
      padding: 20,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 0,
    },
    vacancyCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },
    vacancyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    typeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.secondary + '40',
    },
    typeText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    vacancyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 14,
      lineHeight: 24,
    },
    vacancyDetails: {
      flexDirection: 'row',
      marginBottom: 14,
      flexWrap: 'wrap',
      gap: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 6,
      gap: 6,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    closingDate: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border + '40',
      gap: 6,
    },
    closingDateText: {
      fontSize: 14,
      fontWeight: '600',
    },
    expandedContent: {
      marginTop: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border + '60',
      marginBottom: 16,
    },
    section: {
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
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
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 12,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
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
      marginTop: 8,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
    },
    // Contact Information Styles
    contactInfo: {
      marginBottom: 16,
    },
    contactTitle: {
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      gap: 8,
    },
    contactText: {
      fontSize: isSmallScreen ? 13 : 14,
      color: colors.text,
      flex: 1,
    },
    contactLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    submissionOptions: {
      marginBottom: 16,
    },
    submissionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      gap: 8,
    },
    submissionButtonText: {
      color: '#FFFFFF',
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: '600',
    },
    instructionsContainer: {
      marginTop: 8,
    },
    instructionsText: {
      fontSize: isSmallScreen ? 13 : 14,
      color: colors.text,
      lineHeight: 20,
      fontStyle: 'italic',
    },
  });
}

