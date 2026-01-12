import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
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
import { potholeReportsService } from '../services/potholeReportsService';

const STATUS_LABELS = {
  pending: 'Pending Review',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  fixed: 'Completed',
  duplicate: 'Duplicate',
  invalid: 'Invalid',
};

// Helper functions to get theme-based colors
const getStatusColor = (status, colors) => {
  const colorMap = {
    pending: colors.secondary,
    assigned: colors.primary,
    'in-progress': colors.primary,
    fixed: colors.success,
    duplicate: colors.textSecondary,
    invalid: colors.error,
  };
  return colorMap[status] || colors.textSecondary;
};

const getSeverityColor = (severity, colors) => {
  const colorMap = {
    small: colors.success,
    medium: colors.secondary,
    dangerous: colors.error,
  };
  return colorMap[severity] || colors.textSecondary;
};

const getSeverityLabel = (severity) => {
  const labelMap = {
    small: 'Minor Damage',
    medium: 'Moderate Damage',
    dangerous: 'Severe Damage',
  };
  return labelMap[severity] || severity;
};

export default function MyReportsScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setError(null);
      const data = await potholeReportsService.getMyReports();
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status filter options
  const statusFilters = ['All', 'Pending Review', 'Assigned', 'In Progress', 'Completed', 'Duplicate', 'Invalid'];

  // Filter, search, and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Apply status filter
    if (selectedFilter !== 'All') {
      const filterMap = {
        'Pending Review': 'pending',
        'Assigned': 'assigned',
        'In Progress': 'in-progress',
        'Completed': 'fixed',
        'Duplicate': 'duplicate',
        'Invalid': 'invalid',
      };
      const statusValue = filterMap[selectedFilter];
      if (statusValue) {
        filtered = filtered.filter(report => report.status === statusValue);
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report => 
        report.roadName?.toLowerCase().includes(query) ||
        report.town?.toLowerCase().includes(query) ||
        report.region?.toLowerCase().includes(query) ||
        report.referenceCode?.toLowerCase().includes(query) ||
        report.description?.toLowerCase().includes(query)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [reports, searchQuery, selectedFilter, sortOrder]);

  const styles = getStyles(colors, insets);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <GlobalHeader
          title="My Reports"
          subtitle="Track your road damage reports"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.loadingContainer}>
          <UnifiedSkeletonLoader type="list-item" count={5} />
          <Text style={styles.loadingText}>Loading your reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        
        <GlobalHeader
          title="My Reports"
          subtitle="Track your road damage reports"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Unable to Load Reports</Text>
          <Text style={styles.errorText}>{error}</Text>
          <UnifiedButton
            label="Try Again"
            onPress={loadReports}
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
        title="My Reports"
        subtitle={`${reports.length} ${reports.length === 1 ? 'report' : 'reports'} submitted`}
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
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search and Filter Section */}
        {reports.length > 0 && (
          <UnifiedCard variant="flat" padding="medium" style={styles.searchFilterCard}>
            <UnifiedFormInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by road name, location, or reference..."
              label="Search Reports"
              leftIcon="search-outline"
              clearButtonMode="while-editing"
            />

            {/* Status Filter Chips */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Filter by Status</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
              >
                {statusFilters.map((filter) => {
                  const isActive = selectedFilter === filter;
                  const statusValue = filter.toLowerCase().replace(' ', '-');
                  const statusColor = filter !== 'All' ? getStatusColor(statusValue, colors) : colors.primary;
                  
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                        isActive && filter !== 'All' && {
                          backgroundColor: statusColor + '20',
                          borderColor: statusColor,
                        },
                      ]}
                      onPress={() => setSelectedFilter(isActive ? 'All' : filter)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                          isActive && filter !== 'All' && {
                            color: statusColor,
                          },
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sort Options */}
            <View style={styles.sortSection}>
              <Text style={styles.sortLabel}>Sort by Date</Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortOrder === 'newest' && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortOrder('newest')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="arrow-down" 
                    size={16} 
                    color={sortOrder === 'newest' ? colors.primary : colors.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortOrder === 'newest' && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    Newest First
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortButton,
                    sortOrder === 'oldest' && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortOrder('oldest')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="arrow-up" 
                    size={16} 
                    color={sortOrder === 'oldest' ? colors.primary : colors.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortOrder === 'oldest' && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    Oldest First
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </UnifiedCard>
        )}

        {/* Results Count */}
        {filteredReports.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <UnifiedCard variant="outlined" padding="small" style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Ionicons name="funnel-outline" size={16} color={colors.primary} />
              <Text style={styles.resultsCount}>
                {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
              </Text>
            </View>
            {(searchQuery.trim() || selectedFilter !== 'All') && (
              <UnifiedButton
                label="Clear Filters"
                variant="ghost"
                size="small"
                iconName="close"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }}
                style={styles.clearFiltersButton}
              />
            )}
          </UnifiedCard>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <UnifiedCard variant="default" padding="large" style={styles.emptyStateCard}>
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="document-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
              <Text style={styles.emptyStateMessage}>
                You haven't submitted any road damage reports yet. Help improve our roads by reporting issues you encounter.
              </Text>
              <UnifiedButton
                label="Report Road Damage"
                variant="primary"
                size="medium"
                iconName="add-circle-outline"
                onPress={() => navigation.navigate('ReportPothole')}
                style={styles.emptyStateButton}
              />
            </View>
          </UnifiedCard>
        ) : filteredReports.length === 0 ? (
          <UnifiedCard variant="default" padding="large" style={styles.emptyStateCard}>
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Reports Found</Text>
              <Text style={styles.emptyStateMessage}>
                {searchQuery.trim() || selectedFilter !== 'All'
                  ? 'No reports match your current search and filter criteria. Try adjusting your filters or search terms.'
                  : 'No reports found.'}
              </Text>
              {(searchQuery.trim() || selectedFilter !== 'All') && (
                <UnifiedButton
                  label="Clear Filters"
                  variant="outline"
                  size="medium"
                  iconName="refresh"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('All');
                  }}
                  style={styles.emptyStateButton}
                />
              )}
            </View>
          </UnifiedCard>
        ) : (
          <View style={styles.reportsContainer}>
            {filteredReports.map((report) => (
              <UnifiedCard 
                key={report.id} 
                variant="default" 
                padding="none" 
                style={styles.reportCard}
              >
                <TouchableOpacity
                  style={styles.reportCardContent}
                  onPress={() => handleReportPress(report)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: report.photoUrl }}
                    style={styles.reportPhoto}
                    resizeMode="cover"
                  />
                  <View style={styles.reportDetails}>
                    <View style={styles.reportHeader}>
                      <Text style={styles.roadName} numberOfLines={1}>
                        {report.roadName || 'Road Name Not Specified'}
                      </Text>
                      <View
                        style={[
                          styles.severityBadge,
                          { 
                            backgroundColor: getSeverityColor(report.severity, colors) + '15',
                            borderColor: getSeverityColor(report.severity, colors) + '40',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.severityDot,
                            { backgroundColor: getSeverityColor(report.severity, colors) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.severityText,
                            { color: getSeverityColor(report.severity, colors) },
                          ]}
                        >
                          {getSeverityLabel(report.severity)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {report.town}, {report.region}
                      </Text>
                    </View>

                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { 
                            backgroundColor: getStatusColor(report.status, colors) + '15',
                            borderColor: getStatusColor(report.status, colors) + '40',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(report.status, colors) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(report.status, colors) },
                          ]}
                        >
                          {STATUS_LABELS[report.status]}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
                    </View>

                    {report.referenceCode && (
                      <View style={styles.referenceRow}>
                        <Ionicons name="document-text-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.referenceCode} numberOfLines={1}>
                          Ref: {report.referenceCode}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              </UnifiedCard>
            ))}
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

    // Search and Filter
    searchFilterCard: {
      marginBottom: spacing.lg,
    },
    filterSection: {
      marginTop: spacing.lg,
    },
    filterLabel: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    filterContainer: {
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    filterChipText: {
      ...typography.bodySmall,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },

    // Sort Section
    sortSection: {
      marginTop: spacing.lg,
    },
    sortLabel: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    sortButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    sortButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
    sortButtonActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    sortButtonText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
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
    clearFiltersButton: {
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

    // Reports List
    reportsContainer: {
      gap: spacing.lg,
    },
    reportCard: {
      overflow: 'hidden',
    },
    reportCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reportPhoto: {
      width: 80,
      height: 80,
      borderRadius: 8,
      margin: spacing.md,
    },
    reportDetails: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingRight: spacing.sm,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    roadName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    severityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      borderWidth: 1,
      gap: spacing.xs,
    },
    severityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    severityText: {
      ...typography.caption,
      fontWeight: '600',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    locationText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      flex: 1,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
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
      fontWeight: '600',
    },
    dateText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    referenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    referenceCode: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: 'monospace',
    },
    chevronContainer: {
      paddingRight: spacing.md,
    },
  });
}