import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '../data/myApplications';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isPlnApplication(application) {
  return application?.type && String(application.type).toLowerCase().includes('pln');
}

function normalizeStatus(s) {
  return (s || '').toLowerCase().replace(/\s+/g, '_');
}

/**
 * Progress timeline built from backend statusHistory.
 * Each entry shows: status label, timestamp, comment (if any), changedBy (if any).
 * If statusHistory is empty, shows a single step for current status.
 */
function PLNTrackingTimeline({ application }) {
  const rawHistory = application?.statusHistory;
  const currentStatus = application?.status || 'submitted';

  const entries = React.useMemo(() => {
    if (Array.isArray(rawHistory) && rawHistory.length > 0) {
      return rawHistory
        .map((entry) => ({
          status: normalizeStatus(entry.status),
          label: APPLICATION_STATUS_LABELS[normalizeStatus(entry.status)] || entry.status || '—',
          timestamp: entry.timestamp,
          comment: entry.comment,
          changedBy: entry.changedBy,
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    return [
      {
        status: currentStatus,
        label: APPLICATION_STATUS_LABELS[currentStatus] || currentStatus,
        timestamp: application?.submittedAt || new Date().toISOString(),
        comment: application?.nextSteps || null,
        changedBy: null,
      },
    ];
  }, [rawHistory, currentStatus, application?.submittedAt, application?.nextSteps]);

  return (
    <View style={timelineStyles.container}>
      <Text style={timelineStyles.title}>Progress</Text>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const color = APPLICATION_STATUS_COLORS[entry.status] || PRIMARY;
        return (
          <View key={`${entry.status}-${entry.timestamp}-${index}`} style={timelineStyles.stepRow}>
            <View style={timelineStyles.leftCol}>
              <View style={[timelineStyles.dot, { backgroundColor: color }]}>
                <Ionicons name="checkmark" size={14} color={NEUTRAL_COLORS.white} />
              </View>
              {!isLast && <View style={[timelineStyles.line, { backgroundColor: color }]} />}
            </View>
            <View style={timelineStyles.rightCol}>
              <Text style={[timelineStyles.stepLabel, { color: NEUTRAL_COLORS.gray900 }]}>
                {entry.label}
              </Text>
              <Text style={timelineStyles.stepDate}>{formatDate(entry.timestamp)}</Text>
              {entry.changedBy ? (
                <Text style={timelineStyles.stepMeta}>By {entry.changedBy}</Text>
              ) : null}
              {entry.comment ? (
                <Text style={timelineStyles.stepComment}>{entry.comment}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  container: { marginTop: spacing.lg },
  title: { ...typography.h5, color: NEUTRAL_COLORS.gray900, marginBottom: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  leftCol: { alignItems: 'center', width: 24, marginRight: spacing.md },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 0,
    backgroundColor: NEUTRAL_COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: NEUTRAL_COLORS.gray300,
    marginTop: 2,
  },
  rightCol: { flex: 1, paddingBottom: spacing.md },
  stepLabel: { ...typography.body, fontWeight: '600', color: NEUTRAL_COLORS.gray900 },
  stepDate: { ...typography.caption, color: NEUTRAL_COLORS.gray500, marginTop: 2 },
  stepMeta: { ...typography.caption, color: NEUTRAL_COLORS.gray500, marginTop: 1 },
  stepComment: { ...typography.caption, color: NEUTRAL_COLORS.gray600, marginTop: 4 },
});

export function ApplicationDetailScreen({ application, onBack, onFindOffices, onPayOnline }) {
  if (!application) return null;

  const statusLabel = APPLICATION_STATUS_LABELS[application.status] || application.status;
  const statusColor = APPLICATION_STATUS_COLORS[application.status] || NEUTRAL_COLORS.gray500;
  const showPlnTracking = isPlnApplication(application);
  const isPaymentPending = application.status === 'payment_pending';

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.refLabel}>Reference</Text>
        <Text style={styles.referenceNumber} selectable>{application.referenceNumber}</Text>
        <View style={styles.meta}>
          <Text style={styles.type}>{application.type}</Text>
          <Text style={styles.date}>Submitted {formatDate(application.submittedAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        {application.nextSteps ? (
          <View style={styles.nextStepsBlock}>
            <Text style={styles.nextStepsLabel}>Next steps</Text>
            <Text style={styles.nextStepsValue}>{application.nextSteps}</Text>
          </View>
        ) : null}
        {application.paymentDeadline ? (
          <View style={styles.nextStepsBlock}>
            <Text style={styles.nextStepsLabel}>Payment deadline</Text>
            <Text style={styles.nextStepsValue}>{formatDate(application.paymentDeadline)}</Text>
          </View>
        ) : null}
        {application.paymentReceivedAt ? (
          <View style={styles.nextStepsBlock}>
            <Text style={styles.nextStepsLabel}>Payment received</Text>
            <Text style={styles.nextStepsValue}>{formatDate(application.paymentReceivedAt)}</Text>
          </View>
        ) : null}
        {application.trackingPin ? (
          <View style={styles.nextStepsBlock}>
            <Text style={styles.nextStepsLabel}>Tracking PIN</Text>
            <Text style={styles.nextStepsValue} selectable>{application.trackingPin}</Text>
          </View>
        ) : null}
        {isPaymentPending ? (
          <View style={styles.paymentBlock}>
            <Text style={styles.paymentBlockTitle}>Pay now</Text>
            <Text style={styles.paymentBlockHint}>Complete your payment by the deadline to continue processing.</Text>
            <Pressable style={styles.paymentButton} onPress={() => onPayOnline?.(application)}>
              <Ionicons name="card-outline" size={22} color={NEUTRAL_COLORS.white} />
              <Text style={styles.paymentButtonText}>Pay online</Text>
            </Pressable>
            <Pressable
              style={[styles.paymentButton, styles.paymentButtonSecondary]}
              onPress={() => onFindOffices?.()}
            >
              <Ionicons name="location-outline" size={22} color={PRIMARY} />
              <Text style={[styles.paymentButtonText, styles.paymentButtonTextSecondary]}>Pay in person</Text>
            </Pressable>
            <Text style={styles.paymentFooter}>
              Pay in person at any NaTIS or Roads Authority office. Use Find Offices to see locations.
            </Text>
          </View>
        ) : null}
        {showPlnTracking ? <PLNTrackingTimeline application={application} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  refLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginBottom: spacing.xs,
  },
  referenceNumber: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  meta: { marginBottom: spacing.md },
  type: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray600 },
  date: { ...typography.caption, color: NEUTRAL_COLORS.gray500, marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 0,
  },
  statusBadgeText: { ...typography.bodySmall, fontWeight: '600' },
  nextStepsBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
  nextStepsLabel: { ...typography.label, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.xs },
  nextStepsValue: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray700, lineHeight: 20 },
  paymentBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: NEUTRAL_COLORS.gray200,
  },
  paymentBlockTitle: { ...typography.h5, color: NEUTRAL_COLORS.gray900, marginBottom: spacing.xs },
  paymentBlockHint: { ...typography.bodySmall, color: NEUTRAL_COLORS.gray600, marginBottom: spacing.lg },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: PRIMARY,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 0,
    marginBottom: spacing.md,
  },
  paymentButtonSecondary: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  paymentButtonText: { ...typography.button, color: NEUTRAL_COLORS.white },
  paymentButtonTextSecondary: { ...typography.button, color: PRIMARY },
  paymentFooter: { ...typography.caption, color: NEUTRAL_COLORS.gray500, marginTop: spacing.sm },
});
