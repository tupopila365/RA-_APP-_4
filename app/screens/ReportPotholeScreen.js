import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// Single map import — MapComponent handles react-native-maps
import { isMapAvailable } from '../components/MapComponent';

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
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { useTheme } from '../hooks/useTheme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { potholeReportsService } from '../services/potholeReportsService';
import { roadStatusService } from '../services/roadStatusService';

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

export default function ReportPotholeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
  const [locationSource, setLocationSource] = useState(null); // Track how location was determined
  const [roadworks, setRoadworks] = useState([]); // Roadwork data for map overlay

  // Confirmation card (replaces system Alert)
  const [confirmationCard, setConfirmationCard] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
    confirmLabel: 'OK',
    cancelLabel: null,
    tertiaryLabel: null,
    scrollable: false,
    onConfirm: null,
    onCancel: null,
    onTertiary: null,
  });

  const showConfirmation = (config) => {
    const wrap = (fn) => (fn ? () => { fn(); setConfirmationCard((c) => ({ ...c, visible: false })); } : undefined);
    setConfirmationCard({
      visible: true,
      title: config.title || '',
      message: config.message || '',
      variant: config.variant || 'info',
      confirmLabel: config.confirmLabel || 'OK',
      cancelLabel: config.cancelLabel ?? null,
      tertiaryLabel: config.tertiaryLabel ?? null,
      scrollable: config.scrollable || false,
      onConfirm: wrap(config.onConfirm),
      onCancel: wrap(config.onCancel),
      onTertiary: wrap(config.onTertiary),
    });
  };

  const hideConfirmation = () => {
    setConfirmationCard((c) => ({ ...c, visible: false }));
  };

  // ========== LIFECYCLE ==========

  useEffect(() => {
    requestLocationPermission();
    fetchRoadworks(); // Fetch roadworks for map overlay
  }, []);

  // Receive location result when returning from SetLocationScreen
  const route = useRoute();
  useFocusEffect(
    React.useCallback(() => {
      const result = route.params?.locationResult;
      if (result?.selectedLocation) {
        setSelectedLocation(result.selectedLocation);
        setLocationAddress(result.locationAddress || '');
        setLocationSource(result.locationSource || 'map_selected');
        if (result.formFields) {
          if (result.formFields.townName != null) setTownName(result.formFields.townName);
          if (result.formFields.streetName != null) setStreetName(result.formFields.streetName);
          if (result.formFields.roadName != null) setRoadName(result.formFields.roadName);
        }
        navigation.setParams({ locationResult: undefined });
      }
    }, [route.params, navigation])
  );

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
        showConfirmation({
          title: 'Location Service Unavailable',
          message: 'Location services are required to report road damage.',
          variant: 'error',
          confirmLabel: 'OK',
          onConfirm: () => {},
        });
        setLocationLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showConfirmation({
          title: 'Location Permission Required',
          message: 'Please enable location services to report road damage.',
          variant: 'warning',
          confirmLabel: 'OK',
          onConfirm: () => {},
        });
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
      showConfirmation({
        title: 'Error',
        message: 'Failed to get your location. Please try again.',
        variant: 'error',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // ========== PHOTO FUNCTIONS ==========

  const pickImage = async () => {
    try {
      setPhotoLoading(true);

      if (!ImagePicker) {
        showConfirmation({
          title: 'Image Picker Unavailable',
          message: 'Image picker requires a development build.',
          variant: 'warning',
          confirmLabel: 'OK',
          onConfirm: () => {},
        });
        setPhotoLoading(false);
        return;
      }

      showConfirmation({
        title: 'Select Photo',
        message: 'Choose an option',
        variant: 'info',
        confirmLabel: 'Camera',
        tertiaryLabel: 'Gallery',
        cancelLabel: 'Cancel',
        onConfirm: () => handleCameraCapture(),
        onTertiary: () => handleGallerySelection(),
        onCancel: () => setPhotoLoading(false),
      });
    } catch (error) {
      console.error('Error picking image:', error);
      showConfirmation({
        title: 'Error',
        message: 'Failed to pick image. Please try again.',
        variant: 'error',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
      setPhotoLoading(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showConfirmation({
          title: 'Permission Denied',
          message: 'Camera permission is required.',
          variant: 'warning',
          confirmLabel: 'OK',
          onConfirm: () => {},
        });
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
      showConfirmation({
        title: 'Error',
        message: 'Failed to capture photo.',
        variant: 'error',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
      setPhotoLoading(false);
    }
  };

  const handleGallerySelection = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showConfirmation({
          title: 'Permission Denied',
          message: 'Gallery permission is required.',
          variant: 'warning',
          confirmLabel: 'OK',
          onConfirm: () => {},
        });
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
      showConfirmation({
        title: 'Error',
        message: 'Failed to select photo.',
        variant: 'error',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
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
        showConfirmation({
          title: 'Location Outside Namibia',
          message: 'The photo appears to be taken outside Namibia. Please confirm the actual damage location on the map.',
          variant: 'warning',
          confirmLabel: 'OK',
          onConfirm: openMapPicker,
        });
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
          showConfirmation({
            title: 'Photo Taken Elsewhere',
            message: `This photo was taken ${distance.toFixed(1)} km from your current location. Is the road damage at the photo location or your current location?`,
            variant: 'warning',
            confirmLabel: 'Photo Location',
            tertiaryLabel: 'Current Location',
            cancelLabel: 'Pick on Map',
            onConfirm: async () => {
              setSelectedLocation(exifLocation);
              setLocationSource('photo_exif');
              const addressInfo = await getAddressFromCoordinates(exifLocation.latitude, exifLocation.longitude);
              if (addressInfo) {
                setLocationAddress(addressInfo.fullAddress);
                if (!townName && addressInfo.city !== 'Unknown City') setTownName(addressInfo.city);
                if (!streetName && addressInfo.street !== 'Unknown Street') setStreetName(addressInfo.street);
                if (!roadName && addressInfo.street !== 'Unknown Street') setRoadName(addressInfo.street);
              }
              openMapPicker();
            },
            onTertiary: () => {
              setSelectedLocation(currentLocation);
              setLocationSource('current_gps');
              openMapPicker();
            },
            onCancel: openMapPicker,
          });
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
          
          showConfirmation({
            title: 'Location Detected',
            message: `Using location from photo (${distance.toFixed(1)} km away). You can adjust the exact location on the map.`,
            variant: 'success',
            confirmLabel: 'Adjust on Map',
            cancelLabel: 'Use This Location',
            onConfirm: openMapPicker,
            onCancel: () => {},
          });
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
      showConfirmation({
        title: 'Location Required',
        message: 'This photo does not contain location data. Please select the damage location on the map.',
        variant: 'info',
        confirmLabel: 'Pick on Map',
        onConfirm: openMapPicker,
      });
    }
  };

  // ========== MAP FUNCTIONS ==========

  const openMapPicker = () => {
    if (!isMapAvailable) {
      showConfirmation({
        title: 'Map Not Available',
        message: 'Maps require a development build and are not available in Expo Go. The report will use your current location or photo location.',
        variant: 'warning',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
      return;
    }
    navigation.navigate('SetLocation', {
      initialLocation: selectedLocation || photoLocation || currentLocation,
      currentLocation,
      roadworks,
      locationAddress: selectedLocation ? locationAddress : undefined,
    });
  };

  // ========== SUBMIT FUNCTION ==========

  const handleSubmit = async () => {
    if (!selectedLocation) {
      showConfirmation({
        title: 'Error',
        message: 'Please select a location for the road damage.',
        variant: 'error',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
      return;
    }

    if (!photo) {
      showConfirmation({
        title: 'Error',
        message: 'Please take or select a photo of the damage.',
        variant: 'error',
        confirmLabel: 'OK',
        onConfirm: () => {},
      });
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

    showConfirmation({
      title: 'Confirm Report',
      message: confirmMessage.trim(),
      variant: 'info',
      confirmLabel: 'Submit',
      cancelLabel: 'Cancel',
      scrollable: true,
      onConfirm: async () => {
        try {
          setLoading(true);
          const reportData = {
            location: selectedLocation,
            locationSource,
            photoLocation,
            currentLocation,
            roadName: roadName.trim() || undefined,
            townName: townName.trim() || undefined,
            streetName: streetName.trim() || undefined,
            description: description.trim() || undefined,
            locationAddress,
          };
          const report = await potholeReportsService.createReport(reportData, photo);
          hideConfirmation();
          navigation.replace('ReportConfirmation', {
            referenceCode: report.referenceCode,
          });
        } catch (error) {
          console.error('Error submitting report:', error);
          hideConfirmation();
          showConfirmation({
            title: 'Error',
            message: error.message || 'Failed to submit report.',
            variant: 'error',
            confirmLabel: 'OK',
            onConfirm: () => {},
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
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
          {/* Stepper Progress */}
          <View style={styles.stepperSection}>
            <View style={styles.stepperRow}>
              <View style={[styles.stepperDot, photo && styles.stepperDotComplete]}>
                <Ionicons
                  name={photo ? 'checkmark' : 'camera'}
                  size={photo ? 14 : 16}
                  color={photo ? '#fff' : colors.textSecondary}
                />
              </View>
              <View style={[styles.stepperLine, photo && styles.stepperLineComplete]} />
              <View style={[styles.stepperDot, selectedLocation && styles.stepperDotComplete]}>
                <Ionicons
                  name={selectedLocation ? 'checkmark' : 'location'}
                  size={selectedLocation ? 14 : 16}
                  color={selectedLocation ? '#fff' : colors.textSecondary}
                />
              </View>
            </View>
            <View style={styles.stepperLabels}>
              <Text style={[styles.stepperLabel, photo && styles.stepperLabelComplete]}>Photo</Text>
              <Text style={[styles.stepperLabel, selectedLocation && styles.stepperLabelComplete]}>Location</Text>
            </View>
          </View>

          {/* Section 1: Photo */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, photo && styles.sectionBadgeComplete]}>
                <Text style={[styles.sectionBadgeText, photo && styles.sectionBadgeTextComplete]}>1</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Evidence Photo</Text>
                <Text style={styles.sectionSubtitle}>Required • Clear image of the damage</Text>
              </View>
            </View>

            {photo ? (
              <View style={styles.photoCard}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <View style={styles.photoActions}>
                  {photoLocation && (
                    <View style={styles.photoBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text style={styles.photoBadgeText}>GPS captured</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.photoActionButton}
                    onPress={pickImage}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera" size={18} color={colors.primary} />
                    <Text style={styles.photoActionText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoPlaceholder}
                onPress={pickImage}
                disabled={photoLoading}
                activeOpacity={0.7}
              >
                {photoLoading ? (
                  <View style={styles.photoLoadingState}>
                    <UnifiedSkeletonLoader type="circle" width={48} height={48} />
                    <Text style={styles.photoPlaceholderHint}>Preparing camera...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.photoPlaceholderIcon}>
                      <Ionicons name="camera" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.photoPlaceholderTitle}>Capture or upload photo</Text>
                    <Text style={styles.photoPlaceholderHint}>Camera or gallery • Image helps verify the report</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Section 2: Location */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, selectedLocation && styles.sectionBadgeComplete]}>
                <Text style={[styles.sectionBadgeText, selectedLocation && styles.sectionBadgeTextComplete]}>2</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Damage Location</Text>
                <Text style={styles.sectionSubtitle}>Required • Where is the damage?</Text>
              </View>
            </View>

            {locationLoading && (
              <View style={[styles.locationCard, styles.locationCardLoading]}>
                <UnifiedSkeletonLoader type="list-item" />
              </View>
            )}

            {selectedLocation && !locationLoading && (
              <TouchableOpacity
                style={styles.locationCard}
                onPress={openMapPicker}
                activeOpacity={0.8}
              >
                <View style={styles.locationCardLeft}>
                  <View style={styles.locationIconWrap}>
                    <Ionicons name="navigate" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.locationCardText}>
                    <Text style={styles.locationCardTitle} numberOfLines={1}>
                      {locationAddress || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
                    </Text>
                    <Text style={styles.locationCardSource}>
                      {getLocationSourceLabel(locationSource)}
                    </Text>
                  </View>
                </View>
                <View style={styles.locationCardRight}>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            )}

            {!selectedLocation && !locationLoading && (
              <TouchableOpacity
                style={styles.locationPlaceholder}
                onPress={requestLocationPermission}
                activeOpacity={0.7}
              >
                <View style={styles.locationPlaceholderIcon}>
                  <Ionicons name="locate-outline" size={28} color={colors.primary} />
                </View>
                <Text style={styles.locationPlaceholderTitle}>Use current location</Text>
                <Text style={styles.locationPlaceholderHint}>Tap to detect your GPS position</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section 3: Optional Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, styles.sectionBadgeOptional]}>
                <Text style={styles.sectionBadgeText}>3</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Additional Details</Text>
                <Text style={styles.sectionSubtitle}>Optional • Improves response accuracy</Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <UnifiedFormInput
                value={townName}
                onChangeText={setTownName}
                placeholder="e.g., Windhoek, Swakopmund"
                label="Town / City"
                iconName="business-outline"
              />
              <View style={styles.formGap} />
              <UnifiedFormInput
                value={streetName}
                onChangeText={setStreetName}
                placeholder="e.g., Independence Avenue"
                label="Street Name"
                iconName="trail-sign-outline"
              />
              <View style={styles.formGap} />
              <UnifiedFormInput
                value={roadName}
                onChangeText={setRoadName}
                placeholder="e.g., B1 Highway, Main Road"
                label="Road / Landmark"
                iconName="map-outline"
              />
              <View style={styles.formGap} />
              <UnifiedFormInput
                value={description}
                onChangeText={setDescription}
                placeholder="Any extra details (severity, safety concerns...)"
                label="Notes"
                textArea
                iconName="document-text-outline"
              />
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={styles.submitSection}>
          <UnifiedButton
            variant="primary"
            label={loading ? 'Submitting...' : 'Submit Report'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !selectedLocation || !photo}
            size="large"
            fullWidth
            iconName="checkmark-circle"
          />
        </View>
      </KeyboardAvoidingView>

      <ConfirmationCard
        visible={confirmationCard.visible}
        title={confirmationCard.title}
        message={confirmationCard.message}
        variant={confirmationCard.variant}
        confirmLabel={confirmationCard.confirmLabel}
        cancelLabel={confirmationCard.cancelLabel}
        tertiaryLabel={confirmationCard.tertiaryLabel}
        onConfirm={confirmationCard.onConfirm}
        onCancel={confirmationCard.onCancel}
        onTertiary={confirmationCard.onTertiary}
        onRequestClose={hideConfirmation}
        scrollable={confirmationCard.scrollable}
      />
    </SafeAreaView>
  );
}

// ========== STYLES ==========

function getStyles(colors, insets) {
  const bottomInset = insets?.bottom || 0;

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
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: 120 + bottomInset,
      flexGrow: 1,
    },
    bottomSpacer: {
      height: spacing.xxl,
    },

    // Stepper
    stepperSection: {
      marginBottom: spacing.xxl,
      alignItems: 'center',
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepperDotComplete: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepperLine: {
      width: 48,
      height: 2,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    stepperLineComplete: {
      backgroundColor: colors.primary,
    },
    stepperLabels: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: 80,
    },
    stepperLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    stepperLabelComplete: {
      color: colors.primary,
      fontWeight: '600',
    },

    // Section layout
    section: {
      marginBottom: spacing.xxl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    sectionBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    sectionBadgeComplete: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sectionBadgeOptional: {
      backgroundColor: colors.backgroundSecondary,
    },
    sectionBadgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    sectionBadgeTextComplete: {
      color: '#FFFFFF',
    },
    sectionHeaderText: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    // Photo
    photoCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    photoImage: {
      width: '100%',
      height: 240,
      backgroundColor: colors.backgroundSecondary,
    },
    photoActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    photoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    photoBadgeText: {
      fontSize: 13,
      color: colors.success,
      fontWeight: '600',
    },
    photoActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    photoActionText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    photoPlaceholder: {
      minHeight: 200,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xxl,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
        android: { elevation: 1 },
      }),
    },
    photoPlaceholderIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    photoPlaceholderTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    photoPlaceholderHint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    photoLoadingState: {
      alignItems: 'center',
      gap: spacing.md,
    },

    // Location
    locationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.success,
      minHeight: 72,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    locationCardLoading: {
      borderColor: colors.border,
    },
    locationCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    locationIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    locationCardText: {
      flex: 1,
    },
    locationCardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    locationCardSource: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    locationCardRight: {
      paddingLeft: spacing.sm,
    },
    locationPlaceholder: {
      minHeight: 120,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xxl,
    },
    locationPlaceholderIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    locationPlaceholderTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    locationPlaceholderHint: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    // Details form
    detailsCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formGap: {
      height: spacing.lg,
    },

    // Submit
    submitSection: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.lg,
      paddingBottom: bottomInset + spacing.lg,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8 },
        android: { elevation: 4 },
      }),
    },
  });
}

