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

const SEVERITY_OPTIONS = [
  { value: 'small', label: 'Minor Damage', color: '#4ECDC4', icon: 'ellipse' },
  { value: 'medium', label: 'Moderate Damage', color: '#FFA500', icon: 'warning' },
  { value: 'dangerous', label: 'Severe Damage', color: '#FF6B6B', icon: 'alert-circle' },
];

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

export default function ReportPotholeScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  // State
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [photoLocation, setPhotoLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');

  // Form states
  const [photo, setPhoto] = useState(null);
  const [roadName, setRoadName] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');

  // UI states
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const [locationSource, setLocationSource] = useState(null);
  const googlePlacesRef = useRef(null);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const styles = getStyles(colors, insets);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);

      if (!Location) {
        Alert.alert(
          'Location Service Unavailable',
          'Location services are required to submit a road damage report. Please enable location services in your device settings.',
          [{ text: 'Understood' }]
        );
        setLocationLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is required to submit road damage reports. Please grant permission in your device settings.',
          [{ text: 'Understood' }]
        );
        setLocationLoading(false);
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation = {
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      };

      setCurrentLocation(userLocation);

      if (!selectedLocation) {
        setSelectedLocation(userLocation);
        setLocationSource('current_gps');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to determine your current location. Please try again or select the location manually on the map.');
    } finally {
      setLocationLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      setPhotoLoading(true);

      if (!ImagePicker) {
        Alert.alert(
          'Image Capture Unavailable',
          'Photo capture functionality requires a development build and is not available in Expo Go.',
          [{ text: 'Understood' }]
        );
        setPhotoLoading(false);
        return;
      }

      Alert.alert(
        'Select Photo Source',
        'Please choose how you would like to provide photographic evidence:',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              await handleCameraCapture();
            },
          },
          {
            text: 'Choose from Gallery',
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
        Alert.alert('Camera Permission Required', 'Camera access is required to capture photographic evidence. Please grant permission in your device settings.');
        setPhotoLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedPhoto(result.assets[0]);
      }
      setPhotoLoading(false);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Unable to access camera. Please try again or select a photo from your gallery.');
      setPhotoLoading(false);
    }
  };

  const handleGallerySelection = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Gallery Permission Required', 'Photo library access is required to select images. Please grant permission in your device settings.');
        setPhotoLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedPhoto(result.assets[0]);
      }
      setPhotoLoading(false);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Gallery Error', 'Unable to access photo library. Please try again or use the camera option.');
      setPhotoLoading(false);
    }
  };

  const processSelectedPhoto = async (asset) => {
    setPhoto(asset.uri);

    const exifLocation = await extractPhotoLocation(asset.uri);

    if (exifLocation) {
      setPhotoLocation(exifLocation);

      if (!isWithinNamibia(exifLocation.latitude, exifLocation.longitude)) {
        Alert.alert(
          'Location Outside Namibia',
          'The photograph appears to have been taken outside Namibian territory. Please confirm the actual damage location using the map interface.',
          [{ text: 'Open Map', onPress: () => setShowMapPicker(true) }]
        );
        return;
      }

      if (currentLocation) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          exifLocation.latitude,
          exifLocation.longitude
        );

        if (distance > CONFIG.EXIF_PHOTO_DISTANCE_THRESHOLD_KM) {
          Alert.alert(
            'Location Verification Required',
            `This photograph was taken ${distance.toFixed(1)} km from your current location. Please confirm where the road damage is located:`,
            [
              {
                text: 'Photo Location',
                onPress: () => {
                  setSelectedLocation(exifLocation);
                  setLocationSource('photo_exif');
                  setShowMapPicker(true);
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
                text: 'Select on Map',
                onPress: () => {
                  setShowMapPicker(true);
                },
              },
            ]
          );
        } else {
          setSelectedLocation(exifLocation);
          setLocationSource('photo_exif');
          Alert.alert(
            'Location Confirmed',
            `Location data extracted from photograph (${distance.toFixed(1)} km from current position). You may adjust the precise location using the map interface if needed.`,
            [
              { text: 'Adjust on Map', onPress: () => setShowMapPicker(true) },
              { text: 'Use This Location', style: 'cancel' },
            ]
          );
        }
      } else {
        setSelectedLocation(exifLocation);
        setLocationSource('photo_exif');
      }
    } else {
      Alert.alert(
        'Location Data Required',
        'This photograph does not contain location metadata. Please select the damage location using the map interface.',
        [{ text: 'Open Map', onPress: () => setShowMapPicker(true) }]
      );
    }
  };

  const openMapPicker = () => {
    if (!MapView) {
      Alert.alert(
        'Map Interface Unavailable',
        'Interactive maps require a development build and are not available in Expo Go. The report will use your current location or the location data from your photograph.',
        [{ text: 'Understood' }]
      );
      return;
    }

    const initialLocation = selectedLocation || photoLocation || currentLocation;

    if (initialLocation) {
      setMapRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
        longitudeDelta: CONFIG.DEFAULT_MAP_ZOOM,
      });
    } else {
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
    setSelectedLocation({ latitude, longitude });
    setLocationSource('map_selected');

    const address = await getAddressFromCoordinates(latitude, longitude);
    if (address) {
      setLocationAddress(address);
    }
  };

  const handleMarkerDragEnd = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setLocationSource('map_selected');

    const address = await getAddressFromCoordinates(latitude, longitude);
    if (address) {
      setLocationAddress(address);
    }
  };

  const confirmMapLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Location Selection Required', 'Please select a location on the map before proceeding.');
      return;
    }

    if (!isWithinNamibia(selectedLocation.latitude, selectedLocation.longitude)) {
      Alert.alert(
        'Invalid Location',
        'Please select a location within Namibian territory.',
        [{ text: 'Understood' }]
      );
      return;
    }

    if (currentLocation) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      if (distance > CONFIG.MAX_DISTANCE_KM) {
        Alert.alert(
          'Location Distance Exceeded',
          `The selected location is ${distance.toFixed(0)} km from your current position. Please report damage within ${CONFIG.MAX_DISTANCE_KM} km of your location for verification purposes.`,
          [{ text: 'Select Again' }]
        );
        return;
      }
    }

    setShowMapPicker(false);
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      Alert.alert('Location Required', 'Please specify the location of the road damage before submitting your report.');
      return;
    }

    if (!photo) {
      Alert.alert('Photographic Evidence Required', 'Please provide a photograph of the road damage before submitting your report.');
      return;
    }

    let confirmMessage = '';
    
    if (locationAddress) {
      confirmMessage += `Location: ${locationAddress}\n`;
    } else {
      confirmMessage += `Location: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}\n`;
    }
    
    if (roadName.trim()) {
      confirmMessage += `Road: ${roadName.trim()}\n`;
    }
    
    confirmMessage += `Severity: ${severity}\n`;
    
    if (description.trim()) {
      confirmMessage += `Notes: ${description.trim()}\n`;
    }
    
    confirmMessage += '\nSubmit this report?';

    Alert.alert('Confirm Report Submission', confirmMessage.trim(), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit Report',
        onPress: async () => {
          try {
            setLoading(true);

            const reportData = {
              location: selectedLocation,
              locationSource,
              photoLocation,
              currentLocation,
              roadName: roadName.trim() || undefined,
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
            Alert.alert('Submission Error', error.message || 'Unable to submit report. Please check your connection and try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getProgress = () => {
    let completed = 0;
    if (photo) completed++;
    if (selectedLocation) completed++;
    if (severity) completed++;
    return Math.round((completed / 3) * 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* Unified Header */}
      <GlobalHeader
        title="Report Road Damage"
        subtitle="Help improve our roads"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        testID="report-pothole-header"
      />

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
          {/* Progress Card */}
          <UnifiedCard variant="outlined" padding="medium" style={styles.progressCard}>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
              </View>
              <Text style={styles.progressText}>{getProgress()}% Complete</Text>
            </View>
          </UnifiedCard>

          {/* Step 1: Photo Section */}
          <UnifiedCard variant="flat" padding="medium">
            <View style={styles.expandableHeader}>
              <View style={styles.expandableHeaderLeft}>
                <Ionicons 
                  name="camera-outline" 
                  size={24} 
                  color={photo ? colors.success : colors.primary} 
                />
                <Text style={styles.expandableHeaderText}>
                  Step 1: Photographic Evidence
                </Text>
                {photo && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={colors.success} 
                    style={{ marginLeft: spacing.sm }}
                  />
                )}
              </View>
            </View>

            <View style={styles.expandableContent}>
              <Text style={styles.sectionSubtitle}>
                Please provide a clear photograph of the road damage
              </Text>

              {photo ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <View style={styles.photoOverlay}>
                    {photoLocation && (
                      <View style={styles.photoInfoBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.photoInfoText}>Location detected</Text>
                      </View>
                    )}
                    <UnifiedButton
                      variant="ghost"
                      size="small"
                      iconName="camera"
                      label="Change"
                      onPress={pickImage}
                      style={styles.changePhotoButton}
                      textStyle={styles.changePhotoText}
                    />
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
                    <UnifiedSkeletonLoader type="button" width={80} height={80} />
                  ) : (
                    <>
                      <View style={styles.cameraIconCircle}>
                        <Ionicons name="camera" size={40} color="#FFFFFF" />
                      </View>
                      <Text style={styles.photoPlaceholderText}>Select Photo</Text>
                      <Text style={styles.photoPlaceholderHint}>Camera or Gallery</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </UnifiedCard>

          {/* Step 2: Location Section */}
          <UnifiedCard variant="flat" padding="medium">
            <View style={styles.expandableHeader}>
              <View style={styles.expandableHeaderLeft}>
                <Ionicons 
                  name="location-outline" 
                  size={24} 
                  color={selectedLocation ? colors.success : colors.primary} 
                />
                <Text style={styles.expandableHeaderText}>
                  Step 2: Location Verification
                </Text>
                {selectedLocation && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={colors.success} 
                    style={{ marginLeft: spacing.sm }}
                  />
                )}
              </View>
            </View>

            <View style={styles.expandableContent}>
              {selectedLocation ? (
                <View>
                  <Text style={styles.sectionSubtitle}>
                    Location has been detected and verified
                  </Text>
                  <View style={styles.locationInfoContainer}>
                    {locationAddress ? (
                      <Text style={styles.locationAddress}>{locationAddress}</Text>
                    ) : (
                      <Text style={styles.locationAddress}>
                        {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                      </Text>
                    )}
                    <UnifiedButton
                      variant="outline"
                      size="small"
                      iconName="map"
                      label="Adjust on map"
                      onPress={openMapPicker}
                      style={styles.adjustLocationButton}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.sectionSubtitle}>
                    Please confirm the location of the road damage
                  </Text>
                  {locationLoading ? (
                    <View style={styles.locationLoading}>
                      <UnifiedSkeletonLoader type="text-line" width="60%" height={16} />
                      <Text style={styles.locationLoadingText}>Getting location...</Text>
                    </View>
                  ) : (
                    <UnifiedButton
                      variant="primary"
                      size="medium"
                      iconName="locate"
                      label="Get Current Location"
                      onPress={requestLocationPermission}
                      fullWidth
                    />
                  )}
                </View>
              )}
            </View>
          </UnifiedCard>

          {/* Step 3: Severity Section */}
          <UnifiedCard variant="flat" padding="medium">
            <View style={styles.expandableHeader}>
              <View style={styles.expandableHeaderLeft}>
                <Ionicons 
                  name="alert-circle-outline" 
                  size={24} 
                  color={severity ? colors.success : colors.primary} 
                />
                <Text style={styles.expandableHeaderText}>
                  Step 3: Damage Assessment
                </Text>
                {severity && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={colors.success} 
                    style={{ marginLeft: spacing.sm }}
                  />
                )}
              </View>
            </View>

            <View style={styles.expandableContent}>
              <Text style={styles.sectionSubtitle}>
                Please assess the severity of the road damage
              </Text>

              <View style={styles.severityOptions}>
                {SEVERITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.severityOption,
                      severity === option.value && styles.severityOptionActive,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setSeverity(option.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={option.icon} size={24} color={option.color} />
                    <Text
                      style={[
                        styles.severityText,
                        severity === option.value && { color: option.color, fontWeight: '600' },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {severity === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color={option.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </UnifiedCard>

          {/* Step 4: Optional Details Section */}
          <UnifiedCard variant="flat" padding="medium">
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={() => setShowMoreDetails(!showMoreDetails)}
              activeOpacity={0.7}
            >
              <View style={styles.expandableHeaderLeft}>
                <Ionicons 
                  name={showMoreDetails ? "remove-circle-outline" : "add-circle-outline"} 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.expandableHeaderText}>
                  Step 4: Additional Information (Optional)
                </Text>
              </View>
              <Ionicons 
                name={showMoreDetails ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            {showMoreDetails && (
              <View style={styles.expandableContent}>
                <UnifiedFormInput
                  value={roadName}
                  onChangeText={setRoadName}
                  placeholder="e.g., B1 Highway, Independence Avenue, Main Road"
                  label="Road Name / Reference"
                  leftIcon="map-outline"
                />
                
                <UnifiedFormInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Please provide any additional relevant details about the road damage, traffic impact, or safety concerns..."
                  label="Additional Comments"
                  multiline
                  numberOfLines={4}
                  leftIcon="document-text-outline"
                />
              </View>
            )}
          </UnifiedCard>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Submit Button */}
        <View style={styles.floatingButtonContainer}>
          <UnifiedButton
            label={loading ? "Processing Report..." : "Submit Report"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !selectedLocation || !photo}
            size="large"
            fullWidth
            iconName="document-text-outline"
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
          <GlobalHeader
            title="Select Location"
            subtitle="Tap on the map to mark the precise damage location"
            showBackButton={true}
            onBackPress={() => setShowMapPicker(false)}
          />

          <View style={styles.mapContainer}>
            {mapRegion && MapView ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                onPress={handleMapPress}
                provider={Platform.OS === 'android' && PROVIDER_GOOGLE ? PROVIDER_GOOGLE : undefined}
              >
                {selectedLocation && Marker && (
                  <Marker
                    coordinate={selectedLocation}
                    title="Road Damage Location"
                    description="Drag marker to adjust position"
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  />
                )}
              </MapView>
            ) : (
              <View style={[styles.map, styles.mapPlaceholder]}>
                <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.mapPlaceholderText}>
                  Interactive map interface requires a development build
                </Text>
              </View>
            )}
          </View>

          {selectedLocation && (
            <UnifiedCard variant="outlined" padding="medium" style={styles.mapCoordinatesCard}>
              <Text style={styles.mapCoordinatesText}>
                Coordinates: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
              {locationAddress && (
                <Text style={styles.mapAddressText}>{locationAddress}</Text>
              )}
            </UnifiedCard>
          )}

          <View style={styles.mapButtonContainer}>
            <UnifiedButton
              label="Confirm Location"
              onPress={confirmMapLocation}
              disabled={!selectedLocation}
              fullWidth
              size="large"
              iconName="checkmark"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors, insets) =>
  StyleSheet.create({
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
      paddingBottom: spacing.xxl + (insets?.bottom || 0) + 80,
    },
    
    // Progress Section
    progressCard: {
      marginBottom: spacing.lg,
    },
    progressSection: {
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    progressText: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Section Headers
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.h4,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    sectionSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },

    // Photo Section
    photoCard: {
      marginBottom: spacing.lg,
    },
    photoContainer: {
      position: 'relative',
    },
    photo: {
      width: '100%',
      height: 240,
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
      padding: spacing.md,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    photoInfoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 16,
    },
    photoInfoText: {
      ...typography.caption,
      color: '#FFFFFF',
      marginLeft: spacing.xs,
      fontWeight: '600',
    },
    changePhotoButton: {
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    changePhotoText: {
      color: '#FFFFFF',
    },
    photoPlaceholder: {
      width: '100%',
      height: 240,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    cameraIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    photoPlaceholderText: {
      ...typography.h5,
      color: '#FFFFFF',
      fontWeight: '600',
      marginTop: spacing.sm,
    },
    photoPlaceholderHint: {
      ...typography.bodySmall,
      color: 'rgba(255,255,255,0.8)',
      marginTop: spacing.xs,
    },

    // Location Section
    locationCard: {
      marginBottom: spacing.lg,
      borderColor: colors.success,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    locationTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.success,
      marginLeft: spacing.sm,
    },
    locationInfoContainer: {
      marginTop: spacing.sm,
    },
    locationAddress: {
      ...typography.bodySmall,
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 20,
    },
    adjustLocationButton: {
      alignSelf: 'flex-start',
    },
    locationLoading: {
      alignItems: 'center',
      padding: spacing.md,
    },
    locationLoadingText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },

    // Severity Section
    severityCard: {
      marginBottom: spacing.lg,
    },
    severityOptions: {
      gap: spacing.md,
    },
    severityOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    severityOptionActive: {
      backgroundColor: colors.surface,
      borderWidth: 2,
    },
    severityText: {
      ...typography.body,
      color: colors.text,
      marginLeft: spacing.md,
      flex: 1,
    },

    // Expandable Section
    expandableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    expandableHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    expandableHeaderText: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginLeft: spacing.sm,
    },
    expandableContent: {
      paddingTop: spacing.md,
      gap: spacing.lg,
    },

    // Floating Button
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing.xl,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },

    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mapContainer: {
      flex: 1,
      margin: spacing.xl,
      borderRadius: 12,
      overflow: 'hidden',
    },
    map: {
      flex: 1,
    },
    mapPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    mapPlaceholderText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.xl,
    },
    mapCoordinatesCard: {
      margin: spacing.xl,
      marginTop: 0,
    },
    mapCoordinatesText: {
      ...typography.bodySmall,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      color: colors.text,
    },
    mapAddressText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    mapButtonContainer: {
      padding: spacing.xl,
      paddingTop: 0,
    },
  });