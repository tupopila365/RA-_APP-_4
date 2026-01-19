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
import RoadsMap, { MAP_MODES, MARKER_TYPES } from '../components/RoadsMap';

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

import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';
import { SkeletonLoader, FormInput, Button } from '../components';
import { spacing } from '../theme/spacing';

const SEVERITY_OPTIONS = [
  { value: 'small', label: 'Small', color: '#4ECDC4' },
  { value: 'medium', label: 'Medium', color: '#FFA500' },
  { value: 'dangerous', label: 'Dangerous', color: '#FF6B6B' },
];

// ========== CONFIGURATION ==========
const CONFIG = {
  MAX_DISTANCE_KM: 100, // Maximum distance user can report from current location (prevents spam)
  EXIF_PHOTO_DISTANCE_THRESHOLD_KM: 5, // If photo location differs by more than this, require manual confirmation
  DEFAULT_MAP_ZOOM: 0.01, // Initial map zoom level (latitude/longitude delta)
  NAMIBIA_BOUNDS: {
    // Namibia approximate bounds for validation
    minLat: -28.97,
    maxLat: -16.96,
    minLng: 11.73,
    maxLng: 25.27,
  },
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
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

/**
 * Check if coordinates are within Namibia bounds
 */
const isWithinNamibia = (latitude, longitude) => {
  return (
    latitude >= CONFIG.NAMIBIA_BOUNDS.minLat &&
    latitude <= CONFIG.NAMIBIA_BOUNDS.maxLat &&
    longitude >= CONFIG.NAMIBIA_BOUNDS.minLng &&
    longitude <= CONFIG.NAMIBIA_BOUNDS.maxLng
  );
};

/**
 * Extract GPS coordinates from photo EXIF data
 * @returns {latitude, longitude} or null if not available
 */
const extractPhotoLocation = async (photoUri) => {
  if (!ImageManipulator || !MediaLibrary) {
    console.log('EXIF reading not available');
    return null;
  }

  try {
    // Request permission to read media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    // Get asset info including EXIF data
    const asset = await MediaLibrary.getAssetInfoAsync(photoUri);
    
    if (asset.location && asset.location.latitude && asset.location.longitude) {
      console.log('✅ EXIF GPS found:', asset.location);
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
 * Reverse geocode coordinates to get address
 */
const getAddressFromCoordinates = async (latitude, longitude) => {
  if (!Location) return null;

  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const address = results[0];
      return `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
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
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');

  // UI states
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [locationSource, setLocationSource] = useState(null); // Track how location was determined

  // ========== LIFECYCLE ==========

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // ========== LOCATION FUNCTIONS ==========

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
          '⚠️ Location Outside Namibia',
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
            '📍 Photo Taken Elsewhere',
            `This photo was taken ${distance.toFixed(1)} km from your current location. Is the road damage at the photo location or your current location?`,
            [
              {
                text: 'Photo Location',
                onPress: () => {
                  setSelectedLocation(exifLocation);
                  setLocationSource('photo_exif');
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
          Alert.alert(
            '✅ Location Detected',
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
      }
    } else {
      // No GPS in photo - require manual selection
      Alert.alert(
        '📍 Location Required',
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

    // Get address for display
    const address = await getAddressFromCoordinates(latitude, longitude);
    if (address) {
      setLocationAddress(address);
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
    // Validation
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location for the road damage.');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Please take or select a photo of the damage.');
      return;
    }

    if (!roadName.trim()) {
      Alert.alert('Error', 'Please enter the road name or nearby landmark.');
      return;
    }

    // Final confirmation with details
    const confirmMessage = `
Location: ${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}
${locationAddress ? `Address: ${locationAddress}` : ''}
Location Source: ${getLocationSourceLabel(locationSource)}
Road: ${roadName}
Severity: ${severity}

Submit this report?
    `.trim();

    Alert.alert('Confirm Report', confirmMessage, [
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
              roadName: roadName.trim(),
              severity,
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
        >
          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Damage Location</Text>
            </View>

            {locationLoading ? (
              <View style={styles.loadingContainer}>
                <SkeletonLoader type="circle" width={16} height={16} />
                <Text style={styles.loadingText}>Getting location...</Text>
              </View>
            ) : selectedLocation ? (
              <View>
                <View style={styles.locationCard}>
                  <View style={styles.locationHeader}>
                    <Ionicons name="pin" size={20} color={colors.success} />
                    <Text style={styles.locationLabel}>
                      {getLocationSourceLabel(locationSource)}
                    </Text>
                  </View>
                  <Text style={styles.locationText}>
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </Text>
                  {locationAddress && (
                    <Text style={styles.locationAddress}>{locationAddress}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.mapButton} onPress={openMapPicker}>
                  <Ionicons name="map-outline" size={20} color={colors.primary} />
                  <Text style={styles.mapButtonText}>Adjust Location on Map</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                label="Get Current Location"
                onPress={requestLocationPermission}
                iconName="locate-outline"
                fullWidth
              />
            )}
          </View>

          {/* Photo Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Photo Evidence</Text>
            </View>

            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                {photoLocation && (
                  <View style={styles.photoInfoBadge}>
                    <Ionicons name="location" size={14} color={colors.success} />
                    <Text style={styles.photoInfoText}>Photo has GPS data</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoPlaceholder}
                onPress={pickImage}
                disabled={photoLoading}
              >
                {photoLoading ? (
                  <SkeletonLoader type="circle" width={16} height={16} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                    <Text style={styles.photoPlaceholderText}>Tap to take or select photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Road Name */}
          <View style={styles.section}>
            <FormInput
              value={roadName}
              onChangeText={setRoadName}
              placeholder="e.g., B1 Highway near Hosea Kutako"
              label="Road Name / Landmark *"
            />
          </View>

          {/* Severity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Severity *</Text>
            <View style={styles.severityContainer}>
              {SEVERITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.severityOption,
                    severity === option.value && {
                      backgroundColor: option.color + '20',
                      borderColor: option.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSeverity(option.value)}
                >
                  <View style={[styles.severityDot, { backgroundColor: option.color }]} />
                  <Text
                    style={[
                      styles.severityText,
                      severity === option.value && { color: option.color, fontWeight: 'bold' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <FormInput
              value={description}
              onChangeText={setDescription}
              placeholder="Additional details about the damage..."
              label="Description (Optional)"
              textArea
            />
          </View>

          {/* Submit Button */}
          <Button
            label="Submit Report"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !selectedLocation || !photo}
            iconName="checkmark-circle"
            size="large"
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
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

          <View style={styles.mapContainer}>
            {mapRegion ? (
              <RoadsMap
                mode={MAP_MODES.SELECT}
                initialRegion={mapRegion}
                onSelectLocation={(coordinate) => handleMapPress({ nativeEvent: { coordinate } })}
                onMarkerDragEnd={(coordinate) => handleMapPress({ nativeEvent: { coordinate } })}
                markers={
                  selectedLocation
                    ? [
                        {
                          id: 'damage-location',
                          coordinate: selectedLocation,
                          title: 'Damage Location',
                          description: 'Drag to adjust',
                          type: MARKER_TYPES.USER_PIN,
                        },
                      ]
                    : []
                }
                style={styles.map}
              />
            ) : (
              <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card }]}>
                <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, marginTop: 16, textAlign: 'center', paddingHorizontal: 32 }}>
                  Map view requires a development build
                </Text>
              </View>
            )}
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
                📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
              {locationAddress && (
                <Text style={styles.mapAddressText}>{locationAddress}</Text>
              )}
            </View>
          )}

          <Button
            label="Confirm Location"
            onPress={confirmMapLocation}
            disabled={!selectedLocation}
            fullWidth
            size="large"
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
    mapContainer: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    mapInstructions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 16,
      backgroundColor: colors.primary,
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
      marginBottom: 16 + (insets?.bottom || 0),
    },
  });
}

