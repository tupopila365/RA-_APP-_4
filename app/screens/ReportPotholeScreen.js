import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Conditionally import MapView
let MapView = null;
let Marker = null;
let PROVIDER_GOOGLE = null;
try {
  const MapModule = require('react-native-maps');
  MapView = MapModule.default;
  Marker = MapModule.Marker;
  PROVIDER_GOOGLE = MapModule.PROVIDER_GOOGLE;
} catch (error) {
  console.warn('MapView not available:', error.message);
}

// Conditionally import native modules
let Location = null;
let ImagePicker = null;
let ImageManipulator = null;
let MediaLibrary = null;

try {
  Location = require('expo-location');
  ImagePicker = require('expo-image-picker');
  ImageManipulator = require('expo-image-manipulator');
  MediaLibrary = require('expo-media-library');
} catch (error) {
  console.warn('Native modules not available:', error.message);
}

// Import unified design system components
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';
import { roadStatusService } from '../services/roadStatusService';
import RoadworkMap from '../components/RoadworkMap';

// Configuration
const CONFIG = {
  MAX_DISTANCE_KM: 100,
  EXIF_PHOTO_DISTANCE_THRESHOLD_KM: 5,
  DEFAULT_MAP_ZOOM: 0.01,
  NAMIBIA_BOUNDS: {
    minLat: -28.97,
    maxLat: -16.96,
    minLng: 11.73,
    maxLng: 25.27,
  },
  GOOGLE_PLACES_API_KEY: 'AIzaSyCuzul7JRWGUN2mbGSY-FqYgioUUf1RbnQ',
};

// Utility functions (same as original)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isWithinNamibia = (latitude, longitude) => {
  return (
    latitude >= CONFIG.NAMIBIA_BOUNDS.minLat &&
    latitude <= CONFIG.NAMIBIA_BOUNDS.maxLat &&
    longitude >= CONFIG.NAMIBIA_BOUNDS.minLng &&
    longitude <= CONFIG.NAMIBIA_BOUNDS.maxLng
  );
};

