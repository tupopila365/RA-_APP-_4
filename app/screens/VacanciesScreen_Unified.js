import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { GlobalHeader } from '../components/GlobalHeader';
import { UnifiedCard } from '../components/UnifiedCard';
import { UnifiedButton } from '../components/UnifiedButton';
import { UnifiedSkeletonLoader } from '../components/UnifiedSkeletonLoader';
import { ErrorState, EmptyState, SearchInput } from '../components';
import { vacanciesService } from '../services/vacanciesService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function VacanciesScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
      resetDownload();
      
      Alert.alert(
        'Download Failed',
        result.error || 'Download failed. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => {
              setCurrentDownloadId(null);
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <GlobalHeader
          title="Careers"
          subtitle="Job opportunities and vacancies"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <UnifiedSkeletonLoader type="list-item" count={5} animated={true} />
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <GlobalHeader
          title="Careers"
          subtitle="Job opportunities and vacancies"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <ErrorState message={error} onRetry={fetchVacancies} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GlobalHeader
        title="Careers"
        subtitle="Job opportunities and vacancies"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { 
            icon: 'search-outline', 
            onPress: () => {}, 
            accessibilityLabel: 'Search vacancies' 
          }
        ]}
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

        {/* Type Filter Chips */}
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
            <Text style={[
                styles.filterChipText,
                selectedFilter === 'All' && styles.filterChipTextActive,
              ]}
             maxFontSizeMultiplier={1.3}>
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
              <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive,
                ]}
               maxFontSizeMultiplier={1.3}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Count */}
        {filteredVacancies.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount} maxFontSizeMultiplier={1.3}>
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
                <UnifiedCard
                  key={vacancy._id || `vacancy-${index}`}
                  style={styles.vacancyCard}
                  variant="default"
                  padding="large"
                  onPress={() => toggleExpand(vacancy._id)}
                >
                  <View style={styles.vacancyHeader}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText} maxFontSizeMultiplier={1.3}>
                        {formatType(vacancy.type)}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  
                  <Text style={styles.vacancyTitle} numberOfLines={2} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                    {vacancy.title}
                  </Text>
                  
                  <View style={styles.vacancyDetails}>
                    {vacancy.department && (
                      <View style={styles.detailItem}>
                        <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                          {vacancy.department}
                        </Text>
                      </View>
                    )}
                    {vacancy.location && (
                      <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                          {vacancy.location}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.closingDate}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={styles.closingDateText} numberOfLines={1} ellipsizeMode="tail" maxFontSizeMultiplier={1.3}>
                      Closes: {formatDate(vacancy.closingDate)}
                    </Text>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      {vacancy.salary && (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Salary</Text>
                          <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>{vacancy.salary}</Text>
                        </View>
                      )}

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Description</Text>
                        <Text style={styles.sectionText} maxFontSizeMultiplier={1.3}>{vacancy.description}</Text>
                      </View>

                      {vacancy.requirements && vacancy.requirements.length > 0 && (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Requirements</Text>
                          {vacancy.requirements.map((req, index) => (
                            <View key={`req-${vacancy._id || 'unknown'}-${index}`} style={styles.listItem}>
                              <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>•</Text>
                              <Text style={styles.listText} maxFontSizeMultiplier={1.3}>{req}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>Responsibilities</Text>
                          {vacancy.responsibilities.map((resp, index) => (
                            <View key={`resp-${vacancy._id || 'unknown'}-${index}`} style={styles.listItem}>
                              <Text style={styles.bullet} maxFontSizeMultiplier={1.3}>•</Text>
                              <Text style={styles.listText} maxFontSizeMultiplier={1.3}>{resp}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Contact Information & Application Submission */}
                      {(vacancy.contactName || vacancy.contactEmail || vacancy.contactTelephone || 
                        vacancy.submissionEmail || vacancy.submissionLink || vacancy.submissionInstructions) && (
                        <View style={styles.section}>
                          <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.3}>How to Apply</Text>
                          
                          {/* Contact Information */}
                          {(vacancy.contactName || vacancy.contactEmail || vacancy.contactTelephone) && (
                            <View style={styles.contactInfo}>
                              <Text style={styles.contactTitle} maxFontSizeMultiplier={1.3}>Contact Information:</Text>
                              {vacancy.contactName && (
                                <View style={styles.contactItem}>
                                  <Ionicons name="person-outline" size={16} color={colors.primary} />
                                  <Text style={styles.contactText} maxFontSizeMultiplier={1.3}>{vacancy.contactName}</Text>
                                </View>
                              )}
                              {vacancy.contactEmail && (
                                <TouchableOpacity 
                                  style={styles.contactItem}
                                  onPress={() => Linking.openURL(`mailto:${vacancy.contactEmail}`)}
                                >
                                  <Ionicons name="mail-outline" size={16} color={colors.primary} />
                                  <Text style={[styles.contactText, styles.contactLink]} maxFontSizeMultiplier={1.3}>
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
                                  <Text style={[styles.contactText, styles.contactLink]} maxFontSizeMultiplier={1.3}>
                                    {vacancy.contactTelephone}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {/* Application Submission Options */}
                          {(vacancy.submissionEmail || vacancy.submissionLink) && (
                            <View style={styles.submissionOptions}>
                              <Text style={styles.contactTitle} maxFontSizeMultiplier={1.3}>Submit Your Application:</Text>
                              
                              {vacancy.submissionEmail && (
                                <UnifiedButton
                                  variant="primary"
                                  size="medium"
                                  label="Email Application"
                                  iconName="mail"
                                  onPress={() => Linking.openURL(`mailto:${vacancy.submissionEmail}?subject=Application for ${vacancy.title}`)}
                                  style={styles.submissionButton}
                                />
                              )}

                              {vacancy.submissionLink && (
                                <UnifiedButton
                                  variant="secondary"
                                  size="medium"
                                  label="Apply Online"
                                  iconName="link"
                                  onPress={() => Linking.openURL(vacancy.submissionLink)}
                                  style={styles.submissionButton}
                                />
                              )}
                            </View>
                          )}

                          {/* Application Instructions */}
                          {vacancy.submissionInstructions && (
                            <View style={styles.instructionsContainer}>
                              <Text style={styles.contactTitle} maxFontSizeMultiplier={1.3}>Application Instructions:</Text>
                              <Text style={styles.instructionsText} maxFontSizeMultiplier={1.3}>
                                {vacancy.submissionInstructions}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {vacancy.pdfUrl && typeof vacancy.pdfUrl === 'string' && vacancy.pdfUrl.trim() !== '' && (
                        <UnifiedButton
                          variant="primary"
                          size="large"
                          label={isVacancyDownloading ? `Downloading ${progress}%` : "Download Application Form"}
                          iconName={isVacancyDownloading ? undefined : "download-outline"}
                          onPress={() => handleDownload(vacancy)}
                          loading={isVacancyDownloading}
                          disabled={isVacancyDownloading}
                          fullWidth
                          style={styles.downloadButton}
                        />
                      )}
                    </View>
                  )}
                </UnifiedCard>
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
    filterContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      ...typography.bodySmall,
      fontWeight: '500',
      color: colors.text,
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
      ...typography.bodySmall,
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
    vacancyCard: {
      marginBottom: spacing.md,
    },
    vacancyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    typeBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    typeText: {
      ...typography.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: colors.secondary,
    },
    vacancyTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 24,
    },
    vacancyDetails: {
      flexDirection: 'row',
      marginBottom: spacing.md,
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.md,
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    detailText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      flex: 1,
    },
    closingDate: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.xs,
    },
    closingDateText: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.primary,
    },
    expandedContent: {
      marginTop: spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.h5,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    sectionText: {
      ...typography.body,
      color: colors.text,
      lineHeight: 22,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
      paddingRight: spacing.sm,
    },
    bullet: {
      ...typography.body,
      color: colors.primary,
      marginRight: spacing.sm,
      fontWeight: 'bold',
    },
    listText: {
      flex: 1,
      ...typography.body,
      color: colors.text,
      lineHeight: 20,
    },
    downloadButton: {
      marginTop: spacing.md,
    },
    
    // Contact Information Styles
    contactInfo: {
      marginBottom: spacing.md,
    },
    contactTitle: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    contactText: {
      ...typography.body,
      color: colors.text,
    },
    contactLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    submissionOptions: {
      marginBottom: spacing.md,
    },
    submissionButton: {
      marginBottom: spacing.sm,
    },
    instructionsContainer: {
      marginTop: spacing.md,
    },
    instructionsText: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 20,
      fontStyle: 'italic',
    },
  });
}