import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, FormInput, FormActionButton } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import {
  canUseBiometrics,
  getBiometricLabel,
  getLockoutRemainingMs,
  hasLicencePin,
  isBiometricsEnabled,
  isValidPin,
  setBiometricsEnabled,
  setLicencePin,
  unlockWithBiometrics,
  verifyLicencePin,
} from '../services/licenceLockService';

export function LicenceUnlockScreen({
  user,
  onUnlocked,
  onCancel,
  changePin = false,
}) {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('unlock');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [useBiometrics, setUseBiometrics] = useState(true);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const refreshLockout = useCallback(async () => {
    const remaining = await getLockoutRemainingMs(user);
    setLockoutSeconds(Math.ceil(remaining / 1000));
  }, [user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [hasPin, bioAvailable, bioEnabled, label] = await Promise.all([
          hasLicencePin(user),
          canUseBiometrics(),
          isBiometricsEnabled(user),
          getBiometricLabel(),
        ]);
        if (!mounted) return;

        setBiometricsAvailable(bioAvailable);
        setBiometricLabel(label);
        setUseBiometrics(bioEnabled);

        if (changePin) {
          setMode(hasPin ? 'change-verify' : 'setup');
        } else {
          setMode(hasPin ? 'unlock' : 'setup');
        }

        await refreshLockout();

        if (!changePin && hasPin && bioAvailable && bioEnabled) {
          const success = await unlockWithBiometrics();
          if (mounted && success) onUnlocked?.();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, changePin, onUnlocked, refreshLockout]);

  useEffect(() => {
    if (lockoutSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      refreshLockout();
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds, refreshLockout]);

  const handleSetup = async () => {
    setError('');
    if (!isValidPin(pin)) {
      setError('PIN must be 4 to 6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await setLicencePin(user, pin);
      if (biometricsAvailable) {
        await setBiometricsEnabled(user, useBiometrics);
      }
      if (changePin) {
        Alert.alert('PIN updated', 'Your licence PIN has been changed.', [
          { text: 'OK', onPress: onCancel },
        ]);
      } else {
        onUnlocked?.();
      }
    } catch (err) {
      setError(err.message || 'Could not save PIN.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockWithPin = async () => {
    setError('');
    if (!isValidPin(pin)) {
      setError('Enter your 4 to 6 digit PIN.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyLicencePin(user, pin);
      onUnlocked?.();
    } catch (err) {
      setError(err.message || 'Incorrect PIN.');
      await refreshLockout();
    } finally {
      setSubmitting(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setError('');
    const enabled = await isBiometricsEnabled(user);
    if (!enabled) {
      setError(`Enable ${biometricLabel} in Settings first.`);
      return;
    }

    setSubmitting(true);
    try {
      const success = await unlockWithBiometrics();
      if (success) {
        onUnlocked?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePinVerify = async () => {
    setError('');
    if (!isValidPin(currentPin)) {
      setError('Enter your current PIN.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyLicencePin(user, currentPin);
      setPin('');
      setConfirmPin('');
      setMode('setup');
    } catch (err) {
      setError(err.message || 'Incorrect PIN.');
      await refreshLockout();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Loading…</Text>
      </ScreenContainer>
    );
  }

  const title =
    mode === 'setup'
      ? changePin
        ? 'Create new licence PIN'
        : 'Create licence PIN'
      : mode === 'change-verify'
        ? 'Enter current PIN'
        : 'Unlock driving licence';

  const subtitle =
    mode === 'setup'
      ? 'Choose a 4 to 6 digit PIN to protect your driving licence.'
      : mode === 'change-verify'
        ? 'Verify your current PIN before setting a new one.'
        : 'Enter your PIN or use biometrics to view your licence.';

  const primaryAction =
    mode === 'setup'
      ? handleSetup
      : mode === 'change-verify'
        ? handleChangePinVerify
        : handleUnlockWithPin;

  const primaryLabel =
    mode === 'setup' ? 'Save PIN' : mode === 'change-verify' ? 'Continue' : 'Unlock';

  const primaryEnabled =
    mode === 'setup'
      ? isValidPin(pin) && isValidPin(confirmPin)
      : mode === 'change-verify'
        ? isValidPin(currentPin)
        : isValidPin(pin);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark" size={28} color={PRIMARY} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {lockoutSeconds > 0 ? (
        <Text style={styles.lockoutText}>
          Too many failed attempts. Try again in {lockoutSeconds}s.
        </Text>
      ) : null}

      {mode === 'change-verify' ? (
        <FormInput
          label="Current PIN"
          required
          value={currentPin}
          onChangeText={(value) => {
            setCurrentPin(value.replace(/\D/g, ''));
            setError('');
          }}
          placeholder="••••"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          error={error}
        />
      ) : (
        <>
          <FormInput
            label={mode === 'setup' ? 'New PIN' : 'PIN'}
            required
            value={pin}
            onChangeText={(value) => {
              setPin(value.replace(/\D/g, ''));
              setError('');
            }}
            placeholder="••••"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            error={mode !== 'setup' ? error : undefined}
          />
          {mode === 'setup' ? (
            <FormInput
              label="Confirm PIN"
              required
              value={confirmPin}
              onChangeText={(value) => {
                setConfirmPin(value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="••••"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              error={error}
            />
          ) : null}
        </>
      )}

      {mode === 'setup' && biometricsAvailable ? (
        <Pressable
          style={styles.biometricToggle}
          onPress={() => setUseBiometrics((prev) => !prev)}
        >
          <Ionicons
            name={useBiometrics ? 'checkbox' : 'square-outline'}
            size={22}
            color={PRIMARY}
          />
          <Text style={styles.biometricToggleText}>
            Use {biometricLabel} to unlock licence
          </Text>
        </Pressable>
      ) : null}

      <FormActionButton
        label={submitting ? 'Please wait…' : primaryLabel}
        onPress={primaryAction}
        enabled={primaryEnabled && lockoutSeconds === 0 && !submitting}
      />

      {mode === 'unlock' && biometricsAvailable ? (
        <Pressable
          style={styles.biometricButton}
          onPress={handleBiometricUnlock}
          disabled={submitting || lockoutSeconds > 0}
        >
          <Ionicons name="finger-print-outline" size={20} color={PRIMARY} />
          <Text style={styles.biometricButtonText}>Use {biometricLabel}</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  lockoutText: {
    ...typography.bodySmall,
    color: '#B45309',
    marginBottom: spacing.md,
  },
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  biometricToggleText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray800,
    fontFamily: 'Poppins_500Medium',
    flex: 1,
  },
  biometricButton: {
    marginTop: spacing.md,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: NEUTRAL_COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  biometricButtonText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
  cancelButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontFamily: 'Poppins_500Medium',
  },
});
