import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getSharedMapOptions } from '../theme/mapStyles';
import { spacing, radii, shadows, sizes } from '../theme/designTokens';

// Conditionally import MapView
let MapView = null;
let Marker = null;
let Polyline = null;
let Circle = null;
let PROVIDER_GOOGLE = null;
try {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  Polyline = MapModule.Polyline;
  Circle = MapModule.Circle;
  PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('MapView not available:', error.message);
}

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

const MapDetailSheet = ({ data, colors }) => {
  if (!data) return null;

  return (
    <View style={[styles.bottomSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.bottomSheetHeader}>
        <View style={[styles.statusIcon, { backgroundColor: (data.statusColor || colors.primary) + '20' }]}>
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
      </View>

      {data.description ? (
        <Text style={[styles.bottomSheetDescription, { color: colors.textSecondary }]}>
          {data.description}
        </Text>
      ) : null}

      {Array.isArray(data.metadata) && data.metadata.length > 0 && (
        <View style={styles.metadataGrid}>
          {data.metadata.map((item) => (
            <View key={item.label} style={[styles.metadataItem, { backgroundColor: colors.card }]}>
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

export default function RoadsMap({
  mode = MAP_MODES.VIEW,
  initialRegion,
  markers = [],
  polylines = [],
  circles = [],
  selectedMarkerId,
  onMarkerPress,
  onSelectLocation,
  onMarkerDragEnd,
  bottomSheetData,
  mapPadding,
  style,
  children,
  onRegionChange,
  showZoomControls = true,
  showsUserLocation = true,
}) {
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);
  const [activeMarkerId, setActiveMarkerId] = useState(selectedMarkerId || null);

  useEffect(() => {
    if (selectedMarkerId) setActiveMarkerId(selectedMarkerId);
  }, [selectedMarkerId]);

  const sharedMapOptions = useMemo(() => getSharedMapOptions(isDark), [isDark]);

  const activeMarker = useMemo(
    () => markers.find((marker) => marker.id === activeMarkerId),
    [activeMarkerId, markers]
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
    if (mode === MAP_MODES.SELECT && onSelectLocation) {
      onSelectLocation(event.nativeEvent.coordinate);
    }
  };

  const handleMarkerPress = (marker) => {
    setActiveMarkerId(marker.id);
    onMarkerPress?.(marker);
  };

  const handleZoom = (delta) => {
    if (!mapRef.current) return;
    mapRef.current.getCamera?.().then((camera) => {
      const nextZoom = (camera.zoom || 0) + delta;
      mapRef.current.animateCamera({ ...camera, zoom: nextZoom }, { duration: 180 });
    });
  };

  if (!MapView) {
    return (
      <View style={[styles.mapFallback, style]}>
        <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
          Map view requires a development build
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
        zoomControlEnabled
        zoomEnabled
        scrollEnabled
        toolbarEnabled={false}
        loadingEnabled
        mapPadding={mapPadding}
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
            />
          ))}

        {Circle &&
          circles.map((circle) => (
            <Circle
              key={circle.id}
              center={circle.center}
              radius={circle.radius}
              strokeColor={circle.strokeColor || colors.primary}
              fillColor={circle.fillColor || `${colors.primary}20`}
              strokeWidth={circle.strokeWidth || 1}
              lineDashPattern={circle.lineDashPattern}
            />
          ))}

        {Marker &&
          markers.map((marker) => {
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
                onDragEnd={(event) => onMarkerDragEnd?.(event.nativeEvent.coordinate)}
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

      <MapDetailSheet data={derivedBottomSheet} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  fallbackText: {
    marginTop: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    fontSize: 16,
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
    top: spacing.md,
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
  statusIcon: {
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
    minWidth: 120,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'transparent',
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

