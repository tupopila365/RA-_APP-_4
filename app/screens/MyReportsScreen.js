import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';
import { EmptyState } from '../components/EmptyState';

const STATUS_COLORS = {
  pending: '#FFA500',
  assigned: '#3498DB',
  'in-progress': '#9B59B6',
  fixed: '#4ECDC4',
  duplicate: '#95A5A6',
  invalid: '#E74C3C',
};

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  fixed: 'Fixed',
  duplicate: 'Duplicate',
  invalid: 'Invalid',
};

const SEVERITY_COLORS = {
  small: '#4ECDC4',
  medium: '#FFA500',
  dangerous: '#FF6B6B',
};

export default function MyReportsScreen({ navigation }) {
  const { colors } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
    <SafeAreaView style={styles.container} edges={['top']}>

      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="document-outline"
            title="No Reports Yet"
            message="You haven't submitted any reports. Tap 'Report Road Damage' to get started."
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {reports.map((report) => (
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
                      { backgroundColor: SEVERITY_COLORS[report.severity] + '20' },
                    ]}
                  >
                    <View
                      style={[
                        styles.severityDot,
                        { backgroundColor: SEVERITY_COLORS[report.severity] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.severityText,
                        { color: SEVERITY_COLORS[report.severity] },
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
                      { backgroundColor: STATUS_COLORS[report.status] + '20' },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: STATUS_COLORS[report.status] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: STATUS_COLORS[report.status] },
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
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

