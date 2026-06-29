import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { ProfileNavRow, ToggleRow } from '../components/ProfileShared';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import {
  canUseBiometrics,
  hasLicencePin,
  isBiometricsEnabled,
  setBiometricsEnabled,
} from '../services/licenceLockService';

export function AppSettingsScreen({ user, onChangeLicencePin, onOpenPreferences }) {
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  const loadLicenceSecurity = useCallback(async () => {
    if (!user) {
      setHasPin(false);
      setBiometricsEnabledState(false);
      setBiometricsAvailable(false);
      return;
    }

    const [pinSet, bioAvailable, bioEnabled] = await Promise.all([
      hasLicencePin(user),
      canUseBiometrics(),
      isBiometricsEnabled(user),
    ]);
    setHasPin(pinSet);
    setBiometricsAvailable(bioAvailable);
    setBiometricsEnabledState(bioEnabled);
  }, [user]);

  useEffect(() => {
    loadLicenceSecurity();
  }, [loadLicenceSecurity]);

  const handleBiometricsToggle = async () => {
    if (!user) return;

    if (!hasPin) {
      Alert.alert(
        'PIN required',
        'Set up your PIN first before enabling biometrics.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set up PIN', onPress: () => onChangeLicencePin?.() },
        ]
      );
      return;
    }

    const next = !biometricsEnabled;
    await setBiometricsEnabled(user, next);
    setBiometricsEnabledState(next);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {biometricsAvailable ? (
          <ToggleRow
            iconName="finger-print-outline"
            label="Biometric authentication"
            value={biometricsEnabled}
            onToggle={handleBiometricsToggle}
          />
        ) : null}
        <Pressable style={styles.changePinButton} onPress={() => onChangeLicencePin?.()}>
          <Ionicons name="key-outline" size={18} color={PRIMARY} />
          <Text style={styles.changePinButtonText}>
            {hasPin ? 'Change PIN' : 'Set up PIN'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.cardFlush}>
        <ProfileNavRow
          iconName="options-outline"
          title="Preferences"
          onPress={onOpenPreferences}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardFlush: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
  },
  changePinButton: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY + '44',
    backgroundColor: PRIMARY + '0D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  changePinButtonText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
});
