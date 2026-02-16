import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../data/myReports';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function MyReportDetailScreen({ report, onBack }) {
  if (!report) return null;

  const statusLabel = REPORT_STATUS_LABELS[report.status] || report.status;
  const statusColor = REPORT_STATUS_COLORS[report.status] || NEUTRAL_COLORS.gray500;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: report.image }} style={styles.image} resizeMode="cover" />
        <View style={[styles.statusBadge, { backgroundColor: statusColor + 'EE' }]}>
          <Text style={styles.statusBadgeText}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.reference}>Report #{report.id}</Text>
      <Text style={styles.date}>{formatDate(report.submittedAt)}</Text>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Ionicons name="location-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Location</Text>
        </View>
        <Text style={styles.sectionValue}>{report.location}</Text>
      </View>

      {report.description ? (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="document-text-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
            <Text style={styles.sectionLabel}>Description</Text>
          </View>
          <Text style={styles.sectionValue}>{report.description}</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  imageWrap: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
  },
  reference: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: NEUTRAL_COLORS.gray700,
  },
  sectionValue: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    lineHeight: 24,
    marginLeft: 28,
  },
});
