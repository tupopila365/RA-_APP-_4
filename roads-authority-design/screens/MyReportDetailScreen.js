import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { MY_REPORTS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../data/myReports';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusPill({ status }) {
  const label = REPORT_STATUS_LABELS[status] || status;
  const color = REPORT_STATUS_COLORS[status] || NEUTRAL_COLORS.gray500;
  return (
    <View style={[styles.statusPill, { backgroundColor: color + '18' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

function DetailRow({ iconName, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Ionicons name={iconName} size={18} color={PRIMARY} style={styles.detailIcon} />
      <View style={styles.detailBody}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export function MyReportDetailScreen({ report }) {
  const resolved = useMemo(() => {
    if (report?.id) {
      return MY_REPORTS.find((r) => r.id === report.id) || report;
    }
    return report || null;
  }, [report]);

  if (!resolved) {
    return (
      <ScreenContainer contentContainerStyle={styles.content}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Report not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: resolved.image }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <StatusPill status={resolved.status} />
          <Text style={styles.reference}>Report #{resolved.id}</Text>
        </View>

        <DetailRow
          iconName="time-outline"
          label="Submitted"
          value={formatDate(resolved.submittedAt)}
        />
        <DetailRow
          iconName="location-outline"
          label="Location"
          value={resolved.location}
        />
        <DetailRow
          iconName="document-text-outline"
          label="Description"
          value={resolved.description}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  emptyCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
  imageWrap: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reference: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailIcon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  detailBody: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    lineHeight: 20,
  },
});
