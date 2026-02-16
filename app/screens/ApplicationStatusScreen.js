import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { plnService } from '../services/plnService';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard, UnifiedButton } from '../components';
import { GlobalHeader } from '../components/UnifiedDesignSystem';
import { StatusStepper } from '../components/StatusStepper';
import { LoadingOverlay, ErrorState } from '../components';

function normalizeStatus(status) {
  if (!status) return 'SUBMITTED';
  const normalized = status.toString().trim().toUpperCase().replace(/[\s-]+/g, '_');
  const mapping = {
    PENDING: 'SUBMITTED',
    PENDING_REVIEW: 'UNDER_REVIEW',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    REJECTED: 'DECLINED',
    DECLINED: 'DECLINED',
    PAYMENT_REQUIRED: 'PAYMENT_PENDING',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_RECEIVED: 'PAID',
    PAID: 'PAID',
    PLATES_ORDERED: 'PLATES_ORDERED',
    READY_FOR_COLLECTION: 'READY_FOR_COLLECTION',
    COMPLETED: 'READY_FOR_COLLECTION',
    EXPIRED: 'EXPIRED',
  };
  return mapping[normalized] || normalized;
}

function getStatusLabel(status) {
  const normalized = normalizeStatus(status);
  const labels = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    PAYMENT_PENDING: 'Payment Pending',
    PAID: 'Payment Received',
    PLATES_ORDERED: 'Plates Ordered',
    READY_FOR_COLLECTION: 'Ready for Collection',
    DECLINED: 'Declined',
    EXPIRED: 'Expired',
  };
  return labels[normalized] || 'In Progress';
}

function getNextStepsMessage(status) {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'SUBMITTED':
      return 'Your application was received. We will review your documents shortly.';
    case 'UNDER_REVIEW':
      return 'Your documents are being verified by our team.';
    case 'APPROVED':
      return 'Application approved. Please proceed with payment to continue.';
    case 'PAYMENT_PENDING':
      return 'Payment is required to continue processing your plates.';
    case 'PAID':
      return 'Payment received. Plates are being ordered.';
    case 'PLATES_ORDERED':
      return 'Plates ordered. We will notify you once they are ready for collection.';
    case 'READY_FOR_COLLECTION':
      return 'Your plates are ready for collection. Bring your ID to the nearest office.';
    case 'DECLINED':
      return 'Your application was declined. Contact support for details.';
    case 'EXPIRED':
      return 'Your application expired. Please submit a new application.';
    default:
      return 'Your application is being processed. Please check back for updates.';
  }
}

function buildStatusHistory(history, createdAt, normalizedStatus) {
  if (Array.isArray(history) && history.length > 0) {
    return history.map((entry) => ({
      ...entry,
      status: normalizeStatus(entry.status || normalizedStatus),
      timestamp: entry.timestamp || entry.date || entry.createdAt || entry.updatedAt || createdAt || new Date().toISOString(),
      comment: entry.comment || entry.note || entry.remark || entry.message,
    }));
  }
  const baseTimestamp = createdAt || new Date().toISOString();
  const fallback = [{ status: 'SUBMITTED', timestamp: baseTimestamp, comment: 'Application submitted' }];
  if (normalizedStatus && normalizedStatus !== 'SUBMITTED') {
    fallback.push({ status: normalizedStatus, timestamp: baseTimestamp, comment: 'Current status' });
  }
  return fallback;
}

