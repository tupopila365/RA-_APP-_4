import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  RefreshControl,
  Alert,
  Linking,
  Platform,
  Animated,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { radii, spacing, sizes, shadows } from '../theme/designTokens';
import { getSharedMapOptions } from '../theme/mapStyles';
import RoadsMap, { MAP_MODES, MARKER_TYPES } from '../components/RoadsMap';
import { UnifiedSkeletonLoader, ErrorState, EmptyState, SearchInput } from '../components';
import { roadStatusService } from '../services/roadStatusService';

// Conditionally import MapView
let MapView = null;
let Marker = null;
let Callout = null;
let Circle = null;
let Polyline = null;
let PROVIDER_GOOGLE = null;
try {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  Callout = MapModule.Callout;
  Circle = MapModule.Circle;
  Polyline = MapModule.Polyline;
  PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('MapView not available:', error.message);
}

// Conditionally import Location - fallback if not available
let Location = null;
try {
  Location = require('expo-location');
} catch (error) {
  console.warn('Location module not available:', error.message);
}

const getStatusColor = (status, colors) => {
  const statusColors = {
    'Open': colors.success,
    'Ongoing': colors.warning,
    'Ongoing Maintenance': colors.warning,
    'Planned': colors.info,
    'Planned Works': colors.info,
    'Closed': colors.error,
    'Restricted': colors.error,
    'Completed': colors.success,
  };
  return statusColors[status] || statusColors[status?.replace(/\s+/g, ' ')] || colors.textSecondary;
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Get coordinates from roadwork object
 * Checks multiple possible locations for coordinates
 */
const getRoadworkCoordinates = (roadwork) => {
  // PRIORITY 1: Direct coordinates (from admin or geocoding)
  if (roadwork.coordinates?.latitude && roadwork.coordinates?.longitude) {
    return {
      latitude: roadwork.coordinates.latitude,
      longitude: roadwork.coordinates.longitude,
    };
  }
  
  // PRIORITY 2: GeoJSON location field
  if (roadwork.location?.coordinates && Array.isArray(roadwork.location.coordinates)) {
    return {
      latitude: roadwork.location.coordinates[1], // GeoJSON is [lon, lat]
      longitude: roadwork.location.coordinates[0],
    };
  }
  
  // PRIORITY 3: Legacy location field (backwards compatibility)
  if (roadwork.location?.latitude && roadwork.location?.longitude) {
    return {
      latitude: roadwork.location.latitude,
      longitude: roadwork.location.longitude,
    };
  }
  
  return null;
};

/**
 * Geocode roadwork location using optimized search text
 * Uses pre-built searchText from backend if available
 */
const geocodeRoadworkLocation = async (roadwork) => {
  try {
    let searchQuery;
    
    // PREFERRED: Use pre-built searchText from backend
    if (roadwork.searchText) {
      searchQuery = roadwork.searchText;
    } else {
      // FALLBACK: Build search query manually
      searchQuery = [
        roadwork.road,
        roadwork.section,
        roadwork.area,
        roadwork.region,
        'Namibia'
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    }
    
    if (!searchQuery || searchQuery === 'Namibia') {
      return null;
    }
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Roads-Authority-App/1.0',
        },
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.warn('Geocoding failed:', error);
  }
  
  return null;
};

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a point is near a route (within tolerance distance)
 */
const isPointNearRoute = (point, routePolyline, toleranceKm = 5) => {
  if (!routePolyline || routePolyline.length === 0) return false;
  
  // Check distance from point to any segment of the route
  for (let i = 0; i < routePolyline.length - 1; i++) {
    const segmentStart = routePolyline[i];
    const segmentEnd = routePolyline[i + 1];
    
    // Calculate distance from point to line segment
    const distance = distanceToLineSegment(
      point.latitude,
      point.longitude,
      segmentStart.latitude,
      segmentStart.longitude,
      segmentEnd.latitude,
      segmentEnd.longitude
    );
    
    if (distance <= toleranceKm) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calculate distance from a point to a line segment
 */
const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  
  // Convert to km using Haversine
  const R = 6371;
  const dLat = dx * Math.PI / 180;
  const dLon = dy * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(px * Math.PI / 180) * Math.cos(xx * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Generate route polyline between two points (simple interpolation)
 * In production, this would use Google Directions API or OSRM
 */
const generateRoutePolyline = (start, end, steps = 50) => {
  const polyline = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    polyline.push({
      latitude: start.latitude + (end.latitude - start.latitude) * ratio,
      longitude: start.longitude + (end.longitude - start.longitude) * ratio,
    });
  }
  return polyline;
};

/**
 * Get route polyline color based on route type
 */
const getRouteColor = (route, isClosed = false, colors) => {
  if (isClosed) return colors.error;
  if (route?.isRecommended) return colors.success;
  return colors.textSecondary;
};

/**
 * Get route stroke pattern based on route type
 */
const getRouteStrokePattern = (route, isClosed = false) => {
  if (isClosed || route.isRecommended) {
    return []; // Solid line for closed roads and recommended routes
  }
  return [10, 5]; // Dashed line for other alternate routes
};

/**
 * Render polylines for road closure and alternate routes
 */
const renderRoutePolylines = (roadwork, colors) => {
  if (!Polyline) return null;

  const polylines = [];

  // Render closed road polyline (red)
  if (roadwork.roadClosure?.polylineCoordinates && roadwork.roadClosure.polylineCoordinates.length > 1) {
    polylines.push(
      <Polyline
        key={`closure-${roadwork._id}`}
        coordinates={roadwork.roadClosure.polylineCoordinates}
        strokeColor={getRouteColor(null, true, colors)}
        strokeWidth={4}
        strokePattern={getRouteStrokePattern(null, true)}
        zIndex={1000}
      />
    );
  }

  // Render alternate routes polylines
  if (roadwork.alternateRoutes && roadwork.alternateRoutes.length > 0) {
    roadwork.alternateRoutes.forEach((route, index) => {
      if (route.approved && route.polylineCoordinates && route.polylineCoordinates.length > 1) {
        polylines.push(
          <Polyline
            key={`route-${roadwork._id}-${index}`}
            coordinates={route.polylineCoordinates}
        strokeColor={getRouteColor(route, false, colors)}
            strokeWidth={route.isRecommended ? 4 : 3}
            strokePattern={getRouteStrokePattern(route)}
            zIndex={route.isRecommended ? 900 : 800}
            onPress={() => showRouteInfo(route)}
          />
        );
      }
    });
  }

  return polylines;
};

/**
 * Render waypoint markers for alternate routes
 */
const renderWaypointMarkers = (roadwork, colors) => {
  if (!Marker || !roadwork.alternateRoutes) return null;

  const markers = [];

  roadwork.alternateRoutes.forEach((route, routeIndex) => {
    if (route.approved && route.waypoints) {
      route.waypoints.forEach((waypoint, waypointIndex) => {
        markers.push(
          <Marker
            key={`waypoint-${roadwork._id}-${routeIndex}-${waypointIndex}`}
            coordinate={waypoint.coordinates}
            title={waypoint.name}
            description={`${route.routeName} - ${route.estimatedTime}`}
            pinColor={route.isRecommended ? colors.success : colors.textSecondary}
          >
            <View style={[
              styles.waypointMarker,
              { backgroundColor: route.isRecommended ? colors.success : colors.textSecondary }
            ]}>
              <Text style={styles.waypointText}>{waypointIndex + 1}</Text>
            </View>
          </Marker>
        );
      });
    }
  });

  return markers;
};

/**
 * Show route information in a modal or alert
 */
const showRouteInfo = (route) => {
  const vehicleTypes = route.vehicleType?.join(', ') || 'All vehicles';
  const roads = route.roadsUsed?.join(', ') || 'Various roads';
  
  Alert.alert(
    route.routeName,
    `Distance: ${route.distanceKm}km\nTime: ${route.estimatedTime}\nRoads: ${roads}\nVehicles: ${vehicleTypes}`,
    [
      { text: 'Get Directions', onPress: () => openExternalMap(route) },
      { text: 'Close', style: 'cancel' }
    ]
  );
};

/**
 * Open external map app with route waypoints
 */
const openExternalMap = (route) => {
  if (!route.waypoints || route.waypoints.length === 0) return;

  const start = route.waypoints[0].coordinates;
  const end = route.waypoints[route.waypoints.length - 1].coordinates;
  
  const url = Platform.select({
    ios: `maps:?saddr=${start.latitude},${start.longitude}&daddr=${end.latitude},${end.longitude}`,
    android: `google.navigation:q=${end.latitude},${end.longitude}&mode=d`,
  });

  if (url) {
    Linking.openURL(url).catch(err => {
      console.error('Error opening map:', err);
      Alert.alert('Error', 'Could not open map application');
    });
  }
};

/**
 * Extract location from alternative route text and geocode it
 * Tries to find road names, town names, or waypoints in the text
 */
const geocodeAlternativeRoute = async (alternativeRouteText) => {
  try {
    // Extract potential location names from the text
    // Look for patterns like "B2", "via Karibib", "at Otjiwarongo", etc.
    const text = alternativeRouteText.toLowerCase();
    
    // Common road prefixes in Namibia
    const roadPatterns = [
      /(?:use|via|route|road)\s+([a-z]\d+)/i,  // B2, C28, etc.
      /via\s+([a-z]+)/i,  // via Karibib
      /at\s+([a-z]+)/i,  // at Otjiwarongo
      /to\s+([a-z]+)/i,  // to Walvis Bay
    ];
    
    let searchTerms = [];
    
    // Extract road numbers
    const roadMatch = text.match(/(?:use|via|route|road)\s+([a-z]\d+)/i);
    if (roadMatch) {
      searchTerms.push(roadMatch[1].toUpperCase());
    }
    
    // Extract town names
    const townNames = [
      'karibib', 'otjiwarongo', 'kalkrand', 'swakopmund', 'walvis bay',
      'windhoek', 'okahandja', 'rehoboth', 'mariental', 'gobabis',
      'buitepos', 'rundu', 'katima mulilo', 'outjo', 'keetmanshoop',
      'lüderitz', 'oshakati', 'grootfontein', 'tsumeb', 'opuwo',
      'epupa falls', 'witvlei'
    ];
    
    for (const town of townNames) {
      if (text.includes(town)) {
        searchTerms.push(town);
        break; // Use the first matching town
      }
    }
    
    // If we found search terms, try to geocode
    if (searchTerms.length > 0) {
      const searchQuery = `${searchTerms.join(' ')} Namibia`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'Roads-Authority-App/1.0',
          },
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          label: searchTerms.join(' '),
        };
      }
    }
    
    // Fallback: try geocoding the entire alternative route text
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(alternativeRouteText + ' Namibia')}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Roads-Authority-App/1.0',
        },
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        label: alternativeRouteText,
      };
    }
  } catch (error) {
    console.warn('Alternative route geocoding failed:', error);
  }
  
  return null;
};