const extractPhotoLocation = async (photoUri) => {
  if (!ImageManipulator || !MediaLibrary) {
    console.log('EXIF reading not available');
    return null;
  }

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const asset = await MediaLibrary.getAssetInfoAsync(photoUri);
    
    if (asset.location && asset.location.latitude && asset.location.longitude) {
      console.log('EXIF GPS found:', asset.location);
      return {
        latitude: asset.location.latitude,
        longitude: asset.location.longitude,
        source: 'photo_exif',
      };
    }

    return null;
  } catch (error) {
    console.error('Error reading photo EXIF:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to get detailed address information
 */
const getAddressFromCoordinates = async (latitude, longitude) => {
  if (!Location) return null;

  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const address = results[0];
      
      // Extract detailed address components
      const street = address.street || address.name || '';
      const city = address.city || address.district || address.subregion || '';
      const region = address.region || address.country || '';
      
      // Format full address
      const fullAddress = `${street}, ${city}, ${region}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
      
      return {
        fullAddress: fullAddress || 'Address not found',
        street: street || 'Unknown Street',
        city: city || 'Unknown City',
        region: region || 'Unknown Region',
        components: address // Keep original for debugging
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Geocode a place name/address to coordinates
 */
const getCoordinatesFromAddress = async (searchQuery) => {
  if (!Location) return null;

  try {
    const results = await Location.geocodeAsync(searchQuery);
    if (results && results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// ========== MAIN COMPONENT ==========

export default function ReportPotholeScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  // State
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Location states
  const [currentLocation, setCurrentLocation] = useState(null); // User's current GPS location
  const [photoLocation, setPhotoLocation] = useState(null); // Location from photo EXIF
  const [selectedLocation, setSelectedLocation] = useState(null); // Final selected location for damage
  const [locationAddress, setLocationAddress] = useState('');

  // Form states
  const [photo, setPhoto] = useState(null);
  const [roadName, setRoadName] = useState('');
  const [townName, setTownName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [description, setDescription] = useState('');

  // UI states
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [locationSource, setLocationSource] = useState(null); // Track how location was determined
  const [roadworks, setRoadworks] = useState([]); // Roadwork data for map overlay
  const googlePlacesRef = useRef(null);

  // ========== LIFECYCLE ==========

  useEffect(() => {
    requestLocationPermission();
    fetchRoadworks(); // Fetch roadworks for map overlay
  }, []);

  // ========== LOCATION FUNCTIONS ==========

  const fetchRoadworks = async () => {
    try {
      const data = await roadStatusService.getRoadStatus();
      setRoadworks(data || []);
    } catch (error) {
      console.warn('Failed to fetch roadworks for map overlay:', error);
      // Don't show error to user, just continue without roadwork overlay
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);

      if (!Location) {
        Alert.alert(
          'Location Service Unavailable',
          'Location services are required to report road damage.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to report road damage.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      // Get current location
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      };

      setCurrentLocation(userLocation);

      // Initially, use current location as selected location
      // This will be updated when photo is selected or user picks on map
      if (!selectedLocation) {
        setSelectedLocation(userLocation);
        setLocationSource('current_gps');
        
        // Auto-populate address details for current location
        const addressInfo = await getAddressFromCoordinates(userLocation.latitude, userLocation.longitude);
        if (addressInfo) {
          setLocationAddress(addressInfo.fullAddress);
          // Auto-populate form fields if they're empty
          if (!townName && addressInfo.city !== 'Unknown City') {
            setTownName(addressInfo.city);
          }
          if (!streetName && addressInfo.street !== 'Unknown Street') {
            setStreetName(addressInfo.street);
          }
          if (!roadName && addressInfo.street !== 'Unknown Street') {
            setRoadName(addressInfo.street);
          }
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  // ========== PHOTO FUNCTIONS ==========

  const pickImage = async () => {
    try {
      setPhotoLoading(true);

      if (!ImagePicker) {
        Alert.alert(
          'Image Picker Unavailable',
          'Image picker requires a development build.',
          [{ text: 'OK' }]
        );
        setPhotoLoading(false);
        return;
      }

      // Show action sheet
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: async () => {
              await handleCameraCapture();
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              await handleGallerySelection();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setPhotoLoading(false),
          },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setPhotoLoading(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        setPhotoLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true, // Request EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedPhoto(result.assets[0]);
      }
      setPhotoLoading(false);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo.');
      setPhotoLoading(false);
    }
  };

  const handleGallerySelection = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required.');
        setPhotoLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true, // Request EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedPhoto(result.assets[0]);
      }
      setPhotoLoading(false);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select photo.');
      setPhotoLoading(false);
    }
  };

  /**
   * CRITICAL FUNCTION: Process photo and determine location
   */
  const processSelectedPhoto = async (asset) => {
    setPhoto(asset.uri);

    // Try to extract GPS from photo EXIF
    const exifLocation = await extractPhotoLocation(asset.uri);

    if (exifLocation) {
      // Photo has GPS data
      setPhotoLocation(exifLocation);

      // Validate the photo location
      if (!isWithinNamibia(exifLocation.latitude, exifLocation.longitude)) {
        Alert.alert(
          'Location Outside Namibia',
          'The photo appears to be taken outside Namibia. Please confirm the actual damage location on the map.',
          [{ text: 'OK', onPress: () => setShowMapPicker(true) }]
        );
        return;
      }

      // Calculate distance from current location
      if (currentLocation) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          exifLocation.latitude,
          exifLocation.longitude
        );

        if (distance > CONFIG.EXIF_PHOTO_DISTANCE_THRESHOLD_KM) {
          // Photo taken far from current location - require confirmation
          Alert.alert(
            'Photo Taken Elsewhere',
            `This photo was taken ${distance.toFixed(1)} km from your current location. Is the road damage at the photo location or your current location?`,
            [
              {
                text: 'Photo Location',
                onPress: async () => {
                  setSelectedLocation(exifLocation);
                  setLocationSource('photo_exif');
                  
                  // Auto-populate address details for photo location
                  const addressInfo = await getAddressFromCoordinates(exifLocation.latitude, exifLocation.longitude);
                  if (addressInfo) {
                    setLocationAddress(addressInfo.fullAddress);
                    // Auto-populate form fields if they're empty
                    if (!townName && addressInfo.city !== 'Unknown City') {
                      setTownName(addressInfo.city);
                    }
                    if (!streetName && addressInfo.street !== 'Unknown Street') {
                      setStreetName(addressInfo.street);
                    }
                    if (!roadName && addressInfo.street !== 'Unknown Street') {
                      setRoadName(addressInfo.street);
                    }
                  }
                  
                  setShowMapPicker(true); // Still show map for fine-tuning
                },
              },
              {
                text: 'Current Location',
                onPress: () => {
                  setSelectedLocation(currentLocation);
                  setLocationSource('current_gps');
                  setShowMapPicker(true);
                },
              },
              {
                text: 'Pick on Map',
                onPress: () => {
                  setShowMapPicker(true);
                },
              },
            ]
          );
        } else {
          // Photo taken nearby - suggest photo location
          setSelectedLocation(exifLocation);
          setLocationSource('photo_exif');
          
          // Auto-populate address details for photo location
          const addressInfo = await getAddressFromCoordinates(exifLocation.latitude, exifLocation.longitude);
          if (addressInfo) {
            setLocationAddress(addressInfo.fullAddress);
            // Auto-populate form fields if they're empty
            if (!townName && addressInfo.city !== 'Unknown City') {
              setTownName(addressInfo.city);
            }
            if (!streetName && addressInfo.street !== 'Unknown Street') {
              setStreetName(addressInfo.street);
            }
            if (!roadName && addressInfo.street !== 'Unknown Street') {
              setRoadName(addressInfo.street);
            }
          }
          
          Alert.alert(
            'Location Detected',
            `Using location from photo (${distance.toFixed(1)} km away). You can adjust the exact location on the map.`,
            [
              { text: 'Adjust on Map', onPress: () => setShowMapPicker(true) },
              { text: 'Use This Location', style: 'cancel' },
            ]
          );
        }
      } else {
        // No current location available, use photo location
        setSelectedLocation(exifLocation);
        setLocationSource('photo_exif');
        
        // Auto-populate address details for photo location
        const addressInfo = await getAddressFromCoordinates(exifLocation.latitude, exifLocation.longitude);
        if (addressInfo) {
          setLocationAddress(addressInfo.fullAddress);
          // Auto-populate form fields if they're empty
          if (!townName && addressInfo.city !== 'Unknown City') {
            setTownName(addressInfo.city);
          }
          if (!streetName && addressInfo.street !== 'Unknown Street') {
            setStreetName(addressInfo.street);
          }
          if (!roadName && addressInfo.street !== 'Unknown Street') {
            setRoadName(addressInfo.street);
          }
        }
      }
    } else {
      // No GPS in photo - require manual selection
      Alert.alert(
        'Location Required',
        'This photo does not contain location data. Please select the damage location on the map.',
        [{ text: 'Pick on Map', onPress: () => setShowMapPicker(true) }]
      );
    }
  };

  // ========== MAP FUNCTIONS ==========

  const openMapPicker = () => {
    // Check if MapView is available
    if (!MapView) {
      Alert.alert(
        'Map Not Available',
        'Maps require a development build and are not available in Expo Go. The report will use your current location or photo location.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Prepare map region based on best available location
    const initialLocation = selectedLocation || photoLocation || currentLocation;

    if (initialLocation) {
      setMapRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
        longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
      });
    } else {
      // Default to Windhoek, Namibia
      setMapRegion({
        latitude: -22.5597,
        longitude: 17.0832,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }

    setShowMapPicker(true);
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Update selected location
    setSelectedLocation({ latitude, longitude });
    setLocationSource('map_selected');

    // Get detailed address for display and form fields
    const addressInfo = await getAddressFromCoordinates(latitude, longitude);
    if (addressInfo) {
      setLocationAddress(addressInfo.fullAddress);
      // Auto-populate form fields if they're empty
      if (!townName && addressInfo.city !== 'Unknown City') {
        setTownName(addressInfo.city);
      }
      if (!streetName && addressInfo.street !== 'Unknown Street') {
        setStreetName(addressInfo.street);
      }
      if (!roadName && addressInfo.street !== 'Unknown Street') {
        setRoadName(addressInfo.street);
      }
    }
  };

  const handleMarkerDragEnd = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Update selected location
    setSelectedLocation({ latitude, longitude });
    setLocationSource('map_selected');

    // Get detailed address for display and form fields
    const addressInfo = await getAddressFromCoordinates(latitude, longitude);
    if (addressInfo) {
      setLocationAddress(addressInfo.fullAddress);
      // Auto-populate form fields if they're empty
      if (!townName && addressInfo.city !== 'Unknown City') {
        setTownName(addressInfo.city);
      }
      if (!streetName && addressInfo.street !== 'Unknown Street') {
        setStreetName(addressInfo.street);
      }
      if (!roadName && addressInfo.street !== 'Unknown Street') {
        setRoadName(addressInfo.street);
      }
    }
  };

  /**
   * Handle Google Places selection - Yango-style
   * Triggered when user selects a place from autocomplete dropdown
   */
  const handlePlaceSelect = async (data, details = null) => {
    if (!details || !details.geometry) {
      Alert.alert('Error', 'Could not get location details');
      return;
    }

    const coordinates = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };

    // Validate location is within Namibia
    if (!isWithinNamibia(coordinates.latitude, coordinates.longitude)) {
      Alert.alert(
        'Location Outside Namibia',
        'The selected location is outside Namibia. Please select a location within Namibia.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Update map region to center on selected location
    setMapRegion({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
      longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
    });

    // Set as selected location
    setSelectedLocation(coordinates);
    setLocationSource('map_selected');

    // Get formatted address and populate form fields
    const address = details.formatted_address || details.name;
    if (address) {
      setLocationAddress(address);
    }

    // Extract address components from Google Places details
    if (details.address_components) {
      let extractedTown = '';
      let extractedStreet = '';
      
      details.address_components.forEach(component => {
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          extractedTown = component.long_name;
        }
        if (component.types.includes('route') || component.types.includes('street_address')) {
          extractedStreet = component.long_name;
        }
      });

      // Auto-populate form fields if they're empty
      if (!townName && extractedTown) {
        setTownName(extractedTown);
      }
      if (!streetName && extractedStreet) {
        setStreetName(extractedStreet);
      }
      if (!roadName && extractedStreet) {
        setRoadName(extractedStreet);
      }
    }

    // Animate map to the new location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
        longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
      }, 1000);
    }
  };

  const confirmMapLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    // Validate location is within bounds
    if (!isWithinNamibia(selectedLocation.latitude, selectedLocation.longitude)) {
      Alert.alert(
        'Invalid Location',
        'Please select a location within Namibia.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check distance from current location (fraud prevention)
    if (currentLocation) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      if (distance > CONFIG.MAX_DISTANCE_KM) {
        Alert.alert(
          'Location Too Far',
          `The selected location is ${distance.toFixed(0)} km from your current location. Please report damage within ${CONFIG.MAX_DISTANCE_KM} km of your location.`,
          [{ text: 'Select Again' }]
        );
        return;
      }
    }

    setShowMapPicker(false);
  };

  // ========== SUBMIT FUNCTION ==========

  const handleSubmit = async () => {
    // Validation - Only photo and location are required!
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location for the road damage.');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Please take or select a photo of the damage.');
      return;
    }

    // Build confirmation message
    let confirmMessage = '';
    
    if (locationAddress) {
      confirmMessage += `Location: ${locationAddress}\n`;
    } else {
      confirmMessage += `Location: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}\n`;
    }
    
    if (townName.trim()) {
      confirmMessage += `Town: ${townName.trim()}\n`;
    }
    
    if (streetName.trim()) {
      confirmMessage += `Street: ${streetName.trim()}\n`;
    }
    
    if (roadName.trim()) {
      confirmMessage += `Road: ${roadName.trim()}\n`;
    }
    
    if (description.trim()) {
      confirmMessage += `Notes: ${description.trim()}\n`;
    }
    
    confirmMessage += '\nSubmit this report?';

    Alert.alert('Confirm Report', confirmMessage.trim(), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          try {
            setLoading(true);

            const reportData = {
              location: selectedLocation,
              locationSource, // Track how location was determined
              photoLocation, // Save original photo location for reference
              currentLocation, // Save user's current location for reference
              roadName: roadName.trim() || undefined, // Optional
              townName: townName.trim() || undefined, // Optional
              streetName: streetName.trim() || undefined, // Optional
              description: description.trim() || undefined,
              locationAddress,
            };

            const report = await potholeReportsService.createReport(reportData, photo);

            navigation.replace('ReportConfirmation', {
              referenceCode: report.referenceCode,
            });
          } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Error', error.message || 'Failed to submit report.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getLocationSourceLabel = (source) => {
    const labels = {
      current_gps: 'Current Location',
      photo_exif: 'Photo Location',
      map_selected: 'Manual Selection',
    };
    return labels[source] || 'Unknown';
  };

  // ========== RENDER ==========

  const styles = getStyles(colors, insets);

  // Calculate progress
  const getProgress = () => {
    let completed = 0;
    if (photo) completed++;
    if (selectedLocation) completed++;
    return Math.round((completed / 2) * 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>{getProgress()}% Complete</Text>
          </View>

          {/* Photo Section - FIRST AND PROMINENT */}
          <View style={styles.mainPhotoSection}>
            <Text style={styles.mainSectionTitle}>Step 1 — Capture Photo</Text>
            <Text style={styles.mainSectionSubtitle}>
              Capture the road damage clearly
            </Text>

            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoLarge} />
                <View style={styles.photoOverlay}>
                  {photoLocation && (
                    <View style={styles.photoInfoBadgeInline}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.photoInfoTextInline}>Location detected</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.changePhotoButtonInline} 
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={18} color="#fff" />
                    <Text style={styles.changePhotoTextInline}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoPlaceholderLarge}
                onPress={pickImage}
                disabled={photoLoading}
                activeOpacity={0.7}
              >
                {photoLoading ? (
                  <UnifiedSkeletonLoader type="circle" width={40} height={40} />
                ) : (
                  <>
                    <View style={styles.cameraIconCircle}>
                      <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.photoPlaceholderTextLarge}>Tap to Capture Photo</Text>
                    <Text style={styles.photoPlaceholderHint}>or select from gallery</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Location Section - INLINE AND MINIMAL */}
          {selectedLocation && (
            <View style={styles.locationInline}>
              <View style={styles.locationInlineHeader}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                <Text style={styles.locationInlineTitle}>Location Detected</Text>
              </View>
              {locationAddress ? (
                <Text style={styles.locationInlineAddress}>{locationAddress}</Text>
              ) : (
                <Text style={styles.locationInlineAddress}>
                  Near {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </Text>
              )}
              <TouchableOpacity 
                style={styles.adjustLocationButton} 
                onPress={openMapPicker}
              >
                <Ionicons name="map" size={16} color={colors.primary} />
                <Text style={styles.adjustLocationText}>Adjust on map</Text>
              </TouchableOpacity>
            </View>
          )}

          {!selectedLocation && !locationLoading && (
            <TouchableOpacity 
              style={styles.getLocationButton} 
              onPress={requestLocationPermission}
            >
              <Ionicons name="locate" size={20} color={colors.primary} />
              <Text style={styles.getLocationText}>Get Current Location</Text>
            </TouchableOpacity>
          )}

          {locationLoading && (
            <View style={styles.locationLoadingInline}>
              <UnifiedSkeletonLoader type="circle" width={16} height={16} />
              <Text style={styles.locationLoadingText}>Getting location...</Text>
            </View>
          )}

          {/* Expandable More Details Section */}
          {/* Additional Details Section */}
          <View style={styles.additionalDetailsSection}>
            <Text style={styles.mainSectionTitle}>Step 2 — Additional Details (Optional)</Text>
            <Text style={styles.mainSectionSubtitle}>
              Help us locate the damage more precisely
            </Text>

            <View style={styles.additionalDetailsContent}>
              <UnifiedFormInput
                value={townName}
                onChangeText={setTownName}
                placeholder="e.g., Windhoek, Swakopmund, Walvis Bay"
                label="Town / City"
                iconName="location-outline"
              />
              
              <View style={styles.formSpacing} />
              
              <UnifiedFormInput
                value={streetName}
                onChangeText={setStreetName}
                placeholder="e.g., Independence Avenue, Sam Nujoma Drive"
                label="Street Name"
                iconName="trail-sign-outline"
              />
              
              <View style={styles.formSpacing} />
              
              <UnifiedFormInput
                value={roadName}
                onChangeText={setRoadName}
                placeholder="e.g., B1 Highway, Main Road"
                label="Road Name / Landmark"
                iconName="map-outline"
              />
              
              <View style={styles.formSpacing} />
              
              <UnifiedFormInput
                value={description}
                onChangeText={setDescription}
                placeholder="Any additional details..."
                label="Additional Notes"
                textArea
                iconName="document-text-outline"
              />
            </View>
          </View>

          {/* Bottom spacing for submit button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Submit Button */}
        <View style={styles.floatingButtonContainer}>
          <UnifiedButton
            variant="primary"
            label={loading ? "Submitting..." : "Submit Report"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !selectedLocation || !photo}
            size="large"
            fullWidth
            iconName="checkmark-circle"
            style={styles.submitButtonFloating}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMapPicker(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Damage Location</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Google Places Autocomplete - Yango Style */}
          <View style={styles.searchWrapper}>
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="Search for streets, shops, landmarks..."
              onPress={handlePlaceSelect}
              fetchDetails={true}
              enablePoweredByContainer={false}
              keepResultsAfterBlur={true}
              listViewDisplayed="auto"
              suppressDefaultStyles={false}
              requestUrl={{
                useOnPlatform: 'all',
              }}
              onFail={(error) => {
                console.error('Google Places API Error:', error);
                Alert.alert(
                  'Search Error',
                  'Unable to fetch location suggestions. Please check your internet connection or try again later.'
                );
              }}
              onNotFound={() => {
                console.log('No results found');
              }}
              query={{
                key: CONFIG.GOOGLE_PLACES_API_KEY,
                language: 'en',
                components: 'country:na', // RESTRICT TO NAMIBIA ONLY
                types: '(cities)|establishment|geocode', // Include cities, establishments, and addresses
                radius: 50000, // 50km radius
              }}
              styles={{
                container: {
                  flex: 0,
                  zIndex: 2000,
                },
                textInputContainer: {
                  backgroundColor: colors.background,
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  zIndex: 2001,
                },
                textInput: {
                  backgroundColor: '#FFFFFF', // Solid white background
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: 15,
                  paddingLeft: 40,
                  height: 44,
                  // Android-safe elevation
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 1, // Reduced from 3 to 1
                    },
                  }),
                },
                predefinedPlacesDescription: {
                  color: colors.primary,
                },
                listView: {
                  position: 'absolute',
                  top: 68,
                  left: 16,
                  right: 16,
                  backgroundColor: '#FFFFFF', // Solid white background
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  maxHeight: 250,
                  // Android-safe elevation
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 2, // Reduced from 10 to 2 for Android safety
                    },
                  }),
                  zIndex: 2002,
                  // NO overflow: 'hidden' to prevent Android clipping
                },
                row: {
                  backgroundColor: colors.card,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  zIndex: 2003,
                },
                separator: {
                  height: 0,
                },
                description: {
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: '600',
                },
                loader: {
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  height: 20,
                  paddingHorizontal: 16,
                },
                poweredContainer: {
                  display: 'none',
                },
              }}
              textInputProps={{
                placeholderTextColor: colors.textSecondary,
                returnKeyType: 'search',
                leftIcon: { type: 'ionicon', name: 'search' },
              }}
              renderLeftButton={() => (
                <View style={styles.searchIconContainer}>
                  <Ionicons name="search" size={20} color={colors.textSecondary} />
                </View>
              )}
              renderRightButton={() => (
                <TouchableOpacity
                  style={styles.clearButtonContainer}
                  onPress={() => {
                    if (googlePlacesRef.current) {
                      googlePlacesRef.current.clear();
                    }
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              debounce={400}
              minLength={2}
              nearbyPlacesAPI="GooglePlacesSearch"
              GooglePlacesSearchQuery={{
                rankby: 'distance',
              }}
            />
          </View>

          <View style={styles.mapContainer}>
            <RoadworkMap
              region={mapRegion}
              onPress={handleMapPress}
              roadworks={roadworks}
              selectedLocation={selectedLocation}
              onMarkerDragEnd={handleMarkerDragEnd}
              showRoadworks={true}
              showSelectedMarker={true}
              markerTitle="Damage Location"
              markerDescription="Drag to adjust"
              style={styles.map}
            />
          </View>

          <View style={styles.mapInstructions}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.mapInstructionsText}>
              Tap on the map or drag the pin to the exact location of the road damage
            </Text>
          </View>

          {selectedLocation && (
            <View style={styles.mapCoordinates}>
              <Text style={styles.mapCoordinatesText}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
              {locationAddress && (
                <Text style={styles.mapAddressText}>{locationAddress}</Text>
              )}
            </View>
          )}

          <UnifiedButton
            variant="primary"
            label="Confirm Location"
            onPress={confirmMapLocation}
            disabled={!selectedLocation}
            fullWidth
            size="large"
            iconName="checkmark"
            style={styles.confirmButton}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ========== STYLES ==========

function getStyles(colors, insets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: spacing.xxl + (insets?.bottom || 0) + 20,
      flexGrow: 1,
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    locationCard: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.success,
      marginBottom: 12,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    locationLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
    },
    locationText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      marginBottom: 4,
    },
    locationAddress: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 14,
      backgroundColor: colors.primary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    mapButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    photoContainer: {
      alignItems: 'center',
    },
    photo: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    photoInfoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: colors.success,
      borderRadius: 6,
      marginBottom: 8,
    },
    photoInfoText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.success,
    },
    changePhotoButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    changePhotoText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    photoPlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: colors.card,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border || '#E0E0E0',
      borderStyle: 'dashed',
    },
    photoPlaceholderText: {
      marginTop: 12,
      color: colors.textSecondary,
      fontSize: 14,
    },
    severityContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    severityOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border || '#E0E0E0',
      gap: 8,
    },
    severityDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    severityText: {
      color: colors.text,
      fontSize: 14,
    },
    submitButton: {
      marginTop: spacing.sm,
    },

    // NEW IMPROVED STYLES
    // Progress Indicator
    progressSection: {
      marginBottom: 24,
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Main Photo Section
    mainPhotoSection: {
      marginBottom: 24,
    },
    mainSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    mainSectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    photoLarge: {
      width: '100%',
      height: 280,
      borderRadius: 12,
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#000000', // Solid black instead of rgba
      opacity: 0.7, // Use opacity on the container instead
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    photoInfoBadgeInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: '#FFFFFF', // Solid white instead of rgba
      opacity: 0.9, // Use opacity instead of rgba
      borderRadius: 20,
    },
    photoInfoTextInline: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    changePhotoButtonInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: '#FFFFFF', // Solid white instead of rgba
      opacity: 0.9, // Use opacity instead of rgba
      borderRadius: 20,
    },
    changePhotoTextInline: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
    },
    photoPlaceholderLarge: {
      width: '100%',
      height: 280,
      backgroundColor: colors.card,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cameraIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    photoPlaceholderTextLarge: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    photoPlaceholderHint: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },

    // Location Inline
    locationInline: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.success,
    },
    locationInlineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    locationInlineTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.success,
    },
    locationInlineAddress: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
      lineHeight: 20,
    },
    adjustLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
    },
    adjustLocationText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    getLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: 24,
    },
    getLocationText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    locationLoadingInline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 24,
    },
    locationLoadingText: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    // Additional Details Section
    additionalDetailsSection: {
      marginBottom: 24,
    },
    additionalDetailsContent: {
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    formSpacing: {
      height: 16,
    },

    // Floating Submit Button
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: (insets?.bottom || 0) + 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2, // Reduced from 5 to 2
        },
      }),
    },
    submitButtonFloating: {
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2, // Reduced from 3 to 2
        },
      }),
    },

    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    searchWrapper: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 2000,
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2, // Reduced from 10 to 2 for Android safety
        },
      }),
      position: 'relative',
    },
    searchIconContainer: {
      position: 'absolute',
      left: 28,
      top: 24,
      zIndex: 1,
    },
    clearButtonContainer: {
      position: 'absolute',
      right: 28,
      top: 24,
      zIndex: 1,
      padding: 4,
    },
    mapContainer: {
      flex: 1,
      zIndex: 1,
    },
    map: {
      flex: 1,
    },
    mapInstructions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 16,
      backgroundColor: colors.card,
    },
    mapInstructionsText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    mapCoordinates: {
      padding: 16,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    mapCoordinatesText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    mapAddressText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    confirmButton: {
      margin: 16,
      marginTop: 0,
    },
  });
}

