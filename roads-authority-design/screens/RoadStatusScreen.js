import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { ROAD_STATUS, ROAD_STATUS_LAST_UPDATED, STATUS_LABELS, STATUS_COLORS } from '../data/roadStatus';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

function filterRoads(roads, query) {
  if (!query || !query.trim()) return roads;
  const q = query.trim().toLowerCase();
  return roads.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q))
  );
}

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || NEUTRAL_COLORS.gray500;
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function SummaryPill({ label, count, color }) {
  return (
    <View style={[styles.pill, { borderColor: color + '40', backgroundColor: color + '14' }]}>
      <Text style={[styles.pillCount, { color }]}>{count}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

function formatLastUpdated(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last updated: --';
  return `Last updated: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function RoadStatusScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredRoads = useMemo(() => filterRoads(ROAD_STATUS, searchQuery), [searchQuery]);

  const handleNavigate = (road) => {
    const destination =
      road.lat != null && road.lng != null
        ? `${road.lat},${road.lng}`
        : encodeURIComponent(`${road.name}, ${road.region}, Namibia`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(url);
  };

  const openCount = ROAD_STATUS.filter((r) => r.status === 'open').length;
  const cautionCount = ROAD_STATUS.filter((r) => r.status === 'caution').length;
  const maintenanceCount = ROAD_STATUS.filter((r) => r.status === 'maintenance').length;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.summaryRow}>
        <SummaryPill label="Open" count={openCount} color={STATUS_COLORS.open} />
        <SummaryPill label="Caution" count={cautionCount} color={STATUS_COLORS.caution} />
        <SummaryPill label="Maintenance" count={maintenanceCount} color={STATUS_COLORS.maintenance} />
      </View>

      <SearchBar
        placeholder="Search road or region"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Text style={styles.lastUpdated}>{formatLastUpdated(ROAD_STATUS_LAST_UPDATED)}</Text>

      <View style={styles.list}>
        {filteredRoads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No roads match your search.</Text>
          </View>
        ) : (
          filteredRoads.map((road) => (
            <View key={road.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.roadName}>{road.name}</Text>
                <StatusBadge status={road.status} />
              </View>
              <Text style={styles.region}>{road.region}</Text>
              {road.notes ? <Text style={styles.note}>{road.notes}</Text> : null}
              <Pressable
                style={styles.navigateButton}
                onPress={() => handleNavigate(road)}
              >
                <Ionicons name="navigate-outline" size={20} color={NEUTRAL_COLORS.white} style={styles.navBtnIcon} />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </Pressable>
            </View>
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
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCount: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
  },
  pillLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
  },
  list: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  lastUpdated: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  roadName: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  region: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.xs,
  },
  note: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  badgeText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    marginTop: spacing.md,
  },
  navBtnIcon: {
    marginRight: spacing.sm,
  },
  navigateButtonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
  },
});
