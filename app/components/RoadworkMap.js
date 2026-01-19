import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import RoadsMap, { MAP_MODES, MARKER_TYPES } from './RoadsMap';

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
  const { colors } = useTheme();
  const [activeRoadworkId, setActiveRoadworkId] = useState(null);

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

  const roadworkMarkers = useMemo(() => {
    if (!showRoadworks) return [];
    return roadworks
      .map((roadwork) => {
        const coordinates = getRoadworkCoordinates(roadwork);
        if (!coordinates) return null;

        const isCritical = roadwork.status === 'Closed' || roadwork.status === 'Restricted';
        const markerType = isCritical
          ? MARKER_TYPES.CLOSED
          : roadwork.status === 'Open'
            ? MARKER_TYPES.ROUTE
            : MARKER_TYPES.WORK;

        return {
          id: roadwork._id || roadwork.id || `${roadwork.road}-${roadwork.section}`,
          coordinate: coordinates,
          title: `${roadwork.road} - ${roadwork.section || 'Section'}`,
          description: roadwork.title,
          status: roadwork.status,
          statusColor: getStatusColor(roadwork.status),
          statusIcon: getStatusIcon(roadwork.status),
          type: markerType,
          metadata: [
            { label: 'Status', value: roadwork.status, iconName: getStatusIcon(roadwork.status) },
            roadwork.updatedAt && {
              label: 'Updated',
              value: new Date(roadwork.updatedAt).toLocaleDateString(),
              iconName: 'time-outline',
            },
            roadwork.expectedDelayMinutes && {
              label: 'Delay',
              value: `${roadwork.expectedDelayMinutes} mins`,
              iconName: 'warning',
            },
          ].filter(Boolean),
          primaryAction: {
            label: 'View details',
            iconName: 'arrow-forward',
            onPress: () => handleRoadworkPress(roadwork),
          },
        };
      })
      .filter(Boolean);
  }, [roadworks, showRoadworks]);

  const userMarker = useMemo(() => {
    if (!showSelectedMarker || !selectedLocation) return null;
    return {
      id: 'selected-location',
      coordinate: selectedLocation,
      title: markerTitle,
      description: markerDescription,
      type: MARKER_TYPES.USER_PIN,
    };
  }, [markerDescription, markerTitle, selectedLocation, showSelectedMarker]);

  const markers = useMemo(() => {
    const combined = [...roadworkMarkers];
    if (userMarker) combined.push(userMarker);
    return combined;
  }, [roadworkMarkers, userMarker]);

  const bottomSheetData = useMemo(() => {
    if (!activeRoadworkId) return null;
    const active = roadworkMarkers.find((item) => item.id === activeRoadworkId);
    return active
      ? {
          title: active.title,
          description: active.description,
          status: active.status,
          statusColor: active.statusColor,
          statusIcon: active.statusIcon,
          metadata: active.metadata,
          primaryAction: active.primaryAction,
        }
      : null;
  }, [activeRoadworkId, roadworkMarkers]);

  return (
    <RoadsMap
      mode={onMarkerDragEnd || onPress ? MAP_MODES.SELECT : MAP_MODES.VIEW}
      initialRegion={region}
      onRegionChange={onRegionChange}
      onSelectLocation={onPress}
      onMarkerPress={(marker) => {
        if (marker.type !== MARKER_TYPES.USER_PIN) {
          setActiveRoadworkId(marker.id);
        }
      }}
      onMarkerDragEnd={onMarkerDragEnd}
      markers={markers}
      bottomSheetData={bottomSheetData}
      style={style}
    >
      {children}
    </RoadsMap>
  );
}

export default RoadworkMap;