import React, { useState, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { MY_REPORTS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../data/myReports';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function filterReports(reports, query) {
  if (!query || !query.trim()) return reports;
  const q = query.trim().toLowerCase();
  return reports.filter(
    (r) =>
      r.location.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (REPORT_STATUS_LABELS[r.status] || '').toLowerCase().includes(q)
  );
}

function StatusBadge({ status }) {
  const label = REPORT_STATUS_LABELS[status] || status;
  const color = REPORT_STATUS_COLORS[status] || NEUTRAL_COLORS.gray500;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function MyReportsScreen({ onBack, onSelectReport }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredReports = useMemo(() => filterReports(MY_REPORTS, searchQuery), [searchQuery]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>My reports</Text>
      <Text style={styles.subtitle}>
        Road damage reports you have submitted. Tap to view details.
      </Text>
      <SearchBar
        placeholder="Search by location or status"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
        {filteredReports.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={NEUTRAL_COLORS.gray400} />
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
                <View style={styles.badgeOverlay}>
                  <StatusBadge status={report.status} />
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.date}>{formatDate(report.submittedAt)}</Text>
                <Text style={styles.location}>{report.location}</Text>
                {report.description ? (
                  <Text style={styles.description} numberOfLines={2}>{report.description}</Text>
                ) : null}
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
    flexGrow: 1,
  },
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  list: {
    marginTop: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 400 / 260,
    backgroundColor: NEUTRAL_COLORS.gray200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  cardBody: {
    padding: spacing.lg,
  },
  date: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.body,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
  },
  description: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