function formatHistoryTimestamp(timestamp) {
  if (!timestamp) return 'Not specified';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export default function ApplicationStatusScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const application = route?.params?.application || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingResult, setTrackingResult] = useState(null);

  const styles = useMemo(() => getStyles(colors), [colors]);
  const bg = colors.backgroundSecondary || colors.background;

  const referenceId = application?.referenceId || '';
  const pin = application?.trackingPin || application?.pin || '12345';

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return colors.primary;
      case 'APPROVED':
      case 'PAID':
      case 'PLATES_ORDERED':
      case 'READY_FOR_COLLECTION':
        return colors.success;
      case 'DECLINED':
      case 'EXPIRED':
        return colors.error;
      case 'PAYMENT_PENDING':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const fetchStatus = async () => {
    if (!referenceId.trim()) {
      setError('No application reference.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await plnService.trackApplication(referenceId.trim(), (pin || '12345').toString().trim());
      const normalizedStatus = normalizeStatus(result.status || 'SUBMITTED');
      const statusHistory = buildStatusHistory(result.statusHistory, result.createdAt, normalizedStatus);
      setTrackingResult({
        referenceId: result.referenceId || referenceId,
        status: normalizedStatus,
        estimatedTime: result.estimatedTime || '5–7 working days',
        submittedDate: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown',
        lastUpdated: result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'Unknown',
        nextSteps: getNextStepsMessage(result.status),
        statusHistory,
        paymentDeadline: result.paymentDeadline,
        paymentReceivedAt: result.paymentReceivedAt,
      });
    } catch (err) {
      setError(err.message || 'Failed to load application status.');
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [referenceId, pin]);

  const openPaymentScreen = () => {
    navigation.navigate('Payment', {
      referenceId: trackingResult.referenceId,
      amount: 2000,
      description: 'Personalised Number Plates (PLN)',
      pin: pin || undefined,
    });
  };

  if (error && !trackingResult) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
        <GlobalHeader title="Application status" subtitle="" showBackButton onBackPress={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={fetchStatus} fullScreen />
      </SafeAreaView>
    );
  }

  if (!trackingResult) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
        <GlobalHeader title="Application status" subtitle="" showBackButton onBackPress={() => navigation.goBack()} />
        <LoadingOverlay loading message="Loading status..." />
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(trackingResult.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <GlobalHeader
        title="Application status"
        subtitle="PLN"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={null}
      >
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <Text style={[styles.refLabel, { color: colors.textMuted }]}>Reference</Text>
            <Text style={[styles.refValue, { color: colors.text }]} selectable>
              {trackingResult.referenceId}
            </Text>
          </View>

          <UnifiedCard variant="outlined" padding="large">
            <View style={[styles.statusBadgeWrap, { backgroundColor: statusColor + '18', borderColor: statusColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {getStatusLabel(trackingResult.status)}
              </Text>
            </View>

            <View style={[styles.infoBlock, { borderTopColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Estimated time</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{trackingResult.estimatedTime}</Text>
            </View>

            {trackingResult.nextSteps ? (
              <View style={[styles.infoBlock, { borderTopColor: colors.border }]}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Next steps</Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{trackingResult.nextSteps}</Text>
              </View>
            ) : null}

            {trackingResult.status === 'PAYMENT_PENDING' ? (
              <View style={[styles.payBlock, { borderTopColor: colors.border }]}>
                <UnifiedButton
                  label="Pay in app"
                  onPress={openPaymentScreen}
                  variant="primary"
                  size="large"
                  iconName="card-outline"
                  iconPosition="left"
                  fullWidth
                  style={styles.payButton}
                />
                <Text style={[styles.payHint, { color: colors.textMuted }]}>
                  Pay N$2,000 securely in the app for your personalised plates.
                </Text>
              </View>
            ) : null}

            <View style={[styles.stepperWrap, { borderTopColor: colors.border }]}>
              <Text style={[styles.stepperTitle, { color: colors.text }]}>Progress</Text>
              <StatusStepper
                currentStatus={trackingResult.status}
                statusHistory={trackingResult.statusHistory}
                paymentDeadline={trackingResult.paymentDeadline}
              />
            </View>
          </UnifiedCard>

          {trackingResult.statusHistory && trackingResult.statusHistory.length > 0 ? (
            <UnifiedCard variant="outlined" padding="large" style={styles.historyCard}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>Status history</Text>
              {trackingResult.statusHistory.map((item, index) => (
                <View key={index} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.historyContent}>
                    <Text style={[styles.historyStatusText, { color: colors.text }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                    {item.comment ? (
                      <Text style={[styles.historyComment, { color: colors.textSecondary }]}>{item.comment}</Text>
                    ) : null}
                    <Text style={[styles.historyTimestamp, { color: colors.textMuted }]}>
                      {formatHistoryTimestamp(item.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </UnifiedCard>
          ) : null}

          <View style={styles.actionButtons}>
            <UnifiedButton
              label="Check again"
              onPress={fetchStatus}
              variant="primary"
              size="medium"
              iconName="refresh-outline"
              iconPosition="left"
              fullWidth
              style={styles.actionButton}
            />
            <UnifiedButton
              label="Back to My Applications"
              onPress={() => navigation.navigate('MyApplications')}
              variant="outline"
              size="medium"
              iconName="list-outline"
              iconPosition="left"
              fullWidth
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl * 2,
    },
    resultSection: { width: '100%' },
    resultHeader: { marginBottom: spacing.lg, paddingBottom: spacing.md },
    refLabel: { ...typography.caption, marginBottom: spacing.xs },
    refValue: { ...typography.body, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    statusBadgeWrap: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: spacing.lg,
    },
    statusBadgeText: { ...typography.body, fontWeight: '600' },
    infoBlock: {
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      marginBottom: spacing.lg,
    },
    infoLabel: { ...typography.caption, marginBottom: spacing.xs },
    infoValue: { ...typography.body, lineHeight: 22 },
    payBlock: {
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      marginBottom: spacing.lg,
    },
    payButton: { marginBottom: spacing.sm },
    payHint: { ...typography.caption },
    stepperWrap: { paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
    stepperTitle: { ...typography.h5, marginBottom: spacing.md },
    historyCard: { marginTop: spacing.lg },
    historyTitle: { ...typography.h5, marginBottom: spacing.lg },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    historyDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md, marginTop: 6 },
    historyContent: { flex: 1 },
    historyStatusText: { ...typography.body, fontWeight: '600', marginBottom: 2 },
    historyComment: { ...typography.caption, marginBottom: 2 },
    historyTimestamp: { ...typography.caption },
    actionButtons: { flexDirection: 'column', width: '100%', marginTop: spacing.xxl, gap: spacing.sm },
    actionButton: { width: '100%' },
  });
}

ApplicationStatusScreen.options = { headerShown: false };
