import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { ScreenContainer, SearchBar } from '../components';
import { STATUS_LABELS, STATUS_COLORS } from '../data/roadStatus';
import { getRoadStatus } from '../services/roadStatusService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';

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
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function RoadStatusScreen({ onBack }) {
  const [viewMode, setViewMode] = useState(VIEW_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoadForMap, setSelectedRoadForMap] = useState(null);
  const [showFullMap, setShowFullMap] = useState(false);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const mapRef = useRef(null);
  const fullMapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getRoadStatus()
      .then((data) => { if (!cancelled) setRoads(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'Failed to load'); setRoads([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredRoads = useMemo(() => filterRoads(roads, searchQuery), [roads, searchQuery]);

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

  useEffect(() => {
    if (showFullMap && selectedRoadForMap && fullMapRef.current) {
      const region = {
        latitude: selectedRoadForMap.lat,
        longitude: selectedRoadForMap.lng,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      };
      const t = setTimeout(() => {
        fullMapRef.current?.animateToRegion?.(region, 400);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showFullMap, selectedRoadForMap]);

  const handleNavigateToMap = (road) => {
    setSelectedRoadForMap(road);
    setViewMode(VIEW_MAP);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
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

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading road status…</Text>
        </View>
      ) : loadError ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={48} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.emptyText}>{loadError}</Text>
        </View>
      ) : viewMode === VIEW_LIST ? (
        <View style={styles.list}>
          {filteredRoads.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="trail-sign-outline" size={48} color={NEUTRAL_COLORS.gray400} />
              <Text style={styles.emptyText}>No roads match your search.</Text>
            </View>
          ) : (
            filteredRoads.map((road) => (
              <View key={road.id} style={[styles.card, { borderLeftColor: STATUS_COLORS[road.status] || PRIMARY }]}>
                <Text style={styles.roadName} numberOfLines={2}>{road.name}</Text>
                <Text style={styles.regionLabel}>Region</Text>
                <Text style={styles.region}>{road.region}</Text>
                <Text style={styles.statusLabel}>Status</Text>
                <StatusBadge status={road.status} />
                {road.notes ? (
                  <View style={styles.notesWrap}>
                    <Text style={styles.notesLabel}>Note</Text>
                    <Text style={styles.notes}>{road.notes}</Text>
                  </View>
                ) : null}
                <Pressable
                  style={({ pressed }) => [styles.navigateButton, pressed && styles.navigateButtonPressed]}
                  onPress={() => handleNavigateToMap(road)}
                >
                  <Ionicons name="navigate-outline" size={18} color={NEUTRAL_COLORS.gray900} />
                  <Text style={styles.navigateButtonText}>Show on map</Text>
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
          <Pressable
            style={({ pressed }) => [styles.fullViewButton, pressed && styles.fullViewButtonPressed]}
            onPress={() => setShowFullMap(true)}
          >
            <Ionicons name="expand-outline" size={22} color={NEUTRAL_COLORS.gray800} />
            <Text style={styles.fullViewButtonText}>Full view</Text>
          </Pressable>
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

      <Modal
        visible={showFullMap}
        animationType="slide"
        onRequestClose={() => setShowFullMap(false)}
      >
        <View style={styles.fullMapContainer}>
          <View style={styles.fullMapHeader}>
            <Text style={styles.fullMapTitle}>Road status map</Text>
            <Pressable
              style={({ pressed }) => [styles.fullMapCloseButton, pressed && styles.fullMapCloseButtonPressed]}
              onPress={() => setShowFullMap(false)}
            >
              <Ionicons name="close" size={24} color={NEUTRAL_COLORS.gray800} />
              <Text style={styles.fullMapCloseText}>Close</Text>
            </Pressable>
          </View>
          <View style={styles.fullMapSearchWrap}>
            <SearchBar
              placeholder="Search by road name or region"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.fullMapWrap}>
            <MapView
              ref={fullMapRef}
              style={styles.fullMap}
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
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
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
    borderRadius: 0,
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
  loadingWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.md,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.md,
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
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderLeftWidth: 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: 0,
  },
  roadName: {
    fontSize: 16,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  regionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  region: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 0,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray100,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  notes: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RA_YELLOW,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  navigateButtonPressed: {
    opacity: 0.9,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
  },
  mapWrap: {
    marginTop: spacing.md,
    height: 320,
    borderRadius: 0,
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
    borderRadius: 0,
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
    borderRadius: 0,
    marginRight: spacing.sm,
  },
  legendText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
  },
  fullViewButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 0,
    gap: spacing.xs,
  },
  fullViewButtonPressed: {
    opacity: 0.9,
  },
  fullViewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray800,
  },
  fullMapContainer: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  fullMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl + 8,
    backgroundColor: NEUTRAL_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  fullMapTitle: {
    ...typography.h6,
    color: NEUTRAL_COLORS.gray900,
  },
  fullMapCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  fullMapCloseButtonPressed: {
    opacity: 0.8,
  },
  fullMapCloseText: {
    fontSize: 15,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray800,
  },
  fullMapSearchWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  fullMapWrap: {
    flex: 1,
    position: 'relative',
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
});
