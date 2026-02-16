import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';

import {
  UnifiedCard,
  UnifiedButton,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

import { SearchInput } from '../components/SearchInput';
import { FilterDropdownBox } from '../components/FilterDropdownBox';
import { NoDataDisplay } from '../components/NoDataDisplay';
import { LoadingOverlay } from '../components';
import { CachedImage } from '../components/CachedImage';

const CARD_IMAGE_HEIGHT = 140;

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  fixed: 'Fixed',
  duplicate: 'Duplicate',
  invalid: 'Invalid',
};

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

export default function MyReportsScreen({ navigation }) {
  const { colors } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setError(null);
      const data = await potholeReportsService.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Failed to load reports');
      setReports([]);
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

  const statusFilters = ['All', 'Pending', 'Assigned', 'In Progress', 'Fixed', 'Duplicate', 'Invalid'];

  const filteredReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    let filtered = [...reports];

    if (selectedFilter !== 'All') {
      const filterMap = {
        'Pending': 'pending',
        'Assigned': 'assigned',
        'In Progress': 'in-progress',
        'Fixed': 'fixed',
        'Duplicate': 'duplicate',
        'Invalid': 'invalid',
      };
      const statusValue = filterMap[selectedFilter];
      if (statusValue) {
        filtered = filtered.filter((report) => report.status === statusValue);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.roadName?.toLowerCase().includes(query) ||
          report.town?.toLowerCase().includes(query) ||
          report.region?.toLowerCase().includes(query) ||
          report.referenceCode?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [reports, searchQuery, selectedFilter, sortOrder]);

  const styles = getStyles(colors);

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorWrapper}>
          <UnifiedCard variant="elevated" padding="large" style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <UnifiedButton
                label="Retry"
                onPress={loadReports}
                variant="primary"
                size="medium"
              />
            </View>
          </UnifiedCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={true}
      >
        {reports.length > 0 && (
          <View style={styles.searchInputContainer}>
            <SearchInput
              placeholder="Search by road, location, or reference code..."
              value={searchQuery}
              onSearch={setSearchQuery}
              onChangeTextImmediate={setSearchQuery}
              onClear={() => setSearchQuery('')}
              style={styles.searchInput}
              accessibilityLabel="Search reports"
              accessibilityHint="Search by road name, location, or reference code"
            />
          </View>
        )}

        {reports.length > 0 && (
          <>
            <View style={styles.toolbarRow}>
              <View style={styles.filterDropdownWrap}>
                <FilterDropdownBox
                  label="Status"
                  placeholder="All statuses"
                  value={selectedFilter === 'All' ? null : selectedFilter}
                  options={statusFilters}
                  nullMapsToOption="All"
                  onSelect={setSelectedFilter}
                  onClear={() => setSelectedFilter('All')}
                  accessibilityLabel="Filter reports by status"
                />
              </View>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
              >
                <Ionicons
                  name={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'}
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.sortLabel}>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</Text>
              </TouchableOpacity>
            </View>

            {(searchQuery.trim() || selectedFilter !== 'All') && filteredReports.length > 0 && (
              <View style={styles.resultsCountContainer}>
                <Text style={styles.resultsCount}>
                  {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
                </Text>
              </View>
            )}
          </>
        )}

        {reports.length === 0 ? (
          <NoDataDisplay
            preset="reports"
            actionLabel="Report Road Damage"
            onAction={() => navigation.navigate('ReportPothole')}
            style={styles.emptyStateContainer}
          />
        ) : filteredReports.length === 0 ? (
          <NoDataDisplay
            preset="search"
            message={
              searchQuery.trim() || selectedFilter !== 'All'
                ? `No reports match your ${searchQuery.trim() ? 'search' : 'filter'} criteria.`
                : 'No reports found.'
            }
            style={styles.emptyStateContainer}
          />
        ) : (
          <View style={styles.content}>
            {filteredReports.map((report) => (
              <UnifiedCard
                key={report.id}
                onPress={() => handleReportPress(report)}
                variant="elevated"
                padding="none"
                style={styles.reportCard}
                accessible={true}
                accessibilityLabel={`${report.roadName || 'Unknown Road'}, ${STATUS_LABELS[report.status] || report.status}`}
                accessibilityHint="Double tap to view report details"
              >
                {report.photoUrl ? (
                  <CachedImage
                    uri={report.photoUrl}
                    style={styles.photo}
                    resizeMode="cover"
                    accessibilityLabel={`Photo of road damage at ${report.roadName || 'location'}`}
                  />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: colors.card }]}>
                    <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                  </View>
                )}
                <View style={styles.reportContent}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.roadName} numberOfLines={1}>
                      {report.roadName || 'Unknown Road'}
                    </Text>
                    {report.severity && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: getSeverityColor(report.severity, colors) + '18' },
                        ]}
                      >
                        <View
                          style={[
                            styles.badgeDot,
                            { backgroundColor: getSeverityColor(report.severity, colors) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.badgeText,
                            { color: getSeverityColor(report.severity, colors) },
                          ]}
                        >
                          {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {report.town || 'Unknown'}, {report.region || 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.footerRow}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: getStatusColor(report.status, colors) + '18' },
                      ]}
                    >
                      <View
                        style={[
                          styles.badgeDot,
                          { backgroundColor: getStatusColor(report.status, colors) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          { color: getStatusColor(report.status, colors) },
                        ]}
                      >
                        {STATUS_LABELS[report.status] || report.status || 'Unknown'}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>
                      {report.createdAt ? formatDate(report.createdAt) : '—'}
                    </Text>
                  </View>

                  {report.referenceCode && (
                    <Text style={styles.referenceCode} numberOfLines={1}>
                      Ref: {report.referenceCode}
                    </Text>
                  )}

                  <View style={styles.viewDetailsRow}>
                    <Text style={[styles.viewDetailsText, { color: colors.primary }]}>View details</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                  </View>
                </View>
              </UnifiedCard>
            ))}
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={loading} message="Loading reports..." />
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
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    searchInputContainer: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    searchInput: {
      margin: 0,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    filterDropdownWrap: {
      flex: 1,
      minWidth: 0,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      gap: 4,
      marginLeft: spacing.sm,
    },
    sortLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
    resultsCountContainer: {
      paddingBottom: spacing.sm,
    },
    resultsCount: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    errorWrapper: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    errorCard: {
      marginBottom: 0,
    },
    errorContent: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    errorText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    emptyStateContainer: {
      flex: 1,
      minHeight: 280,
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
    },
    content: {
      paddingTop: spacing.sm,
    },
    reportCard: {
      marginBottom: spacing.lg,
      overflow: 'hidden',
    },
    photo: {
      width: '100%',
      height: CARD_IMAGE_HEIGHT,
      backgroundColor: colors.card,
    },
    photoPlaceholder: {
      width: '100%',
      height: CARD_IMAGE_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportContent: {
      padding: spacing.lg,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    roadName: {
      flex: 1,
      ...typography.h5,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    badgeText: {
      ...typography.label,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: 4,
    },
    locationText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      flex: 1,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    dateText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    referenceCode: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: 'monospace',
      marginBottom: spacing.sm,
    },
    viewDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
      gap: 4,
    },
    viewDetailsText: {
      ...typography.bodySmall,
      fontWeight: '600',
    },
  });
}
