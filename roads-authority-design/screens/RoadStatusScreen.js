import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { ScreenContainer, SearchBar } from '../components';
import { ROAD_STATUS, STATUS_LABELS, STATUS_COLORS } from '../data/roadStatus';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const VIEW_LIST = 'list';
const VIEW_MAP = 'map';

const NAMIBIA_REGION = {
  latitude: -22.0,
  longitude: 17.0,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

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
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function RoadStatusScreen({ onBack }) {
  const [viewMode, setViewMode] = useState(VIEW_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoadForMap, setSelectedRoadForMap] = useState(null);
  const mapRef = useRef(null);
  const filteredRoads = useMemo(() => filterRoads(ROAD_STATUS, searchQuery), [searchQuery]);

  useEffect(() => {
    if (viewMode === VIEW_MAP && selectedRoadForMap && mapRef.current) {
      const region = {
        latitude: selectedRoadForMap.lat,
        longitude: selectedRoadForMap.lng,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      };
      mapRef.current.animateToRegion(region, 400);
    }
  }, [viewMode, selectedRoadForMap]);

  const handleNavigateToMap = (road) => {
    setSelectedRoadForMap(road);
    setViewMode(VIEW_MAP);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.title}>Road status</Text>
      <Text style={styles.subtitle}>
        Check status of national roads. Tap List or Map to switch view.
      </Text>

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, viewMode === VIEW_LIST && styles.toggleBtnActive]}
          onPress={() => setViewMode(VIEW_LIST)}
        >
          <Ionicons name="list-outline" size={20} color={viewMode === VIEW_LIST ? NEUTRAL_COLORS.white : NEUTRAL_COLORS.gray600} />
          <Text style={[styles.toggleText, viewMode === VIEW_LIST && styles.toggleTextActive]}>List</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, viewMode === VIEW_MAP && styles.toggleBtnActive]}
          onPress={() => { setSelectedRoadForMap(null); setViewMode(VIEW_MAP); }}
        >
          <Ionicons name="map-outline" size={20} color={viewMode === VIEW_MAP ? NEUTRAL_COLORS.white : NEUTRAL_COLORS.gray600} />
          <Text style={[styles.toggleText, viewMode === VIEW_MAP && styles.toggleTextActive]}>Map</Text>
        </Pressable>
      </View>

      <SearchBar
        placeholder="Search by road name or region"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {viewMode === VIEW_LIST ? (
        <View style={styles.list}>
          {filteredRoads.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="trail-sign-outline" size={48} color={NEUTRAL_COLORS.gray400} />
              <Text style={styles.emptyText}>No roads match your search.</Text>
            </View>
          ) : (
            filteredRoads.map((road) => (
              <View key={road.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="trail-sign-outline" size={22} color={PRIMARY} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.roadName}>{road.name}</Text>
                    <Text style={styles.region}>{road.region}</Text>
                    <StatusBadge status={road.status} />
                  </View>
                </View>
                {road.notes ? <Text style={styles.notes}>{road.notes}</Text> : null}
                <Pressable
                  style={styles.navigateButton}
                  onPress={() => handleNavigateToMap(road)}
                >
                  <Ionicons name="navigate-outline" size={20} color={NEUTRAL_COLORS.white} style={styles.navBtnIcon} />
                  <Text style={styles.navigateButtonText}>Navigate</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={NAMIBIA_REGION}
            showsUserLocation={false}
          >
            {filteredRoads.map((road) => (
              <Marker
                key={road.id}
                coordinate={{ latitude: road.lat, longitude: road.lng }}
                title={road.name}
                description={`${STATUS_LABELS[road.status] || road.status} • ${road.notes || ''}`}
                pinColor={STATUS_COLORS[road.status] || PRIMARY}
              />
            ))}
          </MapView>
          <View style={styles.mapLegend}>
            <Text style={styles.legendTitle}>Status</Text>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <View key={key} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[key] || NEUTRAL_COLORS.gray500 }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const { width } = Dimensions.get('window');

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
  toggleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: NEUTRAL_COLORS.gray100,
    gap: spacing.sm,
  },
  toggleBtnActive: {
    backgroundColor: PRIMARY,
  },
  toggleText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray600,
  },
  toggleTextActive: {
    color: NEUTRAL_COLORS.white,
  },
  list: {
    marginTop: spacing.sm,
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
  cardTop: {
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
  roadName: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
  },
  region: {
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
  notes: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.sm,
    marginLeft: 48 + spacing.md,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  navBtnIcon: {
    marginRight: spacing.sm,
  },
  navigateButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  mapWrap: {
    marginTop: spacing.md,
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLegend: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  legendTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray800,
    marginBottom: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
  },
});
