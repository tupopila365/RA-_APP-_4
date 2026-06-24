import React, { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { MY_REPORTS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../data/myReports';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function filterReports(reports, query) {
  if (!query || !query.trim()) return reports;
  const q = query.trim().toLowerCase();
  return reports.filter(
    (r) =>
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (REPORT_STATUS_LABELS[r.status] || '').toLowerCase().includes(q)
  );
}

function StatusBadge({ status }) {
  const label = REPORT_STATUS_LABELS[status] || status;
  const color = REPORT_STATUS_COLORS[status] || NEUTRAL_COLORS.gray500;
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function MyReportsScreen({ onSelectReport }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredReports = useMemo(() => filterReports(MY_REPORTS, searchQuery), [searchQuery]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SearchBar
        placeholder="Search report"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.list}>
        {filteredReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={44} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>No reports match your search.</Text>
          </View>
        ) : (
          filteredReports.map((report) => (
            <Pressable
              key={report.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onSelectReport?.(report)}
            >
              <View style={styles.imageWrap}>
                <Image source={{ uri: report.image }} style={styles.cardImage} resizeMode="cover" />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <StatusBadge status={report.status} />
                  <Text style={styles.date}>{formatDate(report.submittedAt)}</Text>
                </View>
                <Text style={styles.location}>{report.location}</Text>
                {report.description ? (
                  <Text style={styles.description} numberOfLines={2}>
                    {report.description}
                  </Text>
                ) : null}

                <View style={styles.viewRow}>
                  <Text style={styles.viewRowText}>View report</Text>
                  <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.md,
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
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: NEUTRAL_COLORS.gray800,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 400 / 220,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  date: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
  },
  location: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
  },
  description: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  viewRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  viewRowText: {
    ...typography.caption,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: spacing.xs,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  badgeText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
  },
});
