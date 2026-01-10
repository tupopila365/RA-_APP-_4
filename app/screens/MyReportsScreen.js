import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';
import { EmptyState } from '../components/EmptyState';
import { SearchInput } from '../components/SearchInput';

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  fixed: 'Fixed',
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
  const statusFilters = ['All', 'Pending', 'Assigned', 'In Progress', 'Fixed', 'Duplicate', 'Invalid'];

  // Filter, search, and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Apply status filter
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

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReports}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
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
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Search Input */}
        {reports.length > 0 && (
          <View style={styles.searchInputContainer}>
            <SearchInput
              placeholder="Search reports..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery('')}
              style={styles.searchInput}
              accessibilityLabel="Search reports"
              accessibilityHint="Search by road name, location, or reference code"
            />
          </View>
        )}

        {/* Status Filter Chips - matching Road Status design */}
        {reports.length > 0 && (
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
            {statusFilters.filter(f => f !== 'All').map((filter) => {
              const statusValue = filter.toLowerCase().replace(' ', '-');
              const statusColor = getStatusColor(statusValue, colors);
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.filterChipActive,
                    selectedFilter === filter && {
                      backgroundColor: statusColor + '20',
                      borderColor: statusColor,
                    },
                  ]}
                  onPress={() => setSelectedFilter(selectedFilter === filter ? 'All' : filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === filter && styles.filterChipTextActive,
                      selectedFilter === filter && {
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
        )}

        {/* Results Count */}
        {filteredReports.length > 0 && (searchQuery.trim() || selectedFilter !== 'All') && (
          <View style={styles.resultsCountContainer}>
            <Text style={styles.resultsCount}>
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'} found
            </Text>
          </View>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="document-outline"
              title="No Reports Yet"
              message="You haven't submitted any reports. Tap 'Report Road Damage' to get started."
            />
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="search-outline"
              title="No Reports Found"
              message={
                searchQuery.trim() || selectedFilter !== 'All'
                  ? `No reports match your ${searchQuery.trim() ? 'search' : 'filter'} criteria.`
                  : 'No reports found.'
              }
            />
          </View>
        ) : (
          <View style={styles.content}>
            {filteredReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => handleReportPress(report)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: report.photoUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.reportContent}>
                <View style={styles.reportHeader}>
                  <Text style={styles.roadName} numberOfLines={1}>
                    {report.roadName}
                  </Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(report.severity, colors) + '15' },
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
                      {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
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
                      { backgroundColor: getStatusColor(report.status, colors) + '15' },
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
                  <Text style={styles.referenceCode} numberOfLines={1}>
                    Ref: {report.referenceCode}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      marginTop: 16,
      marginBottom: 24,
      color: colors.textSecondary,
      textAlign: 'center',
      fontSize: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    content: {
      padding: 0,
    },
    reportCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    photo: {
      width: 100,
      height: 100,
    },
    reportContent: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    roadName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginRight: 8,
    },
    severityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    severityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    severityText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 4,
    },
    locationText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    referenceCode: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'monospace',
    },
  });
}

