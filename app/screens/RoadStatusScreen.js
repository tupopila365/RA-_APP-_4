import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Platform,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { ErrorState, EmptyState, SearchInput } from '../components';
import { roadStatusService } from '../services/roadStatusService';

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

// Conditionally import Location - fallback if not available
let Location = null;
try {
  Location = require('expo-location');
} catch (error) {
  console.warn('Location module not available:', error.message);
}

const getStatusColor = (status, colors) => {
  const statusColors = {
    'Open': '#34C759', // Green
    'Ongoing': '#FF9500', // Orange
    'Ongoing Maintenance': '#FF9500', // Orange
    'Planned': '#007AFF', // Blue
    'Planned Works': '#007AFF', // Blue
    'Closed': '#FF3B30', // Red
    'Restricted': '#FF3B30', // Red
    'Completed': '#34C759', // Green
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
  // Check various possible coordinate locations
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

/**
 * Geocode road name and area to get approximate coordinates
 * Falls back to region center if specific location not found
 */
const geocodeRoadworkLocation = async (roadwork) => {
  try {
    const searchQuery = `${roadwork.road || ''} ${roadwork.section || ''} ${roadwork.area || ''} Namibia`.trim();
    
    if (!searchQuery || searchQuery === 'Namibia') {
      return null;
    }
    
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
      };
    }
  } catch (error) {
    console.warn('Geocoding failed:', error);
  }
  
  return null;
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
      pinColor={isCritical ? '#FF3B30' : '#FF9500'}
      onPress={onPress}
    >
      <Animated.View
        style={{
          transform: [{ scale: isCritical ? pulseAnim : 1 }],
        }}
      >
        <View
          style={{
            backgroundColor: isCritical ? '#FF3B30' : '#FF9500',
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
      <Callout tooltip onPress={onPress}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
            minWidth: 200,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            borderWidth: 1,
            borderColor: colors.border,
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
              color={isCritical ? '#FF3B30' : '#FF9500'} 
            />
            <Text style={{ fontSize: 12, color: isCritical ? '#FF3B30' : '#FF9500', fontWeight: '600' }}>
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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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

  const handleAlternativeRoute = async (alternativeRouteText) => {
    try {
      // Geocode the alternative route
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

    return filtered;
  }, [roadworks, searchQuery, selectedStatus, selectedRegion]);

  const styles = getStyles(colors);

  // Show error state if initial load fails
  if (error && roadworks.length === 0 && !loading) {
    return (
      <ErrorState
        message={error || 'Failed to load road status'}
        onRetry={handleRetry}
        fullScreen
      />
    );
  }

  const isInitialLoading = loading && roadworks.length === 0;
  const isEmpty = filteredRoadworks.length === 0;
  const showEmptyState = !isInitialLoading && isEmpty;

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {/* Entire Screen Scrollable */}
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
                color={viewMode === 'list' ? colors.primary : colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.viewToggleText,
                  viewMode === 'list' && { color: colors.primary, fontWeight: '600' }
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
                color={viewMode === 'map' ? colors.primary : colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.viewToggleText,
                  viewMode === 'map' && { color: colors.primary, fontWeight: '600' }
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
                <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                <Text style={styles.legendText}>Open - Normal traffic flow</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
                <Text style={styles.legendText}>Ongoing - Expect delays</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
                <Text style={styles.legendText}>Planned - Scheduled</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
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
                  selectedStatus === status && {
                    backgroundColor: getStatusColor(status, colors) + '20',
                    borderColor: getStatusColor(status, colors),
                  },
                ]}
                onPress={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === status && styles.filterChipTextActive,
                    selectedStatus === status && {
                      color: getStatusColor(status, colors),
                    },
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
                  <ActivityIndicator size="small" color={colors.primary} />
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
                    selectedRegion === region && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() =>
                    setSelectedRegion(selectedRegion === region ? null : region)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedRegion === region && styles.filterChipTextActive,
                      selectedRegion === region && {
                        color: colors.primary,
                      },
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

        {/* Map View */}
        {viewMode === 'map' && !isInitialLoading && (
          <View style={styles.mapViewContainer}>
            {!MapView ? (
              <View style={[styles.mapView, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card }]}>
                <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>
                  Map View Not Available
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
                  Map view requires a development build and is not available in Expo Go.
                </Text>
                <TouchableOpacity
                  style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8 }}
                  onPress={() => setViewMode('list')}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Switch to List View</Text>
                </TouchableOpacity>
              </View>
            ) : mapRegion ? (
              <MapView
                style={styles.mapView}
                initialRegion={mapRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              >
                {filteredRoadworks.map((roadwork) => {
                  const coordinates = getRoadworkCoordinates(roadwork);
                  if (!coordinates) return null;
                  
                  return (
                    <PulsingMarker
                      key={roadwork._id || roadwork.id}
                      coordinate={coordinates}
                      roadwork={roadwork}
                      colors={colors}
                      onPress={() => {
                        // Show details in alert or bottom sheet
                        Alert.alert(
                          `${roadwork.road} - ${roadwork.section}`,
                          `${roadwork.title}\n\nStatus: ${roadwork.status}\n${roadwork.reason ? `Reason: ${roadwork.reason}\n` : ''}${roadwork.expectedDelayMinutes ? `Expected Delay: ${roadwork.expectedDelayMinutes} min\n` : ''}${roadwork.alternativeRoute ? `\nAlternative Route:\n${roadwork.alternativeRoute}` : ''}`,
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
              </MapView>
            ) : null}
            
            {/* Map Legend Overlay */}
            {MapView && <View style={styles.mapLegendOverlay}>
              <View style={styles.mapLegendItem}>
                <View style={[styles.mapLegendMarker, { backgroundColor: '#FF3B30' }]}>
                  <Ionicons name="close-circle" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.mapLegendText}>Critical Alert</Text>
              </View>
              <View style={styles.mapLegendItem}>
                <View style={[styles.mapLegendMarker, { backgroundColor: '#FF9500' }]}>
                  <Ionicons name="warning" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.mapLegendText}>Ongoing Work</Text>
              </View>
            </View>}

            {/* Results Count on Map */}
            <View style={styles.mapResultsOverlay}>
              <Text style={styles.mapResultsText}>
                {filteredRoadworks.filter(rw => getRoadworkCoordinates(rw)).length} roadwork{filteredRoadworks.filter(rw => getRoadworkCoordinates(rw)).length !== 1 ? 's' : ''} on map
              </Text>
            </View>
          </View>
        )}

        {/* List View */}
        {viewMode === 'list' && isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading road status...</Text>
          </View>
        ) : viewMode === 'list' && showEmptyState ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>
              {searchQuery.trim() || selectedStatus || selectedRegion
                ? 'No Results Found'
                : 'No Roadworks in This Area'}
            </Text>
            <Text style={styles.emptyStateMessage}>
              {searchQuery.trim() || selectedStatus || selectedRegion
                ? `No roadworks match your filters.\n\nTry:\n• Different road name\n• Different region\n• Clear filters`
                : 'All roads are currently open and operating normally.'}
            </Text>
            {searchQuery.trim() || selectedStatus || selectedRegion ? (
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedStatus(null);
                  setSelectedRegion(null);
                }}
                accessibilityLabel="Clear search and filters"
                accessibilityRole="button"
              >
                <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyStateFooter}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.emptyStateFooterText}>
                  Last checked: {formatLastUpdated(lastUpdated)}
                </Text>
              </View>
            )}
          </View>
        ) : viewMode === 'list' && (
          <>
            {/* Critical Road Alerts */}
            {criticalRoadworks.length > 0 && (
              <View style={styles.criticalSection}>
                <View style={styles.criticalHeader}>
                  <Ionicons name="warning" size={24} color="#FF3B30" />
                  <Text style={styles.criticalTitle}>Critical Road Alerts</Text>
                </View>
                {criticalRoadworks.map((roadwork) => (
                  <View key={roadwork._id || roadwork.id} style={styles.criticalCard}>
                    <View style={styles.criticalBadge}>
                      <Text style={styles.criticalBadgeText}>
                        ⚠️ {roadwork.status?.toUpperCase() || 'ALERT'}
                      </Text>
                    </View>
                    <Text style={styles.criticalRoadName}>
                      {roadwork.road} - {roadwork.section}
                    </Text>
                    <Text style={styles.criticalTitle}>{roadwork.title}</Text>
                    {roadwork.reason && (
                      <View style={styles.criticalRow}>
                        <Ionicons name="construct" size={16} color="#FF3B30" />
                        <Text style={styles.criticalText}>
                          Reason: {roadwork.reason}
                        </Text>
                      </View>
                    )}
                    {roadwork.expectedCompletion && (
                      <View style={styles.criticalRow}>
                        <Ionicons name="time" size={16} color="#FF3B30" />
                        <Text style={styles.criticalText}>
                          Expected: {formatDate(roadwork.expectedCompletion)}
                        </Text>
                      </View>
                    )}
                    {/* Warning Banner for Closed Roads */}
                    <View style={styles.criticalWarningBanner}>
                      <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                      <Text style={styles.criticalWarningText}>
                        {roadwork.status === 'Closed' ? 'This road is completely blocked' : 'Significant delays expected'}
                      </Text>
                    </View>

                    {/* Primary Action Buttons - Same as Normal Cards */}
                    <View style={styles.criticalActionButtons}>
                      <TouchableOpacity
                        style={[styles.criticalActionButton, { borderColor: '#FF3B30' }]}
                        onPress={() => handleViewOnMap(roadwork)}
                        accessibilityLabel="View location on map"
                        accessibilityRole="button"
                      >
                        <Ionicons name="map-outline" size={16} color="#FF3B30" />
                        <Text style={[styles.criticalActionButtonText, { color: '#FF3B30' }]}>
                          View Location
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.criticalActionButton, { borderColor: '#FF3B30' }]}
                        onPress={() => handleDirections(roadwork)}
                        accessibilityLabel="Get directions to this location"
                        accessibilityRole="button"
                      >
                        <Ionicons name="navigate-outline" size={16} color="#FF3B30" />
                        <Text style={[styles.criticalActionButtonText, { color: '#FF3B30' }]}>
                          Get Directions
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Alternative Route Section - Conditional */}
                    {roadwork.alternativeRoute && (
                      <View style={styles.criticalAlternativeRoute}>
                        <View style={styles.alternativeRouteHeader}>
                          <Ionicons name="swap-horizontal" size={18} color="#FF3B30" />
                          <Text style={[styles.alternativeRouteTitle, { color: '#FF3B30', fontWeight: '700' }]}>
                            💡 Recommended Alternative
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
                    <Text style={styles.cardRoad}>
                      {roadwork.road} {roadwork.section ? `- ${roadwork.section}` : ''}
                    </Text>
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

                  {/* Alternative Route Section - Conditional */}
                  {roadwork.alternativeRoute && (
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
            <MapView
              ref={mapModalRef}
              style={styles.mapModalMap}
              initialRegion={modalMapRegion}
              provider={PROVIDER_GOOGLE}
              mapType={mapType}
              minZoomLevel={3}
              maxZoomLevel={21}
              rotateEnabled={true}
              pitchEnabled={true}
              toolbarEnabled={true}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
              showsTraffic={showTraffic}
              showsBuildings={true}
              showsPointsOfInterest={true}
              showsIndoors={true}
              zoomEnabled={true}
              zoomControlEnabled={true}
              zoomTapEnabled={true}
              scrollEnabled={true}
              loadingEnabled={true}
              loadingIndicatorColor={colors.primary}
              loadingBackgroundColor={colors.background}
              moveOnMarkerPress={false}
              customMapStyle={[]}
            >
              {/* Colored Circle showing affected area */}
              {Circle && (
                <Circle
                  center={{
                    latitude: selectedRoadworkForMap.coordinates.latitude,
                    longitude: selectedRoadworkForMap.coordinates.longitude,
                  }}
                  radius={500} // 500 meters affected radius
                  fillColor={getStatusColor(selectedRoadworkForMap.status, colors) + '10'} // Very subtle fill
                  strokeColor={getStatusColor(selectedRoadworkForMap.status, colors)}
                  strokeWidth={1.5}
                  lineDashPattern={[5, 5]} // Dashed line (less intrusive)
                />
              )}

              {/* Custom Status-Colored Marker */}
              <Marker
                coordinate={{
                  latitude: selectedRoadworkForMap.coordinates.latitude,
                  longitude: selectedRoadworkForMap.coordinates.longitude,
                }}
                title={selectedRoadworkForMap.road || 'Roadwork'}
                description={selectedRoadworkForMap.title}
              >
                <View style={styles.customMarker}>
                  <View style={[
                    styles.customMarkerInner,
                    { backgroundColor: getStatusColor(selectedRoadworkForMap.status, colors) }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(selectedRoadworkForMap.status)} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                </View>
              </Marker>
            </MapView>

            {/* Zoom Controls */}
            <View style={[styles.zoomControls, { backgroundColor: colors.card + 'F2', borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={handleZoomIn}
                accessibilityLabel="Zoom in"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={[styles.zoomDivider, { backgroundColor: colors.border }]} />
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={handleZoomOut}
                accessibilityLabel="Zoom out"
                accessibilityRole="button"
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={[styles.mapModalLegend, { backgroundColor: colors.card + 'E6', borderColor: colors.border }]}>
              <View style={styles.mapModalLegendItem}>
                <View style={[styles.mapModalLegendDot, { backgroundColor: getStatusColor(selectedRoadworkForMap.status, colors) }]} />
                <Text style={[styles.mapModalLegendText, { color: colors.text }]}>
                  {selectedRoadworkForMap.status} - Affected Area (~500m radius)
                </Text>
              </View>
            </View>

            {/* Bottom Sheet with Details */}
            <View style={[styles.mapModalBottomSheet, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              {/* Status Badge */}
              <View style={styles.mapModalStatusContainer}>
                <View style={[
                  styles.mapModalStatusBadge,
                  { backgroundColor: getStatusColor(selectedRoadworkForMap.status, colors) + '20' }
                ]}>
                  <Ionicons 
                    name={getStatusIcon(selectedRoadworkForMap.status)} 
                    size={16} 
                    color={getStatusColor(selectedRoadworkForMap.status, colors)} 
                  />
                  <Text style={[
                    styles.mapModalStatusText,
                    { color: getStatusColor(selectedRoadworkForMap.status, colors) }
                  ]}>
                    {selectedRoadworkForMap.status}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <Text style={[styles.mapModalBottomTitle, { color: colors.text }]} numberOfLines={2}>
                {selectedRoadworkForMap.title || 'Road Maintenance'}
              </Text>
              
              {selectedRoadworkForMap.description && (
                <Text style={[styles.mapModalBottomDescription, { color: colors.textSecondary }]} numberOfLines={3}>
                  {selectedRoadworkForMap.description}
                </Text>
              )}

              {/* Dates */}
              {(selectedRoadworkForMap.startDate || selectedRoadworkForMap.expectedCompletion) && (
                <View style={styles.mapModalBottomDates}>
                  {selectedRoadworkForMap.startDate && (
                    <View style={styles.mapModalBottomDateItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.mapModalBottomDateText, { color: colors.textSecondary }]}>
                        Start: {formatDate(selectedRoadworkForMap.startDate)}
                      </Text>
                    </View>
                  )}
                  {selectedRoadworkForMap.expectedCompletion && (
                    <View style={styles.mapModalBottomDateItem}>
                      <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.mapModalBottomDateText, { color: colors.textSecondary }]}>
                        Expected: {formatDate(selectedRoadworkForMap.expectedCompletion)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.mapModalActions}>
                <TouchableOpacity
                  style={[styles.mapModalActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    openExternalMaps(selectedRoadworkForMap, selectedRoadworkForMap.coordinates);
                  }}
                  accessibilityLabel="Open in Maps"
                  accessibilityRole="button"
                >
                  <Ionicons name="map-outline" size={18} color="white" />
                  <Text style={styles.mapModalActionButtonText}>Open in Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapModalActionButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setShowMapModal(false);
                    handleDirections(selectedRoadworkForMap);
                  }}
                  accessibilityLabel="Get Directions"
                  accessibilityRole="button"
                >
                  <Ionicons name="navigate" size={18} color="white" />
                  <Text style={styles.mapModalActionButtonText}>Get Directions</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.mapModalCloseActionButton, { borderColor: colors.border }]}
                onPress={() => setShowMapModal(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={[styles.mapModalCloseActionButtonText, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function getStyles(colors) {
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
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
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
    filterContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      gap: 10,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    filterChipActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.primary,
      fontWeight: '600',
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
      backgroundColor: colors.primary + '15',
      borderRadius: 8,
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
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
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
      fontSize: 20,
      fontWeight: '700',
      color: '#FF3B30',
    },
    criticalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: '#FF3B30',
      borderLeftWidth: 4,
    },
    criticalBadge: {
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    criticalBadgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FF3B30',
    },
    criticalRoadName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
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
      backgroundColor: colors.primary + '15',
      borderRadius: 8,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.primary + '30',
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
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#FF3B30',
    },
    criticalWarningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      backgroundColor: '#FF3B30' + '10',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FF3B30' + '30',
      marginTop: 12,
    },
    criticalWarningText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: '#FF3B30',
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
      borderRadius: 10,
      borderWidth: 1.5,
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
      backgroundColor: '#FF3B30',
      borderRadius: 10,
      gap: 8,
      marginTop: 8,
      shadowColor: '#FF3B30',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
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
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      flex: 1,
    },
    cardHeaderText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    cardRoad: {
      fontSize: 14,
      color: colors.textSecondary,
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
      backgroundColor: '#FF9500' + '15',
      borderRadius: 8,
      marginTop: 4,
      borderWidth: 1,
      borderColor: '#FF9500' + '30',
    },
    cardText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },
    warningText: {
      color: '#FF9500',
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
      borderRadius: 10,
      borderWidth: 1.5,
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
      borderTopColor: colors.border + '40',
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
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
      textAlign: 'center',
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
      borderRadius: 12,
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
      borderRadius: 12,
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
      borderRadius: 10,
      gap: 8,
    },
    viewToggleButtonActive: {
      backgroundColor: colors.primary + '15',
    },
    viewToggleText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    // Map View Styles
    mapViewContainer: {
      height: Dimensions.get('window').height - 300,
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapView: {
      flex: 1,
    },
    mapLegendOverlay: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mapLegendMarker: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mapLegendText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text,
    },
    mapResultsOverlay: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mapResultsText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    // Alternative Route Inline Styles
    alternativeRouteInline: {
      marginTop: 12,
      padding: 14,
      backgroundColor: colors.primary + '08',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + '30',
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
      backgroundColor: colors.primary + '15',
      borderRadius: 8,
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
    // Map Modal Styles
    mapModalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mapModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      gap: 12,
    },
    mapModalBackButton: {
      padding: 4,
    },
    mapModalHeaderText: {
      flex: 1,
    },
    mapModalTitle: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 2,
    },
    mapModalSubtitle: {
      fontSize: 13,
    },
    mapModalCloseButton: {
      padding: 4,
    },
    mapModalMap: {
      flex: 1,
    },
    customMarker: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    customMarkerInner: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
      elevation: 4,
    },
    zoomControls: {
      position: 'absolute',
      top: 16,
      right: 16,
      borderRadius: 10,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    zoomButton: {
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
    },
    zoomDivider: {
      height: 1,
      width: '100%',
    },
    mapModalLegend: {
      position: 'absolute',
      top: 16,
      left: 16,
      right: 80,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      borderWidth: 2,
      borderColor: 'white',
    },
    mapModalLegendText: {
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
    },
    mapModalBottomSheet: {
      borderTopWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    mapModalStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
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
  });
}


