/**
 * Unified Map Component
 *
 * Single map import for RoadStatusScreen and Report Road Damage.
 * Consolidates RoadsMap + RoadworkMap with a redesigned enterprise UI.
 *
 * Usage:
 *   import MapComponent, { MAP_MODES, MARKER_TYPES, MapPrimitives } from '../components/MapComponent';
 *
 * - RoadStatusScreen: Use with polylines, custom children (route markers, waypoints)
 * - ReportPotholeScreen: Use with roadworks, selectedLocation, onMarkerDragEnd
 */

import React, { useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getSharedMapOptions } from '../theme/mapStyles';
import { spacing, radii, shadows, sizes } from '../theme/designTokens';

// Single react-native-maps import — used across the app
let MapView = null;
let Marker = null;
let Polyline = null;
let Circle = null;
let Callout = null;
let PROVIDER_GOOGLE = null;

try {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  Polyline = MapModule.Polyline;
  Circle = MapModule.Circle;
  Callout = MapModule.Callout;
  PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('MapView not available:', error.message);
}

export const isMapAvailable = !!MapView;
export const MapPrimitives = { MapView, Marker, Polyline, Circle, Callout, PROVIDER_GOOGLE };

export const MAP_MODES = {
  VIEW: 'view',
  NAVIGATE: 'navigate',
  SELECT: 'select',
};

export const MARKER_TYPES = {
  CLOSED: 'closed',
  WORK: 'work',
  ROUTE: 'route',
  USER_PIN: 'userPin',
  INFO: 'info',
};

const getMarkerVisuals = (type, colors) => {
  const palette = {
    [MARKER_TYPES.CLOSED]: { color: colors.error, icon: 'close-circle' },
    [MARKER_TYPES.WORK]: { color: colors.warning, icon: 'construct' },
    [MARKER_TYPES.ROUTE]: { color: colors.success, icon: 'navigate' },
    [MARKER_TYPES.USER_PIN]: { color: colors.primary, icon: 'pin' },
    [MARKER_TYPES.INFO]: { color: colors.info || colors.primary, icon: 'information-circle' },
  };
  return palette[type] || palette[MARKER_TYPES.INFO];
};

const getRoadworkCoordinates = (roadwork) => {
  if (roadwork.coordinates?.latitude && roadwork.coordinates?.longitude) {
    return { latitude: roadwork.coordinates.latitude, longitude: roadwork.coordinates.longitude };
  }
  if (roadwork.location?.coordinates?.length === 2) {
    return {
      latitude: roadwork.location.coordinates[1],
      longitude: roadwork.location.coordinates[0],
    };
  }
  if (roadwork.location?.latitude && roadwork.location?.longitude) {
    return { latitude: roadwork.location.latitude, longitude: roadwork.location.longitude };
  }
  return null;
};

const getStatusColor = (status) => {
  const map = {
    Open: '#059669',
    Ongoing: '#D97706',
    'Ongoing Maintenance': '#D97706',
    Planned: '#2563EB',
    'Planned Works': '#2563EB',
    Closed: '#DC2626',
    Restricted: '#DC2626',
    Completed: '#059669',
  };
  return map[status] || map[status?.replace(/\s+/g, ' ')] || '#6B7280';
};

const getStatusIcon = (status) => {
  const map = {
    Open: 'checkmark-circle',
    Ongoing: 'construct',
    'Ongoing Maintenance': 'construct',
    Planned: 'calendar',
    'Planned Works': 'calendar',
    Closed: 'close-circle',
    Restricted: 'alert-circle',
    Completed: 'checkmark-circle',
  };
  return map[status] || map[status?.replace(/\s+/g, ' ')] || 'information-circle-outline';
};

