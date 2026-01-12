import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';
import { SkeletonLoader } from '../components';

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

export default function ReportDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { reportId } = route.params || {};
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setError(null);
      const data = await potholeReportsService.getReportById(reportId);
      setReport(data);
    } catch (err) {
      console.error('Error loading report:', err);
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openMap = () => {
    if (!report || !report.location) return;
    const { latitude, longitude } = report.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error opening map:', err);
    });
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <SkeletonLoader type="profile" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>{error || 'Report not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReport}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {/* Reference Code */}
        {report.referenceCode && (
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>Reference Code</Text>
            <Text style={styles.referenceCode}>{report.referenceCode}</Text>
          </View>
        )}

        {/* Photo */}
        <View style={styles.section}>
          <Image source={{ uri: report.photoUrl }} style={styles.photo} resizeMode="cover" />
        </View>

        {/* Status and Severity */}
        <View style={styles.row}>
          <View style={styles.statusContainer}>
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
              <Text style={[styles.statusText, { color: getStatusColor(report.status, colors) }]}>
                {STATUS_LABELS[report.status]}
              </Text>
            </View>
          </View>

          <View style={styles.severityContainer}>
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
        </View>

        {/* Road Name */}
        <View style={styles.section}>
          <Text style={styles.value}>{report.roadName}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.value}>
                {report.town}, {report.region}
              </Text>
              <Text style={styles.coordinates}>
                {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {report.description && (
          <View style={styles.section}>
            <Text style={styles.value}>{report.description}</Text>
          </View>
        )}

        {/* Admin Notes */}
        {report.adminNotes && (
          <View style={styles.section}>
            <View style={styles.adminNotesContainer}>
              <Text style={styles.adminNotesText}>{report.adminNotes}</Text>
            </View>
          </View>
        )}

        {/* Repair Photo */}
        {report.repairPhotoUrl && (
          <View style={styles.section}>
            <Image
              source={{ uri: report.repairPhotoUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Assigned To */}
        {report.assignedTo && (
          <View style={styles.section}>
            <Text style={styles.value}>{report.assignedTo}</Text>
          </View>
        )}

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Submitted:</Text>
              <Text style={styles.timelineValue}>{formatDate(report.createdAt)}</Text>
            </View>
            {report.fixedAt && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Fixed:</Text>
                <Text style={styles.timelineValue}>{formatDate(report.fixedAt)}</Text>
              </View>
            )}
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Last Updated:</Text>
              <Text style={styles.timelineValue}>{formatDate(report.updatedAt)}</Text>
            </View>
          </View>
        </View>
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
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    referenceContainer: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    referenceLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    referenceCode: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      letterSpacing: 1,
      fontFamily: 'monospace',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    photo: {
      width: '100%',
      height: 250,
      borderRadius: 8,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    statusContainer: {
      flex: 1,
    },
    severityContainer: {
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
      alignSelf: 'flex-start',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    severityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
      alignSelf: 'flex-start',
    },
    severityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    severityText: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    value: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 12,
    },
    locationTextContainer: {
      flex: 1,
    },
    coordinates: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: 'monospace',
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      gap: 8,
      alignSelf: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    mapButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    adminNotesContainer: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    adminNotesText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    timeline: {
      gap: 12,
    },
    timelineItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#E0E0E0',
    },
    timelineLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    timelineValue: {
      fontSize: 14,
      color: colors.text,
    },
  });
}

