import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Platform, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { getSharedMapOptions } from '../theme/mapStyles';

// Conditionally import MapView
let MapView = null;
let Marker = null;
let Callout = null;
let Circle = null;
let PROVIDER_GOOGLE = null;
try {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  Callout = MapModule.Callout;
  Circle = MapModule.Circle;
  PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('MapView not available:', error.message);
}

/**
 * Shared Roadwork Map Component
 * Used by both RoadStatusScreen and ReportPotholeScreen
 */
export function RoadworkMap({
  region,
  onRegionChange,
  onPress,
  roadworks = [],
  selectedLocation = null,
  onMarkerDragEnd,
  showRoadworks = true,
  showSelectedMarker = true,
  markerTitle = "Selected Location",
  markerDescription = "Drag to adjust",
  style,
  children,
}) {
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);
  const sharedMapOptions = useMemo(() => getSharedMapOptions(isDark), [isDark]);

  const getStatusColor = (status) => {
    const statusColors = {
      'Open': '#059669',
      'Ongoing': '#D97706',
      'Ongoing Maintenance': '#D97706',
      'Planned': '#2563EB',
      'Planned Works': '#2563EB',
      'Closed': '#DC2626',
      'Restricted': '#DC2626',
      'Completed': '#059669',
    };
    return statusColors[status] || statusColors[status?.replace(/\s+/g, ' ')] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Open': 'checkmark-circle',
      'Ongoing': 'construct',
      'Ongoing Maintenance': 'construct',
      'Planned': 'calendar',
      'Planned Works': 'calendar',
      'Closed': 'close-circle',
      'Restricted': 'alert-circle',
      'Completed': 'checkmark-circle',
    };
    return statusIcons[status] || statusIcons[status?.replace(/\s+/g, ' ')] || 'information-circle-outline';
  };

  const getRoadworkCoordinates = (roadwork) => {
    if (roadwork.coordinates?.latitude && roadwork.coordinates?.longitude) {
      return {
        latitude: roadwork.coordinates.latitude,
        longitude: roadwork.coordinates.longitude,
      };
    }
    
    if (roadwork.location?.latitude && roadwork.location?.longitude) {
      return {
        latitude: roadwork.location.latitude,
        longitude: roadwork.location.longitude,
      };
    }
    
    return null;
  };

  const handleRoadworkPress = (roadwork) => {
    Alert.alert(
      `${roadwork.road} - ${roadwork.section}`,
      `Status: ${roadwork.status}\n${roadwork.title}${roadwork.reason ? `\nReason: ${roadwork.reason}` : ''}`,
      [{ text: 'OK' }]
    );
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
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      initialRegion={region}
      onRegionChange={onRegionChange}
      onPress={onPress}
      provider={Platform.OS === 'android' && PROVIDER_GOOGLE ? PROVIDER_GOOGLE : undefined}
      {...sharedMapOptions}
      showsUserLocation={true}
      showsMyLocationButton={false}
      showsCompass={true}
      showsScale={true}
    >
      {/* Selected Location Marker */}
      {showSelectedMarker && selectedLocation && (
        <Marker
          coordinate={selectedLocation}
          title={markerTitle}
          description={markerDescription}
          draggable={!!onMarkerDragEnd}
          onDragEnd={onMarkerDragEnd}
          pinColor="#2563EB"
        />
      )}

      {/* Roadwork Markers */}
      {showRoadworks && roadworks.map((roadwork) => {
        const coordinates = getRoadworkCoordinates(roadwork);
        if (!coordinates) return null;

        const isCritical = roadwork.status === 'Closed' || roadwork.status === 'Restricted';
        const statusColor = getStatusColor(roadwork.status);

        return (
          <Marker
            key={roadwork._id || roadwork.id}
            coordinate={coordinates}
            onPress={() => handleRoadworkPress(roadwork)}
          >
            <View style={[styles.customMarker, { backgroundColor: statusColor }]}>
              <Ionicons 
                name={getStatusIcon(roadwork.status)} 
                size={16} 
                color="#FFFFFF" 
              />
            </View>
            <Callout onPress={() => handleRoadworkPress(roadwork)}>
              <View style={[styles.callout, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.calloutTitle, { color: colors.text }]}>
                  {roadwork.road} - {roadwork.section}
                </Text>
                <Text style={[styles.calloutDescription, { color: colors.text }]}>
                  {roadwork.title}
                </Text>
                <View style={styles.calloutStatus}>
                  <Ionicons 
                    name={getStatusIcon(roadwork.status)} 
                    size={12} 
                    color={statusColor} 
                  />
                  <Text style={[styles.calloutStatusText, { color: statusColor }]}>
                    {roadwork.status}
                  </Text>
                </View>
                <Text style={[styles.calloutTap, { color: colors.textSecondary }]}>
                  Tap for details
                </Text>
              </View>
            </Callout>
          </Marker>
        );
      })}

      {children}
    </MapView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontSize: 16,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  callout: {
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  calloutStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  calloutStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calloutTap: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default RoadworkMap;