// Redesigned bottom sheet — enterprise aesthetic
const MapDetailSheet = ({ data, colors, onClose }) => {
  if (!data) return null;

  return (
    <View style={[styles.bottomSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.bottomSheetHeader}>
        <View style={[styles.statusBadge, { backgroundColor: (data.statusColor || colors.primary) + '18' }]}>
          <Ionicons
            name={data.statusIcon || 'information-circle'}
            size={sizes.iconLg}
            color={data.statusColor || colors.primary}
          />
        </View>
        <View style={styles.bottomSheetTitleGroup}>
          <Text style={[styles.bottomSheetTitle, { color: colors.text }]} numberOfLines={1}>
            {data.title}
          </Text>
          {!!data.status && (
            <Text style={[styles.bottomSheetStatus, { color: data.statusColor || colors.textSecondary }]}>
              {data.status}
            </Text>
          )}
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {data.description ? (
        <Text style={[styles.bottomSheetDescription, { color: colors.textSecondary }]} numberOfLines={3}>
          {data.description}
        </Text>
      ) : null}

      {Array.isArray(data.metadata) && data.metadata.length > 0 && (
        <View style={styles.metadataGrid}>
          {data.metadata.map((item) => (
            <View key={item.label} style={[styles.metadataItem, { backgroundColor: colors.background }]}>
              {item.iconName ? (
                <Ionicons name={item.iconName} size={sizes.iconSm} color={colors.textSecondary} />
              ) : null}
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.metadataValue, { color: colors.text }]} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data.primaryAction ? (
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={data.primaryAction.onPress}
          activeOpacity={0.85}
        >
          {data.primaryAction.iconName ? (
            <Ionicons name={data.primaryAction.iconName} size={sizes.iconMd} color="#FFFFFF" />
          ) : null}
          <Text style={styles.primaryButtonText}>{data.primaryAction.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

/**
 * MapComponent — unified map for Road Status and Report Roads
 *
 * @param mode - 'view' | 'select' | 'navigate'
 * @param initialRegion - { latitude, longitude, latitudeDelta, longitudeDelta }
 * @param roadworks - Array of roadwork objects (auto-converted to markers)
 * @param selectedLocation - { latitude, longitude } for draggable user pin
 * @param markers - Direct marker array (id, coordinate, title, description, type, ...)
 * @param polylines - Array of { id, coordinates, color, width, zIndex }
 * @param circles - Array of { id, center, radius, strokeColor, fillColor }
 * @param showRoadworks - Show roadwork markers (when roadworks provided)
 * @param showSelectedMarker - Show draggable pin (when selectedLocation provided)
 * @param markerTitle - Title for user pin
 * @param markerDescription - Description for user pin
 * @param onRegionChange - Callback when map region changes
 * @param onPress - Callback when map is tapped (select mode)
 * @param onMarkerDragEnd - Callback when user pin is dragged (receives { latitude, longitude })
 * @param onMarkerPress - Callback when marker is pressed
 * @param bottomSheetData - Override bottom sheet content
 * @param children - Custom MapView children (route markers, polylines, etc.)
 * @param showZoomControls - Show +/- zoom buttons
 * @param showsUserLocation - Show user location dot
 */
function MapComponentInner(props, ref) {
  const {
    mode = MAP_MODES.VIEW,
    initialRegion,
    roadworks = [],
    selectedLocation = null,
    markers: propMarkers = [],
    polylines = [],
    circles = [],
    showRoadworks = true,
    showSelectedMarker = true,
    markerTitle = 'Selected Location',
    markerDescription = 'Drag to adjust',
    onRegionChange,
    onPress,
    onSelectLocation,
    onMarkerDragEnd,
    onMarkerPress,
    bottomSheetData,
    children,
    showZoomControls = true,
    showsUserLocation = true,
    style,
  } = props;

  const handleLocationSelect = onPress || onSelectLocation;
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration) => mapRef.current?.animateToRegion?.(region, duration),
    getCamera: () => mapRef.current?.getCamera?.(),
  }), []);
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  const sharedMapOptions = useMemo(() => getSharedMapOptions(isDark), [isDark]);

  // Convert roadworks to markers when showRoadworks is true
  const roadworkMarkers = useMemo(() => {
    if (!showRoadworks || !roadworks?.length) return [];
    return roadworks
      .map((rw) => {
        const coords = getRoadworkCoordinates(rw);
        if (!coords) return null;
        const isCritical = rw.status === 'Closed' || rw.status === 'Restricted';
        const markerType = isCritical ? MARKER_TYPES.CLOSED : rw.status === 'Open' ? MARKER_TYPES.ROUTE : MARKER_TYPES.WORK;
        return {
          id: rw._id || rw.id || `rw-${rw.road}-${rw.section}`,
          coordinate: coords,
          title: `${rw.road || 'Road'} - ${rw.section || 'Section'}`,
          description: rw.title,
          status: rw.status,
          statusColor: getStatusColor(rw.status),
          statusIcon: getStatusIcon(rw.status),
          type: markerType,
          metadata: [
            { label: 'Status', value: rw.status, iconName: getStatusIcon(rw.status) },
            rw.updatedAt && {
              label: 'Updated',
              value: new Date(rw.updatedAt).toLocaleDateString(),
              iconName: 'time-outline',
            },
            rw.expectedDelayMinutes && {
              label: 'Delay',
              value: `${rw.expectedDelayMinutes} mins`,
              iconName: 'warning',
            },
          ].filter(Boolean),
          primaryAction: rw.primaryAction,
        };
      })
      .filter(Boolean);
  }, [roadworks, showRoadworks]);

  // User pin marker (Report Roads)
  const userPinMarker = useMemo(() => {
    if (!showSelectedMarker || !selectedLocation) return null;
    return {
      id: 'user-pin',
      coordinate: selectedLocation,
      title: markerTitle,
      description: markerDescription,
      type: MARKER_TYPES.USER_PIN,
    };
  }, [selectedLocation, showSelectedMarker, markerTitle, markerDescription]);

  // Combined markers: propMarkers + roadworkMarkers + userPinMarker
  const allMarkers = useMemo(() => {
    const combined = [...propMarkers];
    roadworkMarkers.forEach((m) => {
      if (!combined.some((c) => c.id === m.id)) combined.push(m);
    });
    if (userPinMarker) {
      const existing = combined.findIndex((m) => m.id === 'user-pin');
      if (existing >= 0) combined[existing] = userPinMarker;
      else combined.push(userPinMarker);
    }
    return combined;
  }, [propMarkers, roadworkMarkers, userPinMarker]);

  const activeMarker = useMemo(
    () => allMarkers.find((m) => m.id === activeMarkerId),
    [activeMarkerId, allMarkers]
  );

  const derivedBottomSheet = useMemo(() => {
    if (bottomSheetData) return bottomSheetData;
    if (!activeMarker) return null;
    const visuals = getMarkerVisuals(activeMarker.type, colors);
    const metadata = activeMarker.metadata || [];
    if (activeMarker.distanceKm) {
      metadata.push({ label: 'Distance', value: `${activeMarker.distanceKm} km`, iconName: 'navigate' });
    }
    if (activeMarker.dateLabel) {
      metadata.push({ label: 'Date', value: activeMarker.dateLabel, iconName: 'time-outline' });
    }
    return {
      title: activeMarker.title,
      description: activeMarker.description,
      status: activeMarker.status,
      statusColor: activeMarker.statusColor || visuals.color,
      statusIcon: activeMarker.statusIcon || visuals.icon,
      metadata,
      primaryAction: activeMarker.primaryAction,
    };
  }, [activeMarker, bottomSheetData, colors]);

  const handleMapPress = (event) => {
    if ((mode === MAP_MODES.SELECT || mode === MAP_MODES.NAVIGATE) && handleLocationSelect) {
      const coord = event?.nativeEvent?.coordinate;
      if (coord) handleLocationSelect(event);
    }
  };

  const handleMarkerPress = (marker) => {
    setActiveMarkerId(marker.id);
    onMarkerPress?.(marker);
  };

  const handleZoom = (delta) => {
    if (!mapRef.current?.getCamera) return;
    mapRef.current.getCamera().then((camera) => {
      const nextZoom = (camera.zoom || 0) + delta;
      mapRef.current?.animateCamera({ ...camera, zoom: nextZoom }, { duration: 180 });
    });
  };

  // Fallback when MapView unavailable (e.g. Expo Go)
  if (!MapView) {
    return (
      <View style={[styles.fallback, style]}>
        <View style={[styles.fallbackIconWrap, { backgroundColor: colors.card }]}>
          <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.fallbackTitle, { color: colors.text }]}>Map View</Text>
        <Text style={[styles.fallbackSubtitle, { color: colors.textSecondary }]}>
          Map requires a development build
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        onRegionChange={onRegionChange}
        provider={Platform.OS === 'android' && PROVIDER_GOOGLE ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        showsCompass
        showsScale
        zoomControlEnabled={false}
        zoomEnabled
        scrollEnabled
        toolbarEnabled={false}
        loadingEnabled
        {...sharedMapOptions}
      >
        {Polyline &&
          polylines.map((line) => (
            <Polyline
              key={line.id}
              coordinates={line.coordinates}
              strokeColor={line.color || colors.primary}
              strokeWidth={line.width || 4}
              zIndex={line.zIndex || 10}
              strokePattern={line.strokePattern}
            />
          ))}

        {Circle &&
          circles.map((c) => (
            <Circle
              key={c.id}
              center={c.center}
              radius={c.radius}
              strokeColor={c.strokeColor || colors.primary}
              fillColor={c.fillColor || `${colors.primary}20`}
              strokeWidth={c.strokeWidth ?? 1}
              lineDashPattern={c.lineDashPattern}
            />
          ))}

        {Marker &&
          allMarkers.map((marker) => {
            const visuals = getMarkerVisuals(marker.type, colors);
            const isUserPin = marker.type === MARKER_TYPES.USER_PIN;
            return (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                title={marker.title}
                description={marker.description}
                onPress={() => handleMarkerPress(marker)}
                draggable={isUserPin && !!onMarkerDragEnd}
                onDragEnd={(e) => {
                  const coord = e.nativeEvent?.coordinate || e;
                  onMarkerDragEnd?.({ latitude: coord.latitude, longitude: coord.longitude });
                }}
              >
                <View style={[styles.markerOuter, { backgroundColor: visuals.color }]}>
                  <Ionicons name={marker.iconName || visuals.icon} size={sizes.iconMd} color="#FFFFFF" />
                </View>
              </Marker>
            );
          })}

        {children}
      </MapView>

      {showZoomControls && (
        <View style={[styles.zoomControls, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => handleZoom(1)}
            accessibilityLabel="Zoom in"
          >
            <Ionicons name="add" size={sizes.iconLg} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => handleZoom(-1)}
            accessibilityLabel="Zoom out"
          >
            <Ionicons name="remove" size={sizes.iconLg} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <MapDetailSheet
        data={derivedBottomSheet}
        colors={colors}
        onClose={derivedBottomSheet ? () => setActiveMarkerId(null) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: spacing.xl,
  },
  fallbackIconWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fallbackSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  markerOuter: {
    width: sizes.markerMd,
    height: sizes.markerMd,
    borderRadius: sizes.markerMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.sm,
  },
  zoomControls: {
    position: 'absolute',
    right: spacing.md,
    top: 80,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.sm,
  },
  zoomButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    opacity: 0.6,
  },
  bottomSheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.md,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusBadge: {
    width: sizes.avatarSm,
    height: sizes.avatarSm,
    borderRadius: sizes.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheetTitleGroup: {
    flex: 1,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSheetStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  bottomSheetDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metadataItem: {
    minWidth: 110,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metadataLabel: {
    fontSize: 12,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

const MapComponent = forwardRef(MapComponentInner);
export default MapComponent;
