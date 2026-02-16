import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const STEP_PHOTO = 1;
const STEP_LOCATION = 2;

export function ReportRoadDamageScreen({ onBack, onSubmit }) {
  const [step, setStep] = useState(STEP_PHOTO);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

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

  const canProceedFromStep1 = !!photo;
  const canSubmit = photo && location;

  const handleNext = () => {
    if (step === STEP_PHOTO && canProceedFromStep1) setStep(STEP_LOCATION);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ photo, location });
    onBack?.();
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
            style={[styles.primaryButton, !canProceedFromStep1 && styles.primaryButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceedFromStep1}
          >
            <Text style={styles.primaryButtonText}>Next: Location</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </>
      )}

      {step === STEP_LOCATION && (
        <>
          <Text style={styles.title}>Auto-detect location</Text>
          <Text style={styles.hint}>We'll use your device to get the exact location of the damage.</Text>
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
                <Text style={styles.locationSubtext}>Location detected</Text>
              </View>
            ) : (
              <View style={styles.locationPlaceholder}>
                <Ionicons name="locate-outline" size={48} color={PRIMARY} />
                <Text style={styles.locationPlaceholderText}>Tap to auto-detect location</Text>
              </View>
            )}
          </Pressable>
          {locationError ? (
            <Text style={styles.errorText}>{locationError}</Text>
          ) : null}
          <View style={styles.rowButtons}>
            <Pressable style={styles.secondaryButton} onPress={() => setStep(STEP_PHOTO)}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.primaryButtonText}>Submit report</Text>
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
    backgroundColor: PRIMARY,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: NEUTRAL_COLORS.gray300,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: PRIMARY,
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
    borderRadius: 12,
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
  locationBox: {
    width: '100%',
    minHeight: 160,
    backgroundColor: NEUTRAL_COLORS.gray50,
    borderRadius: 12,
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
