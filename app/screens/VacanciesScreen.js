import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Alert,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { vacanciesService } from '../services/vacanciesService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';

// Import Unified Design System Components
import {
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
import { LoadingOverlay } from '../components';

export default function VacanciesScreen() {
  const { colors, isDark } = useTheme();
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
              
              // Open PDF directly without showing loading message
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

  // Professional styles using design system
  const styles = createStyles(colors, isDark, insets);

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <UnifiedCard variant="elevated" padding="large">
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
                Unable to Load Vacancies
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
                {error}
              </Text>
              <UnifiedButton
                label="Try Again"
                onPress={fetchVacancies}
                variant="primary"
                size="medium"
                iconName="refresh-outline"
                style={{ marginTop: spacing.lg }}
              />
            </View>
          </UnifiedCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <UnifiedFormInput
            placeholder="Search vacancies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search-outline"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>

        {/* Type Filter Chips */}
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
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Count */}
        {filteredVacancies.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {filteredVacancies.length} {filteredVacancies.length === 1 ? 'vacancy' : 'vacancies'} found
            </Text>
          </View>
        )}

        {/* Vacancies List */}
        {filteredVacancies.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <UnifiedCard variant="elevated" padding="large">
              <View style={styles.emptyContent}>
                <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
                <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginTop: spacing.md }]}>
                  {vacancies.length === 0 ? 'No Vacancies Available' : 'No Matching Vacancies'}
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
                  {vacancies.length === 0 
                    ? 'Check back later for new opportunities' 
                    : 'Try adjusting your search or filter criteria'
                  }
                </Text>
              </View>
            </UnifiedCard>
          </View>
        ) : (
          <View style={styles.content}>
            {filteredVacancies.map((vacancy, index) => {
              const isExpanded = expandedVacancy === vacancy._id;
              const isVacancyDownloading = isDownloading && currentDownloadId === vacancy._id;
              return (
                <UnifiedCard 
                  key={vacancy._id || `vacancy-${index}`}
                  variant="elevated"
                  padding="large"
                  style={styles.vacancyCard}
                >
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(vacancy._id)}
                  >
                    <View style={styles.vacancyHeader}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>
                          {formatType(vacancy.type)}
                        </Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={24} 
                        color={colors.primary} 
                      />
                    </View>
                    
                    <Text style={[typography.h4, { color: colors.text, marginBottom: spacing.sm }]}>
                      {vacancy.title}
                    </Text>
                    
                    <View style={styles.vacancyDetails}>
                      {vacancy.department && (
                        <View style={styles.detailItem}>
                          <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                            {vacancy.department}
                          </Text>
                        </View>
                      )}
                      {vacancy.location && (
                        <View style={styles.detailItem}>
                          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                            {vacancy.location}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.closingDate}>
                      <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                      <Text style={[typography.bodySmall, { color: colors.primary, marginLeft: spacing.xs }]}>
                        Closes: {formatDate(vacancy.closingDate)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {vacancy.salary && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                            Salary
                          </Text>
                          <Text style={[typography.body, { color: colors.textSecondary }]}>
                            {vacancy.salary}
                          </Text>
                        </View>
                      )}

                      <View style={styles.section}>
                        <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                          Description
                        </Text>
                        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>
                          {vacancy.description}
                        </Text>
                      </View>

                      {vacancy.requirements && vacancy.requirements.length > 0 && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                            Requirements
                          </Text>
                          {vacancy.requirements.map((req, index) => (
                            <View key={`req-${vacancy._id || 'unknown'}-${index}`} style={styles.listItem}>
                              <Text style={[typography.body, { color: colors.primary }]}>•</Text>
                              <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
                                {req}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                            Responsibilities
                          </Text>
                          {vacancy.responsibilities.map((resp, index) => (
                            <View key={`resp-${vacancy._id || 'unknown'}-${index}`} style={styles.listItem}>
                              <Text style={[typography.body, { color: colors.primary }]}>•</Text>
                              <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
                                {resp}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Contact Information & Application Submission */}
                      {(vacancy.contactName || vacancy.contactEmail || vacancy.contactTelephone || 
                        vacancy.submissionEmail || vacancy.submissionLink || vacancy.submissionInstructions) && (
                        <View style={styles.section}>
                          <Text style={[typography.bodyLarge, { color: colors.text, fontWeight: '600', marginBottom: spacing.sm }]}>
                            How to Apply
                          </Text>
                          
                          {/* Contact Information */}
                          {(vacancy.contactName || vacancy.contactEmail || vacancy.contactTelephone) && (
                            <View style={styles.contactInfo}>
                              <Text style={[typography.body, { color: colors.text, fontWeight: '500', marginBottom: spacing.xs }]}>
                                Contact Information:
                              </Text>
                              {vacancy.contactName && (
                                <View style={styles.contactItem}>
                                  <Ionicons name="person-outline" size={16} color={colors.primary} />
                                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                                    {vacancy.contactName}
                                  </Text>
                                </View>
                              )}
                              {vacancy.contactEmail && (
                                <TouchableOpacity 
                                  style={styles.contactItem}
                                  onPress={() => Linking.openURL(`mailto:${vacancy.contactEmail}`)}
                                >
                                  <Ionicons name="mail-outline" size={16} color={colors.primary} />
                                  <Text style={[typography.bodySmall, { color: colors.primary, marginLeft: spacing.xs, textDecorationLine: 'underline' }]}>
                                    {vacancy.contactEmail}
                                  </Text>
                                </TouchableOpacity>
                              )}
                              {vacancy.contactTelephone && (
                                <TouchableOpacity 
                                  style={styles.contactItem}
                                  onPress={() => Linking.openURL(`tel:${vacancy.contactTelephone}`)}
                                >
                                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                                  <Text style={[typography.bodySmall, { color: colors.primary, marginLeft: spacing.xs, textDecorationLine: 'underline' }]}>
                                    {vacancy.contactTelephone}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {/* Application Submission Options */}
                          {(vacancy.submissionEmail || vacancy.submissionLink) && (
                            <View style={styles.submissionOptions}>
                              <Text style={[typography.body, { color: colors.text, fontWeight: '500', marginBottom: spacing.sm }]}>
                                Submit Your Application:
                              </Text>
                              
                              {vacancy.submissionEmail && (
                                <UnifiedButton
                                  label="Email Application"
                                  onPress={() => Linking.openURL(`mailto:${vacancy.submissionEmail}?subject=Application for ${vacancy.title}`)}
                                  variant="outline"
                                  size="small"
                                  iconName="mail-outline"
                                  iconPosition="left"
                                  style={{ marginBottom: spacing.sm }}
                                />
                              )}

                              {vacancy.submissionLink && (
                                <UnifiedButton
                                  label="Apply Online"
                                  onPress={() => Linking.openURL(vacancy.submissionLink)}
                                  variant="secondary"
                                  size="small"
                                  iconName="link-outline"
                                  iconPosition="left"
                                />
                              )}
                            </View>
                          )}

                          {/* Application Instructions */}
                          {vacancy.submissionInstructions && (
                            <View style={styles.instructionsContainer}>
                              <Text style={[typography.body, { color: colors.text, fontWeight: '500', marginBottom: spacing.xs }]}>
                                Application Instructions:
                              </Text>
                              <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
                                {vacancy.submissionInstructions}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {vacancy.pdfUrl && typeof vacancy.pdfUrl === 'string' && vacancy.pdfUrl.trim() !== '' && (
                        <View style={styles.downloadSection}>
                          <UnifiedButton
                            label={isVacancyDownloading ? `Downloading ${progress}%` : "Download Application Form"}
                            onPress={() => handleDownload(vacancy)}
                            variant="primary"
                            size="medium"
                            iconName={isVacancyDownloading ? "hourglass-outline" : "download-outline"}
                            iconPosition="left"
                            loading={isVacancyDownloading}
                            disabled={isVacancyDownloading}
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
      <LoadingOverlay loading={loading && !refreshing} message="Loading vacancies..." />
    </View>
  );
}

// Professional government-standard styling using design system
const createStyles = (colors, isDark, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorContent: {
    alignItems: 'center',
  },
  
  // Search
  searchContainer: {
    marginBottom: spacing.lg,
  },
  
  // Filters
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Results
  resultsCountContainer: {
    marginBottom: spacing.md,
  },
  
  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  
  // Content
  content: {
    gap: spacing.lg,
  },
  
  // Vacancy Card
  vacancyCard: {
    marginBottom: spacing.md,
  },
  vacancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
  },
  typeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Vacancy Details
  vacancyDetails: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closingDate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  // Expanded Content
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  
  // Contact Info
  contactInfo: {
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Submission Options
  submissionOptions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  
  // Instructions
  instructionsContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  
  // Download Section
  downloadSection: {
    marginTop: spacing.md,
  },
});

// Screen options to hide the default header since we use GlobalHeader
VacanciesScreen.options = {
  headerShown: false,
};

