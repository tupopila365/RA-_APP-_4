import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { MY_APPLICATIONS, APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../data/myApplications';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function filterApplications(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(
    (a) =>
      a.referenceNumber.toLowerCase().includes(q) ||
      (a.type && a.type.toLowerCase().includes(q)) ||
      (APPLICATION_STATUS_LABELS[a.status] || '').toLowerCase().includes(q)
  );
}

function StatusBadge({ status }) {
  const label = APPLICATION_STATUS_LABELS[status] || status;
  const color = APPLICATION_STATUS_COLORS[status] || NEUTRAL_COLORS.gray500;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function MyApplicationsScreen({ onBack, onSelectApplication }) {
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = useMemo(() => filterApplications(MY_APPLICATIONS, searchQuery), [searchQuery]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>My applications</Text>
      <Text style={styles.subtitle}>
        View your submitted applications by reference number.
      </Text>
      <SearchBar
        placeholder="Search by reference or status"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>No applications match your search.</Text>
          </View>
        ) : (
          filtered.map((app) => (
            <Pressable
              key={app.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onSelectApplication?.(app)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name="document-text-outline" size={24} color={PRIMARY} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.referenceNumber}>{app.referenceNumber}</Text>
                  <Text style={styles.type}>{app.type}</Text>
                  <StatusBadge status={app.status} />
                </View>
              </View>
              <Text style={styles.date}>Submitted {formatDate(app.submittedAt)}</Text>
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
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  referenceNumber: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.5,
  },
  type: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
    marginLeft: 48,
  },
});