/**
 * Determine region from coordinates using reverse geocoding
 * Falls back to coordinate-based estimation if geocoding fails
 */
const getRegionFromLocation = async (latitude, longitude) => {
  try {
    // Try reverse geocoding first
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Roads-Authority-App/1.0',
        },
      }
    );
    
    const data = await response.json();
    const address = data.address || {};
    
    // Extract region from address
    const region = address.state || address.region || address.province || null;
    
    if (region) {
      // Map common region names to our region list
      const regionMap = {
        'Erongo': 'Erongo',
        'Hardap': 'Hardap',
        'Karas': 'ǁKaras',
        'ǁKaras': 'ǁKaras',
        'Kavango East': 'Kavango East',
        'Kavango West': 'Kavango West',
        'Khomas': 'Khomas',
        'Kunene': 'Kunene',
        'Ohangwena': 'Ohangwena',
        'Omaheke': 'Omaheke',
        'Omusati': 'Omusati',
        'Oshana': 'Oshana',
        'Oshikoto': 'Oshikoto',
        'Otjozondjupa': 'Otjozondjupa',
        'Zambezi': 'Zambezi',
        'Caprivi': 'Zambezi', // Old name
      };
      
      // Check if region matches any of our regions
      for (const [key, value] of Object.entries(regionMap)) {
        if (region.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(region.toLowerCase())) {
          return value;
        }
      }
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }
  
  // Fallback: approximate region based on coordinates
  // This is a simplified approach - can be improved with proper boundaries
  if (latitude >= -22.0 && latitude <= -17.0 && longitude >= 11.0 && longitude <= 16.0) {
    // Windhoek area - Khomas
    if (latitude >= -22.7 && latitude <= -22.4 && longitude >= 16.9 && longitude <= 17.2) {
      return 'Khomas';
    }
    // Approximate regions based on coordinates
    if (longitude >= 15.0) return 'Khomas';
    if (latitude <= -20.0) return 'Hardap';
    if (longitude <= 13.0) return 'Erongo';
  }
  
  return null;
};

/**
 * Parse alternative route text to extract road numbers and towns
 */
const parseAlternativeRoute = (text) => {
  if (!text) return { roads: [], towns: [] };
  
  // Extract road numbers (B2, C28, etc.)
  const roads = text.match(/\b[A-Z]\d+\b/g) || [];
  
  // Extract town names
  const townPatterns = [
    /via\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    /to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    /through\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
  ];
  
  const towns = [];
  townPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      towns.push(match[1]);
    }
  });
  
  return { 
    roads: [...new Set(roads)], // Remove duplicates
    towns: [...new Set(towns)]
  };
};

/**
 * Pulsing Marker Component for Critical Roadworks
 */
const PulsingMarker = ({ coordinate, roadwork, onPress, colors }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);
  
  const isCritical = roadwork.status === 'Closed' || 
                     roadwork.status === 'Restricted' || 
                     (roadwork.expectedDelayMinutes && roadwork.expectedDelayMinutes > 30);
  
  return (
    <Marker
      coordinate={coordinate}
      pinColor={isCritical ? colors.error : colors.warning}
      onPress={onPress}
    >
      <Animated.View
        style={{
          transform: [{ scale: isCritical ? pulseAnim : 1 }],
        }}
      >
        <View
          style={{
            backgroundColor: isCritical ? colors.error : colors.warning,
            padding: 8,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        >
          <Ionicons 
            name={isCritical ? 'close-circle' : 'warning'} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
      </Animated.View>
      <Callout onPress={onPress}>
        <View
          style={{
            backgroundColor: '#FFFFFF', // Solid white background
            borderRadius: 8,
            padding: 12,
            minWidth: 200,
            maxWidth: 250,
            borderWidth: 1,
            borderColor: colors.border,
            // Android-safe elevation
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              },
              android: {
                elevation: 2, // Reduced from 3 to 2
              },
            }),
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 4, color: colors.text }}>
            {roadwork.road} - {roadwork.section}
          </Text>
          <Text style={{ fontSize: 13, marginBottom: 8, color: colors.text }}>
            {roadwork.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons 
              name={isCritical ? 'close-circle' : 'information-circle'} 
              size={14} 
              color={isCritical ? colors.error : colors.warning} 
            />
            <Text style={{ fontSize: 12, color: isCritical ? colors.error : colors.warning, fontWeight: '600' }}>
              {roadwork.status}
            </Text>
          </View>
          {roadwork.expectedDelayMinutes && (
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
              Delay: {roadwork.expectedDelayMinutes} min
            </Text>
          )}
          <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 6, fontStyle: 'italic' }}>
            Tap for details
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

