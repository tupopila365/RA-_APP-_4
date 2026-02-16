import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  PLN_TRACKING_STAGES,
  PLN_TRACKING_STAGE_LABELS,
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

/**
 * PLN tracking timeline: vertical steps (Submitted → Under review → Approved/Rejected).
 * Completed = all steps up to and including current status.
 */
function PLNTrackingTimeline({ application }) {
  const status = application?.status || 'submitted';
  const isRejected = status === 'rejected';
  const stages = isRejected
    ? ['submitted', 'under_review', 'rejected']
    : PLN_TRACKING_STAGES;
  const currentIndex = stages.indexOf(status);
  const completedIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <View style={timelineStyles.container}>
      <Text style={timelineStyles.title}>Progress</Text>
      {stages.map((stage, index) => {
        const isCompleted = index <= completedIndex;
        const isCurrent = stage === status;
        const isLast = index === stages.length - 1;
        const label = PLN_TRACKING_STAGE_LABELS[stage] || APPLICATION_STATUS_LABELS[stage] || stage;
        const color = APPLICATION_STATUS_COLORS[stage] || (isRejected && stage === 'rejected' ? APPLICATION_STATUS_COLORS.rejected : PRIMARY);
        return (
          <View key={stage} style={timelineStyles.stepRow}>
            <View style={timelineStyles.leftCol}>
              <View
                style={[
                  timelineStyles.dot,
                  isCompleted && { backgroundColor: color },
                  isCurrent && !isCompleted && { borderColor: color, borderWidth: 3, backgroundColor: NEUTRAL_COLORS.white },
                ]}
              >
                {isCompleted ? <Ionicons name="checkmark" size={14} color={NEUTRAL_COLORS.white} /> : null}
              </View>
              {!isLast && <View style={[timelineStyles.line, index < completedIndex && { backgroundColor: color }]} />}
            </View>
            <View style={timelineStyles.rightCol}>
              <Text style={[timelineStyles.stepLabel, (isCurrent || isCompleted) && { color: NEUTRAL_COLORS.gray900 }]}>
                {label}
              </Text>
              {isCurrent && application?.nextSteps ? (
                <Text style={timelineStyles.stepComment}>{application.nextSteps}</Text>
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
    borderRadius: 12,
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
  stepLabel: { ...typography.body, fontWeight: '600', color: NEUTRAL_COLORS.gray600 },
  stepComment: { ...typography.caption, color: NEUTRAL_COLORS.gray600, marginTop: 2 },
});

export function ApplicationDetailScreen({ application, onBack }) {
  if (!application) return null;

  const statusLabel = APPLICATION_STATUS_LABELS[application.status] || application.status;
  const statusColor = APPLICATION_STATUS_COLORS[application.status] || NEUTRAL_COLORS.gray500;
  const showPlnTracking = isPlnApplication(application);

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
        {application.nextSteps && (
          <View style={styles.nextStepsBlock}>
            <Text style={styles.nextStepsLabel}>Next steps</Text>
            <Text style={styles.nextStepsValue}>{application.nextSteps}</Text>
          </View>
        )}
        {showPlnTracking && <PLNTrackingTimeline application={application} />}
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
    borderRadius: 12,
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
    borderRadius: 8,
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
});
