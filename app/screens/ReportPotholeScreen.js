import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Conditionally import native modules - fallback if not available
let Location = null;
let ImagePicker = null;

try {
  Location = require('expo-location');
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.warn('Native modules not available:', error.message);
}
import { useTheme } from '../hooks/useTheme';
import { potholeReportsService } from '../services/potholeReportsService';
import { FormInput, Button, SectionTitle } from '../components';
import { spacing } from '../theme/spacing';

const SEVERITY_OPTIONS = [
  { value: 'small', label: 'Small', color: '#4ECDC4' },
  { value: 'medium', label: 'Medium', color: '#FFA500' },
  { value: 'dangerous', label: 'Dangerous', color: '#FF6B6B' },
];

export default function ReportPotholeScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Form state
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [roadName, setRoadName] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLatitude, setManualLatitude] = useState('');
  const [manualLongitude, setManualLongitude] = useState('');

  // Request location permission and get current location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      
      if (!Location) {
        // Fallback: Allow manual location entry
        Alert.alert(
          'Location Service Unavailable',
          'Location services are not available. You can manually enter coordinates or use a map picker.',
          [
            { text: 'Enter Manually', onPress: () => showManualLocationInput() },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        setLocationLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location permission is required to report potholes. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. You can manually enter coordinates.',
        [
          { text: 'Enter Manually', onPress: () => showManualLocationInput() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const showManualLocationInput = () => {
    setShowManualLocation(true);
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLatitude.trim());
    const lng = parseFloat(manualLongitude.trim());

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Please enter valid latitude and longitude numbers.');
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert('Error', 'Latitude must be between -90 and 90.');
      return;
    }

    if (lng < -180 || lng > 180) {
      Alert.alert('Error', 'Longitude must be between -180 and 180.');
      return;
    }

    setLocation({ latitude: lat, longitude: lng });
    setShowManualLocation(false);
    setManualLatitude('');
    setManualLongitude('');
  };

  const pickImage = async () => {
    try {
      setPhotoLoading(true);
      
      if (!ImagePicker) {
        Alert.alert(
          'Image Picker Unavailable',
          'Image picker requires a development build. Please build the app with: npx expo run:android',
          [{ text: 'OK' }]
        );
        setPhotoLoading(false);
        return;
      }

      // Try to request permissions - this will fail in Expo Go
      let mediaLibraryStatus;
      try {
        mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (error) {
        // Native module not available
        if (error.message && error.message.includes('development build')) {
          Alert.alert(
            'Development Build Required',
            'Photo capture requires a development build. Please run:\n\nnpx expo run:android\n\nThis will create a custom build with native modules enabled.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Image Picker Unavailable',
            'Image picker is not available in Expo Go. Please build a development build to enable photo capture.',
            [{ text: 'OK' }]
          );
        }
        setPhotoLoading(false);
        return;
      }

      if (mediaLibraryStatus.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera roll permission is required to upload photos.',
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
              try {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status === 'granted') {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.8,
                  });

                  if (!result.canceled && result.assets[0]) {
                    setPhoto(result.assets[0].uri);
                  }
                } else {
                  Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
                }
              } catch (error) {
                console.error('Camera error:', error);
                if (error.message && error.message.includes('development build')) {
                  Alert.alert(
                    'Development Build Required',
                    'Camera requires a development build. Please run: npx expo run:android',
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert('Error', 'Failed to open camera. Please try again.');
                }
              } finally {
                setPhotoLoading(false);
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setPhoto(result.assets[0].uri);
                }
              } catch (error) {
                console.error('Gallery error:', error);
                if (error.message && error.message.includes('development build')) {
                  Alert.alert(
                    'Development Build Required',
                    'Gallery requires a development build. Please run: npx expo run:android',
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert('Error', 'Failed to open gallery. Please try again.');
                }
              } finally {
                setPhotoLoading(false);
              }
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

  const handleSubmit = async () => {
    // Validation
    if (!location) {
      Alert.alert('Error', 'Please enable location services and try again.');
      return;
    }

    if (!photo) {
      Alert.alert(
        'Photo Required',
        'A photo is required to submit a report. Please use a development build to enable photo capture, or build the app with: npx expo run:android',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!roadName.trim()) {
      Alert.alert('Error', 'Please enter the road name or nearby landmark.');
      return;
    }

    try {
      setLoading(true);

      const reportData = {
        location,
        roadName: roadName.trim(),
        severity,
        description: description.trim() || undefined,
      };

      const report = await potholeReportsService.createReport(reportData, photo);

      // Navigate to confirmation screen
      navigation.replace('ReportConfirmation', {
        referenceCode: report.referenceCode,
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details,
      });
      
      // Show detailed error message
      let errorMessage = error.message || 'Failed to submit report. Please try again.';
      
      // If we have error details from backend, show them
      if (error.details?.error?.message) {
        errorMessage = error.details.error.message;
      } else if (error.details?.message) {
        errorMessage = error.details.message;
      }
      
      Alert.alert(
        'Error Submitting Report',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* My Reports Link */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.myReportsLink}
              onPress={() => navigation.navigate('MyReports')}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={20} color={colors.primary} />
              <Text style={styles.myReportsLinkText}>View My Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            {showManualLocation ? (
                <View style={styles.manualLocationContainer}>
                <FormInput
                  label="Latitude"
                  value={manualLatitude}
                  onChangeText={setManualLatitude}
                  placeholder="e.g., -22.5700"
                  keyboardType="numeric"
                />
                <FormInput
                  label="Longitude"
                  value={manualLongitude}
                  onChangeText={setManualLongitude}
                  placeholder="e.g., 17.0836"
                  keyboardType="numeric"
                />
                <View style={styles.manualLocationButtons}>
                  <Button
                    label="Set Location"
                    onPress={handleManualLocationSubmit}
                    iconName="checkmark-circle"
                    style={styles.submitButton}
                  />
                  <Button
                    label="Cancel"
                    onPress={() => {
                      setShowManualLocation(false);
                      setManualLatitude('');
                      setManualLongitude('');
                    }}
                    variant="outline"
                  />
                </View>
              </View>
            ) : locationLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            ) : location ? (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={styles.locationText}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => {
                    setLocation(null);
                    if (!Location) {
                      setShowManualLocation(true);
                    }
                  }}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Button
                  label={Location ? 'Get Location' : 'Enter Location Manually'}
                  onPress={Location ? requestLocationPermission : showManualLocationInput}
                  iconName="location-outline"
                  fullWidth
                />
                {!Location && (
                  <Text style={styles.helpText}>
                    Location services unavailable. Tap to enter coordinates manually.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Photo Section */}
          <View style={styles.section}>
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={pickImage}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.photoPlaceholder}
                  onPress={pickImage}
                  disabled={photoLoading}
                >
                  {photoLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
                      <Text style={styles.photoPlaceholderText}>Tap to take or select photo</Text>
                    </>
                  )}
                </TouchableOpacity>
                {!ImagePicker && (
                  <View style={styles.warningContainer}>
                    <Ionicons name="information-circle" size={16} color="#FFA500" />
                    <Text style={styles.warningText}>
                      Photo capture requires a development build. Run: npx expo run:android
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Road Name */}
          <View style={styles.section}>
            <FormInput
              value={roadName}
              onChangeText={setRoadName}
              placeholder="Road Name / Landmark *"
              label="Road Name / Landmark"
            />
          </View>

          {/* Severity */}
          <View style={styles.section}>
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
                  <View
                    style={[
                      styles.severityDot,
                      { backgroundColor: option.color },
                    ]}
                  />
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
              placeholder="Description (Optional)"
              label="Description"
              textArea
            />
          </View>

          {/* Submit Button */}
          <Button
            label="Submit Report"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            iconName="checkmark-circle"
            size="large"
            fullWidth
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
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
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    locationText: {
      color: colors.text,
      fontSize: 14,
    },
    photoContainer: {
      alignItems: 'center',
    },
    photo: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
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
    changeButton: {
      marginLeft: 'auto',
      padding: 4,
    },
    changeButtonText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    helpText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    manualLocationContainer: {
      gap: 12,
    },
    manualLocationButtons: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    photoPlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: colors.card,
      borderRadius: 8,
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
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      padding: 8,
      backgroundColor: '#FFF3CD',
      borderRadius: 6,
      gap: 6,
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: '#856404',
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
    headerActions: {
      marginBottom: spacing.lg,
      alignItems: 'flex-end',
    },
    myReportsLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    myReportsLinkText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}

