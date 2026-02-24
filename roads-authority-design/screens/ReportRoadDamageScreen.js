import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ScreenContainer, FormInput } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';
import { createReport } from '../services/potholeReportsService';

const STEP_PHOTO = 1;
const STEP_LOCATION = 2;

const MAP_DELTA = 0.01;
const SUBMIT_BUTTON_GREEN = '#3CB371';

export function ReportRoadDamageScreen({ onBack, onSubmit }) {
  const [step, setStep] = useState(STEP_PHOTO);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: MAP_DELTA,
        longitudeDelta: MAP_DELTA,
      }, 350);
    }
  }, [location?.latitude, location?.longitude]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo of the damage.');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch (e) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to choose a photo.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch (e) {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleAutoDetectLocation = async () => {
    setLocationError(null);
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setLocation({ latitude, longitude });
    } catch (e) {
      setLocationError('Could not get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    const query = (locationSearchQuery || '').trim();
    if (!query) {
      setLocationError('Enter an address or place name to search.');
      return;
    }
    setLocationError(null);
    setLocationSearchLoading(true);
    try {
      const results = await Location.geocodeAsync(query);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setLocation({ latitude, longitude });
      } else {
        setLocationError('No location found. Try a different search or enter coordinates below.');
      }
    } catch (e) {
      setLocationError('Search failed. Try entering coordinates manually below.');
    } finally {
      setLocationSearchLoading(false);
    }
  };

  const handleUseManualCoordinates = () => {
    const lat = parseFloat(manualLat.replace(',', '.'));
    const lng = parseFloat(manualLng.replace(',', '.'));
    if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setLocationError(null);
      setLocation({ latitude: lat, longitude: lng });
    } else {
      setLocationError('Enter valid latitude (-90 to 90) and longitude (-180 to 180).');
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const canProceedFromStep1 = !!photo;
  const canSubmit = photo && location;

  const handleNext = () => {
    if (step === STEP_PHOTO && canProceedFromStep1) setStep(STEP_LOCATION);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createReport(
        { location, severity: 'medium' },
        photo
      );
      onSubmit?.({ photo, location });
    } catch (err) {
      Alert.alert('Submission failed', err.message || 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= STEP_PHOTO && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= STEP_LOCATION && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= STEP_LOCATION && styles.stepDotActive]} />
      </View>
      <Text style={styles.stepLabel}>
        Step {step} of 2
      </Text>

      {step === STEP_PHOTO && (
        <>
          <Text style={styles.title}>Add photo of damage</Text>
          <Text style={styles.hint}>Take or choose a picture of the road damage.</Text>
          <Pressable
            style={styles.photoBox}
            onPress={handleTakePhoto}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={48} color={PRIMARY} />
                <Text style={styles.photoPlaceholderText}>Tap to take photo</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handlePickPhoto}>
            <Ionicons name="images-outline" size={20} color={PRIMARY} />
            <Text style={styles.secondaryButtonText}>Choose from library</Text>
          </Pressable>
          <Pressable
            style={[styles.nextButton, !canProceedFromStep1 && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceedFromStep1}
          >
            <Text style={styles.nextButtonText}>Next: Location</Text>
            <Ionicons name="arrow-forward" size={20} color={NEUTRAL_COLORS.gray900} />
          </Pressable>
        </>
      )}

      {step === STEP_LOCATION && (
        <>
          <Text style={styles.title}>Set report location</Text>
          <Text style={styles.hint}>Choose auto-detect (if you're at the site) or enter / search for a location.</Text>

          <Text style={styles.optionLabel}>Auto-detect my location</Text>
          <Pressable
            style={styles.locationBox}
            onPress={handleAutoDetectLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="large" color={PRIMARY} />
            ) : location ? (
              <View style={styles.locationResult}>
                <Ionicons name="location" size={32} color={PRIMARY} />
                <Text style={styles.locationText}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
                <Text style={styles.locationSubtext}>Location set</Text>
              </View>
            ) : (
              <View style={styles.locationPlaceholder}>
                <Ionicons name="locate-outline" size={48} color={PRIMARY} />
                <Text style={styles.locationPlaceholderText}>Tap to auto-detect location</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.optionLabel}>Or enter / search location</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Address or place name"
              placeholderTextColor={NEUTRAL_COLORS.gray500}
              value={locationSearchQuery}
              onChangeText={(t) => { setLocationSearchQuery(t); setLocationError(null); }}
              editable={!locationSearchLoading}
            />
            <Pressable
              style={[styles.searchButton, locationSearchLoading && styles.primaryButtonDisabled]}
              onPress={handleSearchLocation}
              disabled={locationSearchLoading}
            >
              {locationSearchLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#FFFFFF" />
                  <Text style={styles.searchButtonText}>Search</Text>
                </>
              )}
            </Pressable>
          </View>
          <View style={styles.manualCoordsRow}>
            <FormInput
              label="Latitude"
              value={manualLat}
              onChangeText={setManualLat}
              placeholder="e.g. -22.5609"
              keyboardType="decimal-pad"
            />
            <FormInput
              label="Longitude"
              value={manualLng}
              onChangeText={setManualLng}
              placeholder="e.g. 17.0658"
              keyboardType="decimal-pad"
            />
            <Pressable style={styles.secondaryButton} onPress={handleUseManualCoordinates}>
              <Ionicons name="navigate-outline" size={18} color={PRIMARY} />
              <Text style={styles.secondaryButtonText}>Use these coordinates</Text>
            </Pressable>
          </View>

          {locationError ? (
            <Text style={styles.errorText}>{locationError}</Text>
          ) : null}
          {location ? (
            <View style={styles.mapPreviewWrap}>
              <Text style={styles.mapPreviewLabel}>Preview your report location</Text>
              <View style={styles.mapPreview}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: MAP_DELTA,
                    longitudeDelta: MAP_DELTA,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  showsUserLocation={true}
                >
                  <Marker
                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                    title="Report location"
                    description="Road damage will be reported here"
                    pinColor={PRIMARY}
                  />
                </MapView>
              </View>
              <Text style={styles.mapPreviewHint}>The blue pin is where the report will be sent. If you're at the damage site, your position and the pin should be close together. Confirm, then submit.</Text>
            </View>
          ) : null}
          <View style={styles.rowButtons}>
            <Pressable style={styles.secondaryButton} onPress={() => setStep(STEP_PHOTO)}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, (!canSubmit || submitting) && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit report</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NEUTRAL_COLORS.gray300,
  },
  stepDotActive: {
    backgroundColor: RA_YELLOW,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: NEUTRAL_COLORS.gray300,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: RA_YELLOW,
  },
  stepLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  photoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.sm,
  },
  optionLabel: {
    ...typography.label,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 0,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: PRIMARY,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderRadius: 0,
  },
  searchButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  manualCoordsRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationBox: {
    width: '100%',
    minHeight: 140,
    backgroundColor: NEUTRAL_COLORS.gray50,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    padding: spacing.xl,
  },
  locationPlaceholder: {
    alignItems: 'center',
  },
  locationPlaceholderText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.sm,
  },
  locationResult: {
    alignItems: 'center',
  },
  locationText: {
    ...typography.body,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray900,
    marginTop: spacing.sm,
  },
  locationSubtext: {
    ...typography.caption,
    color: PRIMARY,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: '#DC2626',
    marginBottom: spacing.md,
  },
  mapPreviewWrap: {
    marginBottom: spacing.lg,
  },
  mapPreviewLabel: {
    ...typography.label,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.sm,
  },
  mapPreview: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPreviewHint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.sm,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RA_YELLOW,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  nextButtonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.gray900,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUBMIT_BUTTON_GREEN,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  submitButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.button,
    color: PRIMARY,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
});
