import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { ScreenContainer, MachinePressable } from '../components';
import { triggerMachineSubmitFeedback, triggerMachinePressFeedback } from '../utils/machinePressFeedback';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const DEFAULT_REGION = {
  latitude: -22.5609,
  longitude: 17.0658,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function ReportRoadDamageScreen({ onBack, onSubmit }) {
  const [photo, setPhoto] = useState(null);
  const [locationChoice, setLocationChoice] = useState(null);
  const [location, setLocation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = !!photo && !!location;

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
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setLocationChoice(null);
        setLocation(null);
      }
    } catch (error) {
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
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setLocationChoice(null);
        setLocation(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open photo library.');
    }
  };

  const handleAutoDetectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Enable location to auto detect.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Location error', 'Could not auto detect location.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSearchLocation = async () => {
    const query = searchText.trim();
    if (!query) return;
    triggerMachinePressFeedback();
    setSearching(true);
    try {
      const matches = await Location.geocodeAsync(query);
      if (!matches.length) {
        Alert.alert('Not found', 'Try another place name.');
        return;
      }
      setLocation({
        latitude: matches[0].latitude,
        longitude: matches[0].longitude,
      });
    } catch (error) {
      Alert.alert('Search error', 'Could not search location.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    triggerMachineSubmitFeedback();
    setSubmitting(true);
    try {
      onSubmit?.({ photo, location });
    } catch (err) {
      Alert.alert('Submission failed', err.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="camera-outline" size={20} color={PRIMARY} />
          <Text style={styles.sectionTitle}>Add photo</Text>
          <View style={[styles.statusChip, photo ? styles.statusChipDone : styles.statusChipPending]}>
            <Text style={[styles.statusText, photo ? styles.statusTextDone : styles.statusTextPending]}>
              {photo ? 'Added' : 'Required'}
            </Text>
          </View>
        </View>
        <MachinePressable style={styles.photoBox} onPress={handleTakePhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={40} color={PRIMARY} />
              <Text style={styles.photoPlaceholderText}>Tap to take photo</Text>
            </View>
          )}
        </MachinePressable>
        <MachinePressable style={styles.outlineAction} onPress={handlePickPhoto}>
          <Ionicons name="images-outline" size={18} color={PRIMARY} />
          <Text style={styles.outlineActionText}>Choose from gallery</Text>
        </MachinePressable>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color={PRIMARY} />
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={[styles.statusChip, location ? styles.statusChipDone : styles.statusChipPending]}>
            <Text style={[styles.statusText, location ? styles.statusTextDone : styles.statusTextPending]}>
              {location ? 'Set' : 'Needed'}
            </Text>
          </View>
        </View>

        {photo ? (
          <>
            <Text style={styles.promptText}>Are you at the road damage site?</Text>
            <View style={styles.choiceRow}>
              <MachinePressable
                style={({ pressed }) => [
                  styles.choiceButton,
                  locationChoice === 'yes' && styles.choiceButtonActive,
                  pressed && styles.choiceButtonPressed,
                ]}
                onPress={() => {
                  setLocationChoice('yes');
                  setSearchText('');
                }}
              >
                <Text style={[styles.choiceText, locationChoice === 'yes' && styles.choiceTextActive]}>Yes</Text>
              </MachinePressable>
              <MachinePressable
                style={({ pressed }) => [
                  styles.choiceButton,
                  locationChoice === 'no' && styles.choiceButtonActive,
                  pressed && styles.choiceButtonPressed,
                ]}
                onPress={() => setLocationChoice('no')}
              >
                <Text style={[styles.choiceText, locationChoice === 'no' && styles.choiceTextActive]}>No</Text>
              </MachinePressable>
            </View>

            {locationChoice === 'yes' ? (
              <MachinePressable
                style={({ pressed }) => [styles.primaryAction, pressed && !detecting && styles.primaryActionPressed]}
                onPress={handleAutoDetectLocation}
                disabled={detecting}
                heavy
              >
                {detecting ? (
                  <ActivityIndicator size="small" color={NEUTRAL_COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="locate-outline" size={18} color={NEUTRAL_COLORS.white} />
                    <Text style={styles.primaryActionText}>Auto detect location</Text>
                  </>
                )}
              </MachinePressable>
            ) : null}

            {locationChoice === 'no' ? (
              <>
                <View style={styles.searchRow}>
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search place"
                    placeholderTextColor={NEUTRAL_COLORS.gray500}
                    style={styles.searchInput}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchLocation}
                  />
                  <MachinePressable
                    style={({ pressed }) => [styles.searchButton, pressed && !searching && styles.searchButtonPressed]}
                    onPress={handleSearchLocation}
                    disabled={searching}
                  >
                    {searching ? (
                      <ActivityIndicator size="small" color={NEUTRAL_COLORS.white} />
                    ) : (
                      <Ionicons name="search-outline" size={18} color={NEUTRAL_COLORS.white} />
                    )}
                  </MachinePressable>
                </View>

                <View style={styles.mapWrap}>
                  <MapView
                    style={styles.map}
                    initialRegion={DEFAULT_REGION}
                    region={
                      location
                        ? {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                          }
                        : undefined
                    }
                    onLongPress={(event) =>
                      setLocation({
                        latitude: event.nativeEvent.coordinate.latitude,
                        longitude: event.nativeEvent.coordinate.longitude,
                      })
                    }
                  >
                    {location ? <Marker coordinate={location} /> : null}
                  </MapView>
                </View>
                <Text style={styles.pinHint}>Hold map to pin</Text>
              </>
            ) : null}
          </>
        ) : (
          <View style={styles.infoBox}>
            <Ionicons name="camera-outline" size={18} color={NEUTRAL_COLORS.gray500} />
            <Text style={styles.infoText}>Add photo first</Text>
          </View>
        )}
      </View>

      <View style={styles.footerActions}>
        <MachinePressable style={styles.cancelButton} onPress={onBack}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </MachinePressable>
        <MachinePressable
          style={[styles.submitButton, (!canSubmit || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          heavy
        >
          {submitting ? (
            <ActivityIndicator size="small" color={NEUTRAL_COLORS.white} />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color={NEUTRAL_COLORS.white} />
              <Text style={styles.submitButtonText}>Submit report</Text>
            </>
          )}
        </MachinePressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: NEUTRAL_COLORS.gray800,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    flex: 1,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusChipDone: {
    backgroundColor: '#DCFCE7',
  },
  statusChipPending: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
  },
  statusTextDone: {
    color: '#166534',
  },
  statusTextPending: {
    color: '#991B1B',
  },
  photoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
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
  outlineAction: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  outlineActionText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
  promptText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray800,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing.sm,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  choiceButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
  },
  choiceButtonActive: {
    borderColor: PRIMARY,
    backgroundColor: '#E6F7FC',
  },
  choiceButtonPressed: {
    opacity: 0.9,
  },
  choiceText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    fontFamily: 'Poppins_600SemiBold',
  },
  choiceTextActive: {
    color: PRIMARY,
  },
  primaryAction: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryActionPressed: {
    opacity: 0.9,
  },
  primaryActionText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    backgroundColor: NEUTRAL_COLORS.white,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray800,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  searchButtonPressed: {
    opacity: 0.9,
  },
  mapWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 180,
  },
  pinHint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.xs,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 10,
    backgroundColor: NEUTRAL_COLORS.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    fontFamily: 'Poppins_600SemiBold',
  },
  submitButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
  },
});