export default function RoadStatusScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const sharedMapOptions = useMemo(() => getSharedMapOptions(colorScheme === 'dark'), [colorScheme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const [roadworks, setRoadworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationBasedRegion, setLocationBasedRegion] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [mapRegion, setMapRegion] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedRoadworkForMap, setSelectedRoadworkForMap] = useState(null);
  const [modalMapRegion, setModalMapRegion] = useState(null);
  const [mapType, setMapType] = useState('standard'); // 'standard', 'satellite', 'hybrid'
  const [showTraffic, setShowTraffic] = useState(true);
  const mapModalRef = useRef(null);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'distance', 'date', 'status'
  const [savedRoadworks, setSavedRoadworks] = useState([]);
  
  // Route Planner State
  const [routePlannerMode, setRoutePlannerMode] = useState(false);
  const [routeStartPoint, setRouteStartPoint] = useState(null); // { latitude, longitude, name }
  const [routeEndPoint, setRouteEndPoint] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeRoadworks, setRouteRoadworks] = useState([]);
  const [selectingRoutePoint, setSelectingRoutePoint] = useState(null); // 'start' or 'end'
  const routePlannerMapRef = useRef(null);

  // Calculate route and filter roadworks when start/end points are set
  useEffect(() => {
    if (routePlannerMode && routeStartPoint && routeEndPoint) {
      // Generate route polyline
      const polyline = generateRoutePolyline(
        { latitude: routeStartPoint.latitude, longitude: routeStartPoint.longitude },
        { latitude: routeEndPoint.latitude, longitude: routeEndPoint.longitude }
      );
      setRoutePolyline(polyline);
      
      // Filter roadworks along the route
      const roadworksAlongRoute = roadworks.filter(roadwork => {
        const coords = getRoadworkCoordinates(roadwork);
        if (!coords) return false;
        return isPointNearRoute(coords, polyline, 5); // 5km tolerance
      });
      setRouteRoadworks(roadworksAlongRoute);
    } else {
      setRoutePolyline([]);
      setRouteRoadworks([]);
    }
  }, [routePlannerMode, routeStartPoint, routeEndPoint, roadworks]);

  // Handle map press for route point selection
  const handleRouteMapPress = (event) => {
    if (!routePlannerMode || !selectingRoutePoint) return;
    
    const { coordinate } = event.nativeEvent;
    const point = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      name: `Point ${selectingRoutePoint === 'start' ? 'A' : 'B'}`,
    };
    
    if (selectingRoutePoint === 'start') {
      setRouteStartPoint(point);
    } else {
      setRouteEndPoint(point);
    }
    setSelectingRoutePoint(null);
  };

  // Start route planning
  const startRoutePlanning = () => {
    setRoutePlannerMode(true);
    setViewMode('map');
    if (userLocation) {
      setRouteStartPoint({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        name: 'My Location',
      });
    }
  };

  // Clear route planning
  const clearRoutePlanning = () => {
    setRoutePlannerMode(false);
    setRouteStartPoint(null);
    setRouteEndPoint(null);
    setRoutePolyline([]);
    setRouteRoadworks([]);
    setSelectingRoutePoint(null);
  };

  // Navigate the planned route
  const navigatePlannedRoute = () => {
    if (!routeStartPoint || !routeEndPoint) return;
    
    const url = Platform.select({
      ios: `maps:?saddr=${routeStartPoint.latitude},${routeStartPoint.longitude}&daddr=${routeEndPoint.latitude},${routeEndPoint.longitude}&dirflg=d`,
      android: `google.navigation:q=${routeEndPoint.latitude},${routeEndPoint.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&origin=${routeStartPoint.latitude},${routeStartPoint.longitude}&destination=${routeEndPoint.latitude},${routeEndPoint.longitude}`,
    });
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&origin=${routeStartPoint.latitude},${routeStartPoint.longitude}&destination=${routeEndPoint.latitude},${routeEndPoint.longitude}`
          );
        }
      })
      .catch((err) => {
        console.error('Error opening navigation:', err);
        Alert.alert('Error', 'Could not open navigation app.');
      });
  };

  const statusFilters = ['Open', 'Ongoing', 'Planned', 'Closed'];
  const regions = [
    'Erongo',
    'Hardap',
    'ǁKaras',
    'Kavango East',
    'Kavango West',
    'Khomas',
    'Kunene',
    'Ohangwena',
    'Omaheke',
    'Omusati',
    'Oshana',
    'Oshikoto',
    'Otjozondjupa',
    'Zambezi',
  ];
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchRoadStatus();
    requestLocationPermission(false); // Silent request on mount
  }, []);

  // Auto-select region when location is detected
  useEffect(() => {
    if (locationBasedRegion && !selectedRegion) {
      setSelectedRegion(locationBasedRegion);
    }
  }, [locationBasedRegion]);

  // Initialize map region when roadworks or user location is available
  useEffect(() => {
    if (viewMode === 'map' && !mapRegion) {
      if (userLocation) {
        // Center on user's location
        setMapRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 2.0,
          longitudeDelta: 2.0,
        });
      } else if (filteredRoadworks.length > 0) {
        // Center on first roadwork with coordinates
        const roadworkWithCoords = filteredRoadworks.find(rw => getRoadworkCoordinates(rw));
        if (roadworkWithCoords) {
          const coords = getRoadworkCoordinates(roadworkWithCoords);
          setMapRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 2.0,
            longitudeDelta: 2.0,
          });
        } else {
          // Default to center of Namibia (Windhoek area)
          setMapRegion({
            latitude: -22.5597,
            longitude: 17.0832,
            latitudeDelta: 8.0,
            longitudeDelta: 8.0,
          });
        }
      } else {
        // Default to center of Namibia
        setMapRegion({
          latitude: -22.5597,
          longitude: 17.0832,
          latitudeDelta: 8.0,
          longitudeDelta: 8.0,
        });
      }
    }
  }, [viewMode, userLocation, filteredRoadworks]);

  // Request location permission and get current location
  const requestLocationPermission = async (showAlert = false) => {
    try {
      if (!Location) {
        console.warn('Location module not available');
        return false;
      }

      // Check current permission status first
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      if (currentStatus === 'granted') {
        // Permission already granted, just get location
        try {
          setIsDetectingLocation(true);
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 10000,
          });
          
          const location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
          
          setUserLocation(location);
          
          // Determine region from location
          const region = await getRegionFromLocation(location.latitude, location.longitude);
          if (region) {
            setLocationBasedRegion(region);
          }
          
          setIsDetectingLocation(false);
          return true;
        } catch (locationError) {
          console.error('Error getting location:', locationError);
          setIsDetectingLocation(false);
          if (showAlert) {
            Alert.alert(
              'Location Error',
              'We couldn\'t get your current location. You can still filter by region manually.',
              [{ text: 'OK' }]
            );
          }
          return false;
        }
      }

      if (currentStatus === 'denied') {
        if (showAlert) {
          Alert.alert(
            'Location Permission Required',
            'To automatically filter by your region, we need your location. Please enable location access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }
        return false;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        if (showAlert) {
          Alert.alert(
            'Location Permission',
            'Location access is optional but helps us show you roadworks in your region. You can still filter manually.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }

      // Get current location
      try {
        setIsDetectingLocation(true);
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        });

        const location = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        
        setUserLocation(location);
        
        // Determine region from location
        const region = await getRegionFromLocation(location.latitude, location.longitude);
        if (region) {
          setLocationBasedRegion(region);
        }
        
        setIsDetectingLocation(false);
        return true;
      } catch (locationError) {
        console.error('Error getting location:', locationError);
        setIsDetectingLocation(false);
        if (showAlert) {
          Alert.alert(
            'Location Error',
            'We couldn\'t get your location. You can still filter by region manually.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsDetectingLocation(false);
      return false;
    }
  };

  const fetchRoadStatus = async () => {
    try {
      setError(null);
      const data = await roadStatusService.getRoadStatus(searchQuery);
      setRoadworks(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching road status:', err);
      setError(err.message || 'Failed to load road status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoadStatus();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchRoadStatus();
  };

  // Load saved roadworks from AsyncStorage on mount
  useEffect(() => {
    const loadSavedRoadworks = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const saved = await AsyncStorage.getItem('savedRoadworks');
        if (saved) {
          setSavedRoadworks(JSON.parse(saved));
        }
      } catch (error) {
        console.warn('Failed to load saved roadworks:', error);
      }
    };
    loadSavedRoadworks();
  }, []);

  const toggleSaveRoadwork = async (roadwork) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const roadworkId = roadwork._id || roadwork.id;
      let updated = [...savedRoadworks];
      
      if (savedRoadworks.includes(roadworkId)) {
        updated = updated.filter(id => id !== roadworkId);
        Alert.alert('Removed', 'Roadwork removed from saved items');
      } else {
        updated.push(roadworkId);
        Alert.alert('Saved', 'Roadwork saved for quick access');
      }
      
      setSavedRoadworks(updated);
      await AsyncStorage.setItem('savedRoadworks', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save roadwork:', error);
      Alert.alert('Error', 'Failed to save roadwork');
    }
  };

  const handleShareRoadwork = async (roadwork) => {
    try {
      const coords = getRoadworkCoordinates(roadwork);
      const locationText = coords 
        ? `Location: https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
        : `${roadwork.road}${roadwork.area ? `, ${roadwork.area}` : ''}`;
      
      const message = `${roadwork.title || 'Road Maintenance'}\n\n` +
        `Road: ${roadwork.road}${roadwork.section ? ` - ${roadwork.section}` : ''}\n` +
        `Status: ${roadwork.status}\n` +
        `Area: ${roadwork.area || 'N/A'}\n` +
        `${locationText}\n\n` +
        `View in Roads Authority App`;
      
      await Share.share({
        message,
        title: roadwork.title || 'Road Status',
      });
    } catch (error) {
      console.error('Error sharing roadwork:', error);
    }
  };

  const handleViewOnMap = async (roadwork) => {
    // First check if roadwork has direct coordinates
    let coordinates = getRoadworkCoordinates(roadwork);
    
    // If no coordinates, try to geocode from road/area
    if (!coordinates) {
      coordinates = await geocodeRoadworkLocation(roadwork);
    }
    
    if (!coordinates) {
      Alert.alert(
        'No Location Data',
        'This roadwork does not have precise location coordinates. Please use the road name and area information to find it on a map.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Show in-app map modal with colored indicators
    setSelectedRoadworkForMap({...roadwork, coordinates});
    setModalMapRegion({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: 0.0005, // Street-level detail (~55m view, zoom 17-18)
      longitudeDelta: 0.0005,
    });
    setShowMapModal(true);
  };

  const openExternalMaps = async (roadwork, coordinates) => {
    const label = encodeURIComponent(
      `${roadwork.road || 'Roadwork'} - ${roadwork.title || 'Road Maintenance'}`
    );
    
    // Open in device's default maps app
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${coordinates.latitude},${coordinates.longitude}`,
      android: `geo:0,0?q=${coordinates.latitude},${coordinates.longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`,
    });
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          return Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
          );
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
  };

  const handleZoomIn = () => {
    if (mapModalRef.current && modalMapRegion) {
      const newRegion = {
        ...modalMapRegion,
        latitudeDelta: modalMapRegion.latitudeDelta / 2,
        longitudeDelta: modalMapRegion.longitudeDelta / 2,
      };
      setModalMapRegion(newRegion);
      mapModalRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleZoomOut = () => {
    if (mapModalRef.current && modalMapRegion) {
      const newRegion = {
        ...modalMapRegion,
        latitudeDelta: modalMapRegion.latitudeDelta * 2,
        longitudeDelta: modalMapRegion.longitudeDelta * 2,
      };
      setModalMapRegion(newRegion);
      mapModalRef.current.animateToRegion(newRegion, 300);
    }
  };

  const handleDirections = async (roadwork) => {
    // First check if roadwork has direct coordinates
    let coordinates = getRoadworkCoordinates(roadwork);
    
    // If no coordinates, try to geocode from road/area
    if (!coordinates) {
      coordinates = await geocodeRoadworkLocation(roadwork);
    }
    
    if (!coordinates) {
      Alert.alert(
        'No Location Data',
        'This roadwork does not have precise location coordinates. Please use the road name and area information to find it on a map.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const label = encodeURIComponent(
      `${roadwork.road || 'Roadwork'} - ${roadwork.title || 'Road Maintenance'}`
    );
    
    // Open in navigation mode (directions from current location)
    const url = Platform.select({
      ios: `maps:?daddr=${label}@${coordinates.latitude},${coordinates.longitude}&dirflg=d`,
      android: `google.navigation:q=${coordinates.latitude},${coordinates.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`,
    });
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web with directions
          return Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`
          );
        }
      })
      .catch((err) => {
        console.error('Error opening directions:', err);
        // Fallback to regular map view
        handleViewOnMap(roadwork);
      });
  };

  /**
   * Handle navigation for structured alternate route with waypoints
   */
  const handleStructuredRoute = async (route) => {
    try {
      if (!route.waypoints || route.waypoints.length === 0) {
        Alert.alert('No Route Data', 'This route does not have waypoint information.');
        return;
      }

      const start = route.waypoints[0].coordinates;
      const end = route.waypoints[route.waypoints.length - 1].coordinates;
      
      // Build waypoints string for navigation
      const waypoints = route.waypoints.slice(1, -1).map(wp => 
        `${wp.coordinates.latitude},${wp.coordinates.longitude}`
      ).join('|');
      
      // Open in navigation mode with waypoints
      const url = Platform.select({
        ios: waypoints 
          ? `maps:?saddr=${start.latitude},${start.longitude}&daddr=${end.latitude},${end.longitude}&waypoints=${waypoints}`
          : `maps:?daddr=${end.latitude},${end.longitude}&dirflg=d`,
        android: waypoints
          ? `google.navigation:q=${end.latitude},${end.longitude}&waypoints=${waypoints}`
          : `google.navigation:q=${end.latitude},${end.longitude}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${end.latitude},${end.longitude}${waypoints ? `&waypoints=${waypoints}` : ''}`,
      });
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            // Fallback to Google Maps web
            return Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${end.latitude},${end.longitude}${waypoints ? `&waypoints=${waypoints}` : ''}`
            );
          }
        })
        .catch((err) => {
          console.error('Error opening route navigation:', err);
          Alert.alert('Error', 'Could not open navigation app.');
        });
    } catch (error) {
      console.error('Error handling structured route:', error);
      Alert.alert('Error', 'Could not process route navigation.');
    }
  };

  const handleAlternativeRoute = async (alternativeRouteText) => {
    try {
      // Geocode the alternative route (fallback for legacy text routes)
      const routeInfo = await geocodeAlternativeRoute(alternativeRouteText);
      
      if (!routeInfo) {
        Alert.alert(
          'Route Not Found',
          'Could not find the alternative route location. Please use the route description to navigate manually.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const label = encodeURIComponent(routeInfo.label || 'Alternative Route');
      
      // Open in navigation mode (directions from current location)
      const url = Platform.select({
        ios: `maps:?daddr=${label}@${routeInfo.latitude},${routeInfo.longitude}&dirflg=d`,
        android: `google.navigation:q=${routeInfo.latitude},${routeInfo.longitude}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${routeInfo.latitude},${routeInfo.longitude}`,
      });
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            // Fallback to Google Maps web with directions
            return Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${routeInfo.latitude},${routeInfo.longitude}`
            );
          }
        })
        .catch((err) => {
          console.error('Error opening alternative route directions:', err);
          Alert.alert(
            'Error',
            'Could not open navigation. Please use the route description to navigate manually.',
            [{ text: 'OK' }]
          );
        });
    } catch (error) {
      console.error('Error handling alternative route:', error);
      Alert.alert(
        'Error',
        'Could not process alternative route. Please use the route description to navigate manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const filteredRoadworks = useMemo(() => {
    let filtered = roadworks;

    if (selectedStatus) {
      filtered = filtered.filter((rw) => rw.status === selectedStatus);
    }

    if (selectedRegion) {
      filtered = filtered.filter(
        (rw) =>
          rw.region?.toLowerCase() === selectedRegion.toLowerCase() ||
          rw.area?.toLowerCase().includes(selectedRegion.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rw) =>
          rw.title?.toLowerCase().includes(query) ||
          rw.road?.toLowerCase().includes(query) ||
          rw.section?.toLowerCase().includes(query) ||
          rw.area?.toLowerCase().includes(query) ||
          rw.region?.toLowerCase().includes(query)
      );
    }

    // Calculate distance for each roadwork if user location is available
    if (userLocation) {
      filtered = filtered.map(rw => {
        const coords = getRoadworkCoordinates(rw);
        if (coords) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            coords.latitude,
            coords.longitude
          );
          return { ...rw, distanceKm: distance };
        }
        return rw;
      });
    }

    // Sort based on selected sort option
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!userLocation) return 0;
          const distA = a.distanceKm ?? Infinity;
          const distB = b.distanceKm ?? Infinity;
          return distA - distB;
        
        case 'date':
          const dateA = new Date(a.startDate || a.createdAt || 0);
          const dateB = new Date(b.startDate || b.createdAt || 0);
          return dateB - dateA; // Newest first
        
        case 'status':
          const statusOrder = { 'Closed': 0, 'Restricted': 1, 'Ongoing': 2, 'Planned': 3, 'Open': 4 };
          return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
        
        case 'relevance':
        default:
          // Critical roadworks first, then by distance if available
          const aCritical = a.status === 'Closed' || a.status === 'Restricted' || (a.expectedDelayMinutes && a.expectedDelayMinutes > 30);
          const bCritical = b.status === 'Closed' || b.status === 'Restricted' || (b.expectedDelayMinutes && b.expectedDelayMinutes > 30);
          if (aCritical && !bCritical) return -1;
          if (!aCritical && bCritical) return 1;
          if (userLocation && a.distanceKm && b.distanceKm) {
            return a.distanceKm - b.distanceKm;
          }
          return 0;
      }
    });

    return filtered;
  }, [roadworks, searchQuery, selectedStatus, selectedRegion, userLocation, sortBy]);

  const styles = getStyles(colors, screenHeight, screenWidth);

  const isInitialLoading = loading && roadworks.length === 0;
  const isEmpty = filteredRoadworks.length === 0;
  const showEmptyState = !isInitialLoading && isEmpty;

  // Show error state if initial load fails (moved after all hooks)
  if (error && roadworks.length === 0 && !loading) {
    return (
      <ErrorState
        message={error || 'Failed to load road status'}
        onRetry={handleRetry}
        fullScreen
      />
    );
  }

  const formatLastUpdated = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Separate critical/high-impact roadworks
  const criticalRoadworks = useMemo(() => {
    return filteredRoadworks.filter(rw => 
      rw.status === 'Closed' || 
      rw.status === 'Restricted' ||
      (rw.expectedDelayMinutes && rw.expectedDelayMinutes > 30)
    );
  }, [filteredRoadworks]);

  const normalRoadworks = useMemo(() => {
    return filteredRoadworks.filter(rw => 
      rw.status !== 'Closed' && 
      rw.status !== 'Restricted' &&
      (!rw.expectedDelayMinutes || rw.expectedDelayMinutes <= 30)
    );
  }, [filteredRoadworks]);

  const mapModalMarkers = useMemo(() => {
    if (!selectedRoadworkForMap?.coordinates) return [];
    const coord = selectedRoadworkForMap.coordinates;
    return [
      {
        id: selectedRoadworkForMap._id || selectedRoadworkForMap.id || 'selected-roadwork',
        coordinate: { latitude: coord.latitude, longitude: coord.longitude },
        title: selectedRoadworkForMap.road || 'Roadwork',
        description: selectedRoadworkForMap.title,
        status: selectedRoadworkForMap.status,
        statusColor: getStatusColor(selectedRoadworkForMap.status, colors),
        statusIcon: getStatusIcon(selectedRoadworkForMap.status),
        type: ['Closed', 'Restricted'].includes(selectedRoadworkForMap.status)
          ? MARKER_TYPES.CLOSED
          : MARKER_TYPES.WORK,
        metadata: [
          selectedRoadworkForMap.section && { label: 'Section', value: selectedRoadworkForMap.section, iconName: 'pin' },
          selectedRoadworkForMap.startDate && { label: 'Start', value: formatDate(selectedRoadworkForMap.startDate), iconName: 'calendar-outline' },
          selectedRoadworkForMap.expectedCompletion && { label: 'Expected', value: formatDate(selectedRoadworkForMap.expectedCompletion), iconName: 'flag-outline' },
        ].filter(Boolean),
        primaryAction: {
          label: 'Get Directions',
          iconName: 'navigate',
          onPress: () => handleDirections(selectedRoadworkForMap),
        },
      },
    ];
  }, [colors, selectedRoadworkForMap]);

  const mapModalCircles = useMemo(() => {
    if (!selectedRoadworkForMap?.coordinates) return [];
    const coord = selectedRoadworkForMap.coordinates;
    return [
      {
        id: 'affected-area',
        center: { latitude: coord.latitude, longitude: coord.longitude },
        radius: 500,
        fillColor: getStatusColor(selectedRoadworkForMap.status, colors) + '10',
        strokeColor: getStatusColor(selectedRoadworkForMap.status, colors),
        strokeWidth: 1.5,
        lineDashPattern: [5, 5],
      },
    ];
  }, [colors, selectedRoadworkForMap]);

  const mapModalBottomSheetData = useMemo(() => {
    if (!selectedRoadworkForMap) return null;
    return {
      title: selectedRoadworkForMap.road || 'Roadwork',
      status: selectedRoadworkForMap.status,
      statusColor: getStatusColor(selectedRoadworkForMap.status, colors),
      statusIcon: getStatusIcon(selectedRoadworkForMap.status),
      description: selectedRoadworkForMap.title,
      metadata: [
        selectedRoadworkForMap.section && { label: 'Section', value: selectedRoadworkForMap.section, iconName: 'pin' },
        selectedRoadworkForMap.startDate && { label: 'Start', value: formatDate(selectedRoadworkForMap.startDate), iconName: 'calendar-outline' },
        selectedRoadworkForMap.expectedCompletion && { label: 'Expected', value: formatDate(selectedRoadworkForMap.expectedCompletion), iconName: 'flag-outline' },
      ].filter(Boolean),
      primaryAction: {
        label: 'Get Directions',
        iconName: 'navigate',
        onPress: () => handleDirections(selectedRoadworkForMap),
      },
    };
  }, [colors, selectedRoadworkForMap]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {/* Map View Mode - Full Screen Map */}
      {viewMode === 'map' && !isInitialLoading && (
        !MapView ? (
          <View style={styles.mapUnavailableContainer}>
            <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.mapUnavailableTitle}>
              Map View Not Available
            </Text>
            <Text style={styles.mapUnavailableText}>
              Map view requires a development build and is not available in Expo Go.
            </Text>
            <TouchableOpacity
              style={styles.mapUnavailableButton}
              onPress={() => setViewMode('list')}
            >
              <Text style={styles.mapUnavailableButtonText}>Switch to List View</Text>
            </TouchableOpacity>
          </View>
        ) : mapRegion ? (
          <View style={styles.mapFullScreenContainer}>
            {/* Map Header with View Toggle */}
            <View style={styles.mapHeader}>
              <TouchableOpacity
                style={styles.mapHeaderButton}
                onPress={() => setViewMode('list')}
                accessibilityLabel="Switch to list view"
              >
                <Ionicons name="list" size={20} color={colors.text} />
                <Text style={styles.mapHeaderButtonText}>List View</Text>
              </TouchableOpacity>
              <View style={styles.mapHeaderTitle}>
                <Text style={styles.mapHeaderTitleText}>Road Status Map</Text>
                <Text style={styles.mapHeaderSubtitle}>
                  {filteredRoadworks.filter(rw => getRoadworkCoordinates(rw)).length} roadwork{filteredRoadworks.filter(rw => getRoadworkCoordinates(rw)).length !== 1 ? 's' : ''} shown
                </Text>
              </View>
            </View>
            <RoadsMap
              mode={routePlannerMode ? MAP_MODES.NAVIGATE : MAP_MODES.VIEW}
              initialRegion={mapRegion}
              onSelectLocation={routePlannerMode ? handleRouteMapPress : undefined}
              showsUserLocation={true}
              polylines={
                routePlannerMode && routePolyline.length > 0
                  ? [
                      {
                        id: 'route-planned',
                        coordinates: routePolyline,
                        color: colors.info,
                        width: 4,
                        zIndex: 100,
                      },
                    ]
                  : []
              }
              style={styles.mapFullScreen}
            >
              {/* Route Planner: Start and End Point Markers */}
              {routePlannerMode && routeStartPoint && Marker && (
                <Marker
                  coordinate={routeStartPoint}
                  title="Start Point"
                  description={routeStartPoint.name}
                  pinColor={colors.success}
                >
                  <View style={styles.routePointMarker}>
                    <View style={[styles.routePointInner, { backgroundColor: colors.success }]}>
                      <Text style={styles.routePointText}>A</Text>
                    </View>
                  </View>
                </Marker>
              )}
              {routePlannerMode && routeEndPoint && Marker && (
                <Marker
                  coordinate={routeEndPoint}
                  title="End Point"
                  description={routeEndPoint.name}
                  pinColor={colors.error}
                >
                  <View style={styles.routePointMarker}>
                    <View style={[styles.routePointInner, { backgroundColor: colors.error }]}>
                      <Text style={styles.routePointText}>B</Text>
                    </View>
                  </View>
                </Marker>
              )}

              {/* Render polylines for road closures and alternate routes */}
              {filteredRoadworks.map((roadwork) => renderRoutePolylines(roadwork, colors))}
              
              {/* Render waypoint markers for alternate routes */}
              {filteredRoadworks.map((roadwork) => renderWaypointMarkers(roadwork, colors))}
              
              {/* Render main roadwork markers - Highlight roadworks along route in planner mode */}
              {(routePlannerMode ? routeRoadworks : filteredRoadworks).map((roadwork) => {
                const coordinates = getRoadworkCoordinates(roadwork);
                if (!coordinates) return null;
                
                const isOnRoute = routePlannerMode && routeRoadworks.includes(roadwork);
                
                return (
                  <PulsingMarker
                    key={roadwork._id || roadwork.id}
                    coordinate={coordinates}
                    roadwork={roadwork}
                    colors={colors}
                    onPress={() => {
                      // Show details with alternate routes information
                      const alternateRoutesText = roadwork.alternateRoutes && roadwork.alternateRoutes.length > 0
                        ? `\n\nAlternate Routes:\n${roadwork.alternateRoutes
                            .filter(route => route.approved)
                            .map(route => `• ${route.routeName}: ${route.distanceKm}km, ${route.estimatedTime}`)
                            .join('\n')}`
                        : roadwork.alternativeRoute 
                          ? `\nAlternative Route:\n${roadwork.alternativeRoute}`
                          : '';
                          
                      Alert.alert(
                        `${roadwork.road} - ${roadwork.section}${isOnRoute ? ' (On Your Route)' : ''}`,
                        `${roadwork.title}\n\nStatus: ${roadwork.status}\n${roadwork.reason ? `Reason: ${roadwork.reason}\n` : ''}${roadwork.expectedDelayMinutes ? `Expected Delay: ${roadwork.expectedDelayMinutes} min\n` : ''}${alternateRoutesText}`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Directions', onPress: () => handleDirections(roadwork) },
                          roadwork.alternativeRoute && {
                            text: 'Use Alternative Route',
                            onPress: () => handleAlternativeRoute(roadwork.alternativeRoute)
                          },
                        ].filter(Boolean)
                      );
                    }}
                  />
                );
              })}
            </RoadsMap>
          
          {/* Route Planner Controls */}
          {routePlannerMode && (
            <View style={styles.routePlannerControls}>
              <View style={styles.routePlannerHeader}>
                <Text style={styles.routePlannerTitle}>Plan Your Route</Text>
                <TouchableOpacity onPress={clearRoutePlanning} style={styles.routePlannerCloseButton}>
                  <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.routePlannerPoints}>
                <TouchableOpacity
                  style={[styles.routePointButton, !routeStartPoint && styles.routePointButtonActive]}
                  onPress={() => setSelectingRoutePoint('start')}
                >
                  <Ionicons name="location" size={20} color={routeStartPoint ? colors.success : colors.primary} />
                  <View style={styles.routePointInfo}>
                    <Text style={styles.routePointLabel}>Start Point</Text>
                    <Text style={styles.routePointValue}>
                      {routeStartPoint ? routeStartPoint.name : 'Tap to select'}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.routePointButton, !routeEndPoint && selectingRoutePoint === 'end' && styles.routePointButtonActive]}
                  onPress={() => setSelectingRoutePoint('end')}
                >
                  <Ionicons name="flag" size={20} color={routeEndPoint ? colors.error : colors.primary} />
                  <View style={styles.routePointInfo}>
                    <Text style={styles.routePointLabel}>End Point</Text>
                    <Text style={styles.routePointValue}>
                      {routeEndPoint ? routeEndPoint.name : 'Tap to select'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {selectingRoutePoint && (
                <View style={styles.routePlannerHint}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                  <Text style={styles.routePlannerHintText}>
                    Tap on the map to set {selectingRoutePoint === 'start' ? 'start' : 'end'} point
                  </Text>
                </View>
              )}
              
              {routeStartPoint && routeEndPoint && (
                <View style={styles.routePlannerResults}>
                  <Text style={styles.routePlannerResultsTitle}>
                    Road Status Along Route
                  </Text>
                  <Text style={styles.routePlannerResultsCount}>
                    {routeRoadworks.length} roadwork{routeRoadworks.length !== 1 ? 's' : ''} found
                  </Text>
                  {routeRoadworks.length > 0 && (
                    <View style={styles.routePlannerAlerts}>
                      {routeRoadworks.filter(rw => rw.status === 'Closed' || rw.status === 'Restricted').length > 0 && (
                        <View style={styles.routePlannerAlert}>
                          <Ionicons name="warning" size={16} color={colors.error} />
                          <Text style={styles.routePlannerAlertText}>
                            {routeRoadworks.filter(rw => rw.status === 'Closed' || rw.status === 'Restricted').length} critical roadwork{routeRoadworks.filter(rw => rw.status === 'Closed' || rw.status === 'Restricted').length !== 1 ? 's' : ''} on route
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.routePlannerNavigateButton}
                    onPress={navigatePlannedRoute}
                  >
                    <Ionicons name="navigate" size={20} color="#FFFFFF" />
                    <Text style={styles.routePlannerNavigateButtonText}>Navigate Route</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          {/* Map Legend Overlay */}
          <View style={styles.mapLegendOverlay}>
            <View style={styles.mapLegendItem}>
              <View style={[styles.mapLegendMarker, { backgroundColor: colors.error }]}>
                <Ionicons name="close-circle" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.mapLegendText}>Closed Road</Text>
            </View>
            <View style={styles.mapLegendItem}>
              <View style={[styles.mapLegendMarker, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.mapLegendText}>Recommended Route</Text>
            </View>
            <View style={styles.mapLegendItem}>
              <View style={[styles.mapLegendMarker, { backgroundColor: '#6B7280' }]}>
                <Ionicons name="ellipsis-horizontal" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.mapLegendText}>Alternate Route</Text>
            </View>
            <View style={styles.mapLegendItem}>
              <View style={[styles.mapLegendMarker, { backgroundColor: colors.warning }]}>
                <Ionicons name="warning" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.mapLegendText}>Ongoing Work</Text>
            </View>
          </View>

          {/* Results Count on Map */}
          {!routePlannerMode && (
            <View style={styles.mapResultsOverlay}>
              <Text style={styles.mapResultsText}>
                {filteredRoadworks.filter(rw => getRoadworkCoordinates(rw)).length} roadwork{filteredRoadworks.filter(rw => getRoadworkCoordinates(rw)).length !== 1 ? 's' : ''} on map
              </Text>
            </View>
          )}

          {/* Route Planner Button */}
          {!routePlannerMode && (
            <TouchableOpacity
              style={styles.routePlannerButton}
              onPress={startRoutePlanning}
            >
              <Ionicons name="navigate" size={24} color="#FFFFFF" />
              <Text style={styles.routePlannerButtonText}>Plan Route</Text>
            </TouchableOpacity>
          )}
        </View>
        ) : null
      )}
      
      {/* List View Mode - Scrollable Content */}
      {viewMode === 'list' && (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* View Mode Toggle */}
        {!isInitialLoading && roadworks.length > 0 && (
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'list' && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('list')}
              accessibilityLabel="Switch to list view"
              accessibilityRole="button"
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.viewToggleText,
                  viewMode === 'list' && { color: '#FFFFFF', fontWeight: '600' }
                ]}
              >
                List View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'map' && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('map')}
              accessibilityLabel="Switch to map view"
              accessibilityRole="button"
            >
              <Ionicons 
                name="map" 
                size={20} 
                color={viewMode === 'map' ? '#FFFFFF' : colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.viewToggleText,
                  viewMode === 'map' && { color: '#FFFFFF', fontWeight: '600' }
                ]}
              >
                Map View
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Legend */}
        {!isInitialLoading && roadworks.length > 0 && viewMode === 'list' && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Status Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Open - Normal traffic flow</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.legendText}>Ongoing - Expect delays</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
                <Text style={styles.legendText}>Planned - Scheduled</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={styles.legendText}>Closed - Use alternative</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search Input */}
        {!isInitialLoading && !isEmpty && viewMode === 'list' && (
          <View style={styles.searchInputContainer}>
            <SearchInput
              placeholder="Search road name, area, or location..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery('')}
              style={styles.searchInput}
              accessibilityLabel="Search road status"
              accessibilityHint="Search by road name, area, or title"
            />
          </View>
        )}

        {/* Sort Selector */}
        {!isInitialLoading && roadworks.length > 0 && viewMode === 'list' && (
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortOptions}
            >
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'distance', label: 'Distance', disabled: !userLocation },
                { value: 'date', label: 'Date' },
                { value: 'status', label: 'Status' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortChip,
                    sortBy === option.value && styles.sortChipActive,
                    option.disabled && styles.sortChipDisabled,
                  ]}
                  onPress={() => !option.disabled && setSortBy(option.value)}
                  disabled={option.disabled}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${option.label}${option.disabled ? ' (disabled)' : ''}`}
                  accessibilityState={{ selected: sortBy === option.value, disabled: option.disabled }}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortBy === option.value && styles.sortChipTextActive,
                      option.disabled && styles.sortChipTextDisabled,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Status Filter Chips */}
        {!isInitialLoading && roadworks.length > 0 && viewMode === 'list' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === null && styles.filterChipActive,
              ]}
              onPress={() => setSelectedStatus(null)}
              accessibilityRole="button"
              accessibilityLabel="Show all statuses"
              accessibilityState={{ selected: selectedStatus === null }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === null && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {statusFilters.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  selectedStatus === status && styles.filterChipActive,
                ]}
                onPress={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                accessibilityRole="button"
                accessibilityLabel={`Filter by status: ${status}`}
                accessibilityState={{ selected: selectedStatus === status }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Region Filter */}
        {!isInitialLoading && roadworks.length > 0 && viewMode === 'list' && (
          <View style={styles.regionFilterSection}>
            <View style={styles.regionFilterHeader}>
              <Text style={styles.regionFilterTitle}>Filter by Region</Text>
              {isDetectingLocation && (
                <View style={styles.locationDetectingContainer}>
                  <UnifiedSkeletonLoader type="text-line" style={{ width: 16, height: 16, borderRadius: 8 }} />
                  <Text style={styles.locationDetectingText}>Detecting your location...</Text>
                </View>
              )}
              {locationBasedRegion && selectedRegion === locationBasedRegion && (
                <View style={styles.locationBasedFilterContainer}>
                  <Ionicons name="location" size={14} color={colors.primary} />
                  <Text style={styles.locationBasedFilterText}>
                    Filtered by your location
                  </Text>
                </View>
              )}
              {!locationBasedRegion && !isDetectingLocation && (
                <TouchableOpacity
                  style={styles.useLocationButton}
                  onPress={() => requestLocationPermission(true)}
                  accessibilityLabel="Use my location to filter"
                  accessibilityRole="button"
                >
                  <Ionicons name="location-outline" size={16} color={colors.primary} />
                  <Text style={styles.useLocationButtonText}>Use My Location</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedRegion === null && styles.filterChipActive,
                ]}
                onPress={() => setSelectedRegion(null)}
                accessibilityRole="button"
                accessibilityLabel="Show all regions"
                accessibilityState={{ selected: selectedRegion === null }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedRegion === null && styles.filterChipTextActive,
                  ]}
                >
                  All Regions
                </Text>
              </TouchableOpacity>
              {regions.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.filterChip,
                    selectedRegion === region && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedRegion(selectedRegion === region ? null : region)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by region: ${region}`}
                  accessibilityState={{ selected: selectedRegion === region }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRegion === region && styles.filterChipTextActive,
                    ]}
                  >
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Road Status Content */}
        <View style={styles.content}>

        {/* List View */}
        {viewMode === 'list' && isInitialLoading ? (
          <UnifiedSkeletonLoader 
            type="list-item"
            count={5}
            animated={true}
          />
        ) : viewMode === 'list' && showEmptyState ? (
          <EmptyState
            icon={(searchQuery.trim() || selectedStatus || selectedRegion) ? 'search-outline' : 'map-outline'}
            title={(searchQuery.trim() || selectedStatus || selectedRegion) ? 'No Results Found' : 'No Roadworks in This Area'}
            message={(searchQuery.trim() || selectedStatus || selectedRegion)
              ? 'No roadworks match your search or filters.'
              : 'All roads are currently open and operating normally.'}
            primaryActionLabel={(searchQuery.trim() || selectedStatus || selectedRegion) ? 'Clear filters' : 'Refresh'}
            onPrimaryAction={() => {
              if (searchQuery.trim() || selectedStatus || selectedRegion) {
                setSearchQuery('');
                setSelectedStatus(null);
                setSelectedRegion(null);
              } else {
                handleRetry();
              }
            }}
            secondaryActionLabel={(searchQuery.trim() || selectedStatus || selectedRegion) ? 'Refresh' : undefined}
            onSecondaryAction={(searchQuery.trim() || selectedStatus || selectedRegion) ? handleRetry : undefined}
          />
        ) : viewMode === 'list' && (
          <>
            {/* Critical Road Alerts */}
            {criticalRoadworks.length > 0 && (
              <View style={styles.criticalSection}>
                <View style={styles.criticalHeader}>
                  <Ionicons name="warning" size={24} color={colors.error} />
                  <Text style={styles.criticalTitle}>Critical Road Alerts</Text>
                </View>
                {criticalRoadworks.map((roadwork) => (
                  <View key={roadwork._id || roadwork.id} style={styles.criticalCard}>
                    <View style={styles.criticalBadge}>
                      <Text style={styles.criticalBadgeText}>
                        {roadwork.status?.toUpperCase() || 'ALERT'}
                      </Text>
                    </View>
                    <View style={styles.criticalHeaderRow}>
                    <Text style={styles.criticalRoadName}>
                      {roadwork.road} - {roadwork.section}
                    </Text>
                      {roadwork.distanceKm !== undefined && (
                        <View style={[styles.distanceBadge, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}>
                          <Ionicons name="location" size={12} color={colors.error} />
                          <Text style={[styles.distanceText, { color: colors.error }]}>
                            {roadwork.distanceKm < 1 
                              ? `${Math.round(roadwork.distanceKm * 1000)}m away`
                              : `${roadwork.distanceKm.toFixed(1)}km away`}
                          </Text>
                        </View>
                      )}
                      <View style={styles.cardHeaderActions}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => toggleSaveRoadwork(roadwork)}
                          accessibilityLabel={savedRoadworks.includes(roadwork._id || roadwork.id) ? "Remove from saved" : "Save roadwork"}
                        >
                          <Ionicons 
                            name={savedRoadworks.includes(roadwork._id || roadwork.id) ? "bookmark" : "bookmark-outline"} 
                            size={20} 
                            color={savedRoadworks.includes(roadwork._id || roadwork.id) ? colors.error : colors.textSecondary} 
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => handleShareRoadwork(roadwork)}
                          accessibilityLabel="Share roadwork"
                        >
                          <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.criticalTitle}>{roadwork.title}</Text>
                    {roadwork.reason && (
                      <View style={styles.criticalRow}>
                        <Ionicons name="construct" size={16} color={colors.error} />
                        <Text style={styles.criticalText}>
                          Reason: {roadwork.reason}
                        </Text>
                      </View>
                    )}
                    {roadwork.expectedCompletion && (
                      <View style={styles.criticalRow}>
                        <Ionicons name="time" size={16} color={colors.error} />
                        <Text style={styles.criticalText}>
                          Expected: {formatDate(roadwork.expectedCompletion)}
                        </Text>
                      </View>
                    )}
                    {/* Warning Banner for Closed Roads */}
                    <View style={styles.criticalWarningBanner}>
                      <Ionicons name="alert-circle" size={20} color={colors.error} />
                      <Text style={styles.criticalWarningText}>
                        {roadwork.status === 'Closed' ? 'This road is completely blocked' : 'Significant delays expected'}
                      </Text>
                    </View>

                    {/* Primary Action Buttons - Same as Normal Cards */}
                    <View style={styles.criticalActionButtons}>
                      <TouchableOpacity
                        style={[styles.criticalActionButton, { borderColor: colors.error }]}
                        onPress={() => handleViewOnMap(roadwork)}
                        accessibilityLabel="View location on map"
                        accessibilityRole="button"
                      >
                        <Ionicons name="map-outline" size={16} color={colors.error} />
                        <Text style={[styles.criticalActionButtonText, { color: colors.error }]}>
                          View Location
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.criticalActionButton, { borderColor: colors.error }]}
                        onPress={() => handleDirections(roadwork)}
                        accessibilityLabel="Get directions to this location"
                        accessibilityRole="button"
                      >
                        <Ionicons name="navigate-outline" size={16} color={colors.error} />
                        <Text style={[styles.criticalActionButtonText, { color: colors.error }]}>
                          Get Directions
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Structured Alternate Routes - Priority */}
                    {roadwork.alternateRoutes && roadwork.alternateRoutes.length > 0 && roadwork.alternateRoutes.some(r => r.approved) && (
                      <View style={styles.criticalAlternativeRoute}>
                        <View style={styles.alternativeRouteHeader}>
                          <Ionicons name="swap-horizontal" size={18} color={colors.error} />
                          <Text style={[styles.alternativeRouteTitle, { color: colors.error, fontWeight: '700' }]}>
                            Alternate Routes ({roadwork.alternateRoutes.filter(r => r.approved).length})
                          </Text>
                        </View>
                        {roadwork.alternateRoutes
                          .filter(route => route.approved)
                          .sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0))
                          .map((route, index) => (
                            <View key={index} style={styles.routeOptionCard}>
                              {route.isRecommended && (
                                <View style={styles.recommendedBadge}>
                                  <Ionicons name="star" size={12} color="#FFFFFF" />
                                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                                </View>
                              )}
                              <Text style={styles.routeName}>{route.routeName}</Text>
                              <View style={styles.routeMetrics}>
                                {route.distanceKm && (
                                  <View style={styles.routeMetric}>
                                    <Ionicons name="trail-sign" size={14} color={colors.textSecondary} />
                                    <Text style={styles.routeMetricText}>{route.distanceKm} km</Text>
                                  </View>
                                )}
                                {route.estimatedTime && (
                                  <View style={styles.routeMetric}>
                                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                                    <Text style={styles.routeMetricText}>{route.estimatedTime}</Text>
                                  </View>
                                )}
                                {route.vehicleType && route.vehicleType.length > 0 && (
                                  <View style={styles.routeMetric}>
                                    <Ionicons name="car" size={14} color={colors.textSecondary} />
                                    <Text style={styles.routeMetricText}>
                                      {route.vehicleType.includes('All') ? 'All Vehicles' : route.vehicleType.join(', ')}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              {route.roadsUsed && route.roadsUsed.length > 0 && (
                                <Text style={styles.routeRoads}>Via: {route.roadsUsed.join(', ')}</Text>
                              )}
                              <TouchableOpacity
                                style={[styles.routeButton, route.isRecommended && styles.routeButtonRecommended]}
                                onPress={() => handleStructuredRoute(route)}
                                accessibilityLabel={`Navigate via ${route.routeName}`}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                                <Text style={styles.routeButtonText}>Navigate This Route</Text>
                                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                          ))}
                      </View>
                    )}
                    
                    {/* Legacy Text Alternative Route - Fallback */}
                    {(!roadwork.alternateRoutes || roadwork.alternateRoutes.length === 0 || !roadwork.alternateRoutes.some(r => r.approved)) && roadwork.alternativeRoute && (
                      <View style={styles.criticalAlternativeRoute}>
                        <View style={styles.alternativeRouteHeader}>
                          <Ionicons name="swap-horizontal" size={18} color={colors.error} />
                          <Text style={[styles.alternativeRouteTitle, { color: colors.error, fontWeight: '700' }]}>
                            Alternative Route
                          </Text>
                        </View>
                        <Text style={[styles.alternativeRouteDescription, { color: colors.text }]}>
                          {roadwork.alternativeRoute}
                        </Text>
                        {(() => {
                          const parsed = parseAlternativeRoute(roadwork.alternativeRoute);
                          return (parsed.roads.length > 0 || parsed.towns.length > 0) && (
                            <View style={styles.alternativeRouteDetails}>
                              {parsed.roads.length > 0 && (
                                <View style={styles.alternativeRouteDetailRow}>
                                  <Ionicons name="trail-sign" size={14} color={colors.textSecondary} />
                                  <Text style={styles.alternativeRouteDetailText}>
                                    Roads: {parsed.roads.join(', ')}
                                  </Text>
                                </View>
                              )}
                              {parsed.towns.length > 0 && (
                                <View style={styles.alternativeRouteDetailRow}>
                                  <Ionicons name="location" size={14} color={colors.textSecondary} />
                                  <Text style={styles.alternativeRouteDetailText}>
                                    Via: {parsed.towns.join(', ')}
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })()}
                        <TouchableOpacity
                          style={[styles.criticalAlternativeButton]}
                          onPress={() => handleAlternativeRoute(roadwork.alternativeRoute)}
                          accessibilityLabel="Use alternative route"
                          accessibilityRole="button"
                          activeOpacity={0.7}
                        >
                          <Ionicons name="car" size={18} color="#FFFFFF" />
                          <Text style={styles.criticalAlternativeButtonText}>
                            Use Alternative Route
                          </Text>
                          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    <View style={styles.criticalUpdated}>
                      <Text style={styles.criticalUpdatedText}>
                        Last updated: {formatLastUpdated(new Date(roadwork.updatedAt || roadwork.createdAt))}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {(searchQuery.trim() || selectedStatus || selectedRegion) && (
              <Text style={styles.resultsCount}>
                {filteredRoadworks.length}{' '}
                {filteredRoadworks.length === 1 ? 'result' : 'results'} found
                {(selectedStatus || selectedRegion) && (
                  <Text style={styles.resultsCountFilters}>
                    {' '}({selectedStatus ? `Status: ${selectedStatus}` : ''}
                    {selectedStatus && selectedRegion ? ', ' : ''}
                    {selectedRegion ? `Region: ${selectedRegion}` : ''})
                  </Text>
                )}
              </Text>
            )}

            {/* Normal Roadworks */}
            {normalRoadworks.length > 0 && criticalRoadworks.length > 0 && (
              <Text style={styles.sectionTitle}>All Roadworks</Text>
            )}
            
            {normalRoadworks.map((roadwork) => (
              <View key={roadwork._id || roadwork.id} style={styles.card}>
                {/* Status Badge at Top */}
                <View
                  style={[
                    styles.statusBadgeTop,
                    {
                      backgroundColor: getStatusColor(roadwork.status, colors) + '15',
                      borderLeftColor: getStatusColor(roadwork.status, colors),
                    },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(roadwork.status)}
                    size={18}
                    color={getStatusColor(roadwork.status, colors)}
                  />
                  <Text
                    style={[
                      styles.statusTextTop,
                      { color: getStatusColor(roadwork.status, colors) },
                    ]}
                  >
                    {roadwork.status?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </View>

                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{roadwork.title}</Text>
                    <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardRoad}>
                      {roadwork.road} {roadwork.section ? `- ${roadwork.section}` : ''}
                      </Text>
                      {roadwork.distanceKm !== undefined && (
                        <View style={styles.distanceBadge}>
                          <Ionicons name="location" size={12} color={colors.primary} />
                          <Text style={styles.distanceText}>
                            {roadwork.distanceKm < 1 
                              ? `${Math.round(roadwork.distanceKm * 1000)}m away`
                              : `${roadwork.distanceKm.toFixed(1)}km away`}
                    </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.cardHeaderActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => toggleSaveRoadwork(roadwork)}
                      accessibilityLabel={savedRoadworks.includes(roadwork._id || roadwork.id) ? "Remove from saved" : "Save roadwork"}
                    >
                      <Ionicons 
                        name={savedRoadworks.includes(roadwork._id || roadwork.id) ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={savedRoadworks.includes(roadwork._id || roadwork.id) ? colors.primary : colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleShareRoadwork(roadwork)}
                      accessibilityLabel="Share roadwork"
                    >
                      <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {roadwork.area && (
                    <View style={styles.cardRow}>
                      <Ionicons
                        name="location"
                        size={18}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.cardText}>Area: {roadwork.area}</Text>
                    </View>
                  )}

                  {roadwork.reason && (
                    <View style={styles.cardRow}>
                      <Ionicons
                        name="construct"
                        size={18}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.cardText}>Reason: {roadwork.reason}</Text>
                    </View>
                  )}

                  {roadwork.startDate && (
                    <View style={styles.cardRow}>
                      <Ionicons
                        name="calendar"
                        size={18}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.cardText}>
                        Started: {formatDate(roadwork.startDate)}
                      </Text>
                    </View>
                  )}

                  {roadwork.expectedCompletion && (
                    <View style={styles.cardRow}>
                      <Ionicons
                        name="time"
                        size={18}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.cardText}>
                        Expected completion: {formatDate(roadwork.expectedCompletion)}
                      </Text>
                    </View>
                  )}

                  {roadwork.expectedDelayMinutes && (
                    <View style={[styles.cardRow, styles.warningRow]}>
                      <Ionicons
                        name="warning"
                        size={18}
                        color="#FF9500"
                      />
                      <Text style={[styles.cardText, styles.warningText]}>
                        Expected delay: {roadwork.expectedDelayMinutes} minutes
                      </Text>
                    </View>
                  )}

                  {roadwork.trafficControl && (
                    <View style={styles.cardRow}>
                      <Ionicons
                        name="stop-circle-outline"
                        size={18}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.cardText}>
                        Traffic control: {roadwork.trafficControl}
                      </Text>
                    </View>
                  )}

                  {/* Primary Action Buttons - Consistent across all cards */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.primary }]}
                      onPress={() => handleViewOnMap(roadwork)}
                      accessibilityLabel="View location on map"
                      accessibilityRole="button"
                    >
                      <Ionicons name="map-outline" size={16} color={colors.primary} />
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                        View Location
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.primary }]}
                      onPress={() => handleDirections(roadwork)}
                      accessibilityLabel="Get directions to this location"
                      accessibilityRole="button"
                    >
                      <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                        Get Directions
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Structured Alternate Routes - Priority */}
                  {roadwork.alternateRoutes && roadwork.alternateRoutes.length > 0 && roadwork.alternateRoutes.some(r => r.approved) && (
                    <View style={styles.alternativeRouteInline}>
                      <View style={styles.alternativeRouteHeader}>
                        <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
                        <Text style={styles.alternativeRouteTitle}>
                          Alternate Routes ({roadwork.alternateRoutes.filter(r => r.approved).length})
                        </Text>
                      </View>
                      {roadwork.alternateRoutes
                        .filter(route => route.approved)
                        .sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0))
                        .map((route, index) => (
                          <View key={index} style={styles.routeOptionCard}>
                            {route.isRecommended && (
                              <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
                                <Ionicons name="star" size={12} color="#FFFFFF" />
                                <Text style={styles.recommendedText}>RECOMMENDED</Text>
                              </View>
                            )}
                            <Text style={styles.routeName}>{route.routeName}</Text>
                            <View style={styles.routeMetrics}>
                              {route.distanceKm && (
                                <View style={styles.routeMetric}>
                                  <Ionicons name="trail-sign" size={14} color={colors.textSecondary} />
                                  <Text style={styles.routeMetricText}>{route.distanceKm} km</Text>
                                </View>
                              )}
                              {route.estimatedTime && (
                                <View style={styles.routeMetric}>
                                  <Ionicons name="time" size={14} color={colors.textSecondary} />
                                  <Text style={styles.routeMetricText}>{route.estimatedTime}</Text>
                                </View>
                              )}
                              {route.vehicleType && route.vehicleType.length > 0 && (
                                <View style={styles.routeMetric}>
                                  <Ionicons name="car" size={14} color={colors.textSecondary} />
                                  <Text style={styles.routeMetricText}>
                                    {route.vehicleType.includes('All') ? 'All Vehicles' : route.vehicleType.join(', ')}
                                  </Text>
                                </View>
                              )}
                            </View>
                            {route.roadsUsed && route.roadsUsed.length > 0 && (
                              <Text style={styles.routeRoads}>Via: {route.roadsUsed.join(', ')}</Text>
                            )}
                            <TouchableOpacity
                              style={[styles.routeButton, { backgroundColor: colors.primary }, route.isRecommended && styles.routeButtonRecommended]}
                              onPress={() => handleStructuredRoute(route)}
                              accessibilityLabel={`Navigate via ${route.routeName}`}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="navigate" size={16} color="#FFFFFF" />
                              <Text style={styles.routeButtonText}>Navigate This Route</Text>
                              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        ))}
                    </View>
                  )}
                  
                  {/* Legacy Text Alternative Route - Fallback */}
                  {(!roadwork.alternateRoutes || roadwork.alternateRoutes.length === 0 || !roadwork.alternateRoutes.some(r => r.approved)) && roadwork.alternativeRoute && (
                    <View style={styles.alternativeRouteInline}>
                      <View style={styles.alternativeRouteHeader}>
                        <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
                        <Text style={styles.alternativeRouteTitle}>💡 Alternative Route Available</Text>
                      </View>
                      <Text style={styles.alternativeRouteDescription}>
                        {roadwork.alternativeRoute}
                      </Text>
                      {(() => {
                        const parsed = parseAlternativeRoute(roadwork.alternativeRoute);
                        return (parsed.roads.length > 0 || parsed.towns.length > 0) && (
                          <View style={styles.alternativeRouteDetails}>
                            {parsed.roads.length > 0 && (
                              <View style={styles.alternativeRouteDetailRow}>
                                <Ionicons name="trail-sign" size={14} color={colors.textSecondary} />
                                <Text style={styles.alternativeRouteDetailText}>
                                  Roads: {parsed.roads.join(', ')}
                                </Text>
                              </View>
                            )}
                            {parsed.towns.length > 0 && (
                              <View style={styles.alternativeRouteDetailRow}>
                                <Ionicons name="location" size={14} color={colors.textSecondary} />
                                <Text style={styles.alternativeRouteDetailText}>
                                  Via: {parsed.towns.join(', ')}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })()}
                      <TouchableOpacity
                        style={styles.alternativeRouteButton}
                        onPress={() => handleAlternativeRoute(roadwork.alternativeRoute)}
                        accessibilityLabel="Use alternative route"
                        accessibilityRole="button"
                      >
                        <Ionicons name="car" size={16} color={colors.primary} />
                        <Text style={styles.alternativeRouteButtonText}>
                          Use Alternative Route
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Last Updated */}
                  {(roadwork.updatedAt || roadwork.createdAt) && (
                    <View style={styles.cardFooter}>
                      <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.cardFooterText}>
                        Last updated: {formatLastUpdated(new Date(roadwork.updatedAt || roadwork.createdAt))}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
        </View>
      </ScrollView>
      )}

      {/* In-App Map Modal */}
      {MapView && showMapModal && selectedRoadworkForMap && modalMapRegion && (
        <Modal
          visible={showMapModal}
          animationType="slide"
          onRequestClose={() => setShowMapModal(false)}
        >
          <SafeAreaView style={styles.mapModalContainer} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={[styles.mapModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity 
                onPress={() => setShowMapModal(false)}
                style={styles.mapModalBackButton}
                accessibilityLabel="Close map"
                accessibilityRole="button"
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.mapModalHeaderText}>
                <Text style={[styles.mapModalTitle, { color: colors.text }]} numberOfLines={1}>
                  {selectedRoadworkForMap.road || 'Roadwork'}
                </Text>
                <Text style={[styles.mapModalSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {selectedRoadworkForMap.section || selectedRoadworkForMap.title}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowMapModal(false)}
                style={styles.mapModalCloseButton}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Map View */}
            <RoadsMap
              mode={MAP_MODES.VIEW}
              initialRegion={modalMapRegion}
              markers={mapModalMarkers}
              circles={mapModalCircles}
              bottomSheetData={mapModalBottomSheetData}
              showsUserLocation={true}
              showZoomControls={true}
              style={styles.mapModalMap}
            />

          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function getStyles(colors, screenHeight = Dimensions.get('window').height, screenWidth = Dimensions.get('window').width) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    searchInputContainer: {
      paddingHorizontal: 0,
      paddingTop: 16,
      paddingBottom: 8,
    },
    legendContainer: {
      marginHorizontal: 0,
      marginTop: 16,
      marginBottom: 12,
      padding: 18,
      backgroundColor: colors.surface || colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    legendItems: {
      gap: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    legendText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
    content: {
      padding: 0,
    },
    searchInput: {
      margin: 0,
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
      paddingHorizontal: 20,
      gap: 12,
    },
    sortLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    sortOptions: {
      gap: 8,
    },
    sortChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 6,
    },
    sortChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortChipDisabled: {
      opacity: 0.5,
    },
    sortChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    sortChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    sortChipTextDisabled: {
      color: colors.textSecondary,
    },
    filterContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      gap: 10,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    filterChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    resultsCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    resultsCountFilters: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    regionFilterSection: {
      marginTop: 8,
      marginBottom: 12,
    },
    regionFilterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 20,
      flexWrap: 'wrap',
      gap: 8,
    },
    regionFilterTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    locationDetectingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    locationDetectingText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    locationBasedFilterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.card,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    locationBasedFilterText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    useLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    useLocationButtonText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 24,
      marginBottom: 16,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    criticalSection: {
      marginBottom: 24,
    },
    criticalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    criticalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.error,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    criticalCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.error,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    criticalBadge: {
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    criticalBadgeText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    criticalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      flexWrap: 'wrap',
      gap: 8,
    },
    criticalRoadName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    criticalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 8,
    },
    criticalText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },
    alternativeRoute: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    alternativeRouteText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
      flex: 1,
    },
    criticalAlternativeRoute: {
      marginTop: 12,
      padding: 14,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
    },
    criticalWarningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      backgroundColor: colors.error + '10',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.error + '30',
      marginTop: 12,
    },
    criticalWarningText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.error,
      lineHeight: 20,
    },
    criticalActionButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    criticalActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      gap: 6,
      minHeight: 44,
      backgroundColor: colors.card,
    },
    criticalActionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    criticalAlternativeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.error,
      borderRadius: 8,
      gap: 8,
      marginTop: 8,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    criticalAlternativeButtonText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    criticalUpdated: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    criticalUpdatedText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusBadgeTop: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderLeftWidth: 4,
      gap: 8,
    },
    statusTextTop: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    cardHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
    },
    cardHeaderText: {
      flex: 1,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    cardHeaderActions: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: 8,
    },
    iconButton: {
      padding: 6,
      borderRadius: 6,
    },
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.primary + '15',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    distanceText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    cardRoad: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    cardBody: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 12,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    warningRow: {
      padding: 10,
      backgroundColor: colors.warning + '15',
      borderRadius: 6,
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.warning + '30',
    },
    cardText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },
    warningText: {
      color: colors.warning,
      fontWeight: '500',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      gap: 6,
      minHeight: 44,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 6,
    },
    cardFooterText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    emptyStateMessage: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    emptyStateButton: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      minHeight: 44,
      minWidth: 150,
    },
    emptyStateButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    emptyStateFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 16,
    },
    emptyStateFooterText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    // View Toggle Styles
    viewToggleContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 4,
      gap: 4,
    },
    viewToggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      gap: 8,
    },
    viewToggleButtonActive: {
      backgroundColor: colors.primary,
    },
    viewToggleText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    /* ========================
       Map Container
       ========================= */
    mapViewContainer: {
      width: '100%',
      height: screenHeight * 0.7, // 70% of screen height
      minHeight: 500,
      maxHeight: screenHeight * 0.85, // Max 85% of screen height
      marginTop: spacing.md,
      marginBottom: spacing.md,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    mapView: {
      width: '100%',
      height: '100%',
    },
    mapFullScreenContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    mapHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    mapHeaderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      gap: 6,
      marginRight: 12,
    },
    mapHeaderButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    mapHeaderTitle: {
      flex: 1,
    },
    mapHeaderTitleText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    mapHeaderSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    mapFullScreen: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    mapUnavailableContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: colors.background,
    },
    mapUnavailableTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      textAlign: 'center',
    },
    mapUnavailableText: {
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
    },
    mapUnavailableButton: {
      marginTop: 24,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    mapUnavailableButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    /* ========================
       Map Legend Overlay
       ========================= */
    mapLegendOverlay: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      padding: spacing.sm,
      backgroundColor: colors.cardBackground,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
      ...shadows.sm,
    },
    mapLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    mapLegendMarker: {
      width: sizes.markerSm,
      height: sizes.markerSm,
      borderRadius: sizes.markerSm / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    /* ========================
       Waypoint Markers
       ========================= */
    waypointMarker: {
      width: sizes.markerSm,
      height: sizes.markerSm,
      borderRadius: sizes.markerSm / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    waypointText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    // Alternative Route Inline Styles
    alternativeRouteInline: {
      marginTop: 12,
      padding: 14,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    alternativeRouteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    alternativeRouteTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    alternativeRouteDescription: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 10,
    },
    alternativeRouteDetails: {
      gap: 6,
      marginBottom: 10,
    },
    alternativeRouteDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    alternativeRouteDetailText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    alternativeRouteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.primary,
      borderRadius: 6,
      gap: 6,
      marginTop: 4,
    },
    alternativeRouteButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      flex: 1,
      textAlign: 'center',
    },
    // Structured Route Option Styles
    routeOptionCard: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.surface || colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    recommendedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.primary,
      borderRadius: 12,
      marginBottom: 4,
    },
    recommendedText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    routeName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    routeMetrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 6,
    },
    routeMetric: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    routeMetricText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    routeRoads: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: 8,
    },
    routeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.primary,
      borderRadius: 6,
      gap: 6,
      marginTop: 4,
    },
    routeButtonRecommended: {
      backgroundColor: colors.success,
    },
    routeButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
      flex: 1,
      textAlign: 'center',
    },
    /* ========================
       Map Modal (Full Screen)
       ========================= */
    mapModalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mapModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    mapModalMap: {
      flex: 1,
    },
    /* ========================
       Zoom Controls
       ========================= */
    zoomControls: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: colors.cardBackground,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.md,
    },
    zoomButton: {
      width: sizes.touch,
      height: sizes.touch,
      alignItems: 'center',
      justifyContent: 'center',
    },
    /* ========================
       Map Modal Legend
       ========================= */
    mapModalLegend: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: colors.cardBackground,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      marginTop: spacing.sm,
    },
    mapModalLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mapModalLegendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    mapModalLegendText: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    mapModalLegendSubtext: {
      fontSize: 12,
    },
    /* ========================
       Bottom Sheet
       ========================= */
    mapModalBottomSheet: {
      padding: spacing.lg,
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
      ...shadows.md,
    },
    /* ========================
       Custom Marker
       ========================= */
    customMarkerInner: {
      width: sizes.markerMd,
      height: sizes.markerMd,
      borderRadius: sizes.markerMd / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      ...shadows.md,
    },
    mapModalStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    },
    mapModalStatusText: {
      fontSize: 13,
      fontWeight: '600',
    },
    mapModalBottomTitle: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    mapModalBottomDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    mapModalBottomDates: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    mapModalBottomDateItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    mapModalBottomDateText: {
      fontSize: 12,
      fontWeight: '500',
    },
    mapModalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    mapModalActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      gap: 8,
    },
    mapModalActionButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: 'white',
    },
    mapModalCloseActionButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    },
    mapModalCloseActionButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    /* ========================
       Route Planner Styles
       ========================= */
    routePlannerButton: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    routePlannerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    routePlannerControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: screenHeight * 0.5,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    routePlannerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    routePlannerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    routePlannerCloseButton: {
      padding: 4,
    },
    routePlannerPoints: {
      gap: 12,
      marginBottom: 16,
    },
    routePointButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface || colors.card,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 12,
    },
    routePointButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    routePointInfo: {
      flex: 1,
    },
    routePointLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    routePointValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    routePlannerHint: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.primary + '15',
      borderRadius: 8,
      gap: 8,
      marginBottom: 16,
    },
    routePlannerHintText: {
      fontSize: 13,
      color: colors.primary,
      flex: 1,
    },
    routePlannerResults: {
      marginTop: 8,
    },
    routePlannerResultsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    routePlannerResultsCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    routePlannerAlerts: {
      marginBottom: 16,
    },
    routePlannerAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.error + '15',
      borderRadius: 8,
      gap: 8,
      marginBottom: 8,
    },
    routePlannerAlertText: {
      fontSize: 13,
      color: colors.error,
      fontWeight: '600',
      flex: 1,
    },
    routePlannerNavigateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 10,
      gap: 8,
    },
    routePlannerNavigateButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    routePointMarker: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    routePointInner: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: '#FFFFFF',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    routePointText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });
}


