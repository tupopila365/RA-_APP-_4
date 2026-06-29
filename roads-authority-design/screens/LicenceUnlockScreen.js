import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  BackHandler,
  Vibration,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RaLogoRing } from '../components';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { CONTENT_BACKGROUND, NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import {
  canUseBiometrics,
  clearLicencePin,
  BIOMETRIC_UNLOCK_PROMPT,
  getLockoutRemainingMs,
  hasLicencePin,
  isBiometricsEnabled,
  isValidPin,
  PIN_LENGTH,
  setLicencePin,
  unlockWithBiometrics,
  verifyLicencePin,
} from '../services/licenceLockService';

const KEYPAD_ROWS = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
  ],
  [
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
  ],
  [
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
  ],
];

function triggerKeyPressFeedback() {
  if (Platform.OS === 'android') {
    Vibration.vibrate(8);
  } else {
    Vibration.vibrate();
  }
}

function triggerWrongPinFeedback() {
  Vibration.vibrate([0, 80, 60, 80]);
}

function PinBoxes({ value, length = PIN_LENGTH, hasError = false, shakeAnim }) {
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Animated.View
      style={[
        styles.pinRow,
        shakeAnim ? { transform: [{ translateX: shakeAnim }] } : null,
      ]}
    >
      {Array.from({ length }).map((_, index) => {
        const filled = !!value[index];
        const isActive = !hasError && index === activeIndex && value.length < length;
        return (
          <View
            key={index}
            style={[
              styles.pinBox,
              filled && !hasError ? styles.pinBoxFilled : null,
              isActive ? styles.pinBoxActive : null,
              hasError ? styles.pinBoxError : null,
            ]}
          >
            {filled ? (
              <View style={[styles.pinDot, hasError ? styles.pinDotError : null]} />
            ) : null}
          </View>
        );
      })}
    </Animated.View>
  );
}

function KeypadButton({ onPress, disabled, children }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    if (disabled) return;
    triggerKeyPressFeedback();
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 5,
    }).start();
  };

  return (
    <View style={styles.keypadCell}>
      <Pressable
        onPress={onPress}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.roundKey,
            { transform: [{ scale }] },
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    </View>
  );
}

function PinKeypad({ onDigit, onBackspace, disabled }) {
  return (
    <View style={styles.keypad}>
      {KEYPAD_ROWS.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.keypadRow}>
          {row.map((key) => (
            <KeypadButton
              key={key.digit}
              onPress={() => onDigit(key.digit)}
              disabled={disabled}
            >
              <Text style={styles.keypadDigit}>{key.digit}</Text>
              {key.letters ? <Text style={styles.keypadLetters}>{key.letters}</Text> : null}
            </KeypadButton>
          ))}
        </View>
      ))}
      <View style={styles.keypadRow}>
        <View style={styles.keypadCell} />
        <KeypadButton onPress={() => onDigit('0')} disabled={disabled}>
          <Text style={styles.keypadDigit}>0</Text>
        </KeypadButton>
        <KeypadButton onPress={onBackspace} disabled={disabled}>
          <Ionicons name="backspace-outline" size={22} color={NEUTRAL_COLORS.gray700} />
        </KeypadButton>
      </View>
    </View>
  );
}

function KeypadBottomAction({ label, onPress, disabled }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.keypadBottomAction,
        pressed && !disabled && styles.keypadBottomActionPressed,
        disabled && styles.keypadBottomActionDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.keypadBottomActionText}>{label}</Text>
    </Pressable>
  );
}

export function LicenceUnlockScreen({
  user,
  onUnlocked,
  onCancel,
  changePin = false,
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('unlock');
  const [pin, setPin] = useState('');
  const [pendingPin, setPendingPin] = useState('');
  const [error, setError] = useState('');
  const [pinHasError, setPinHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const bioPromptedRef = useRef(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const displayName =
    user?.fullName?.trim()
    || user?.email?.split('@')[0]?.trim()
    || 'User';

  const refreshLockout = useCallback(async () => {
    const remaining = await getLockoutRemainingMs(user);
    setLockoutSeconds(Math.ceil(remaining / 1000));
  }, [user]);

  const runPinShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const showPinError = useCallback(() => {
    setPinHasError(true);
    triggerWrongPinFeedback();
    runPinShake();
  }, [runPinShake]);

  const clearPinError = useCallback(() => {
    setPinHasError(false);
    setError('');
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hasPin = await hasLicencePin(user);
        if (!mounted) return;

        if (changePin) {
          setMode(hasPin ? 'change-verify' : 'setup');
        } else {
          setMode(hasPin ? 'unlock' : 'setup');
        }

        await refreshLockout();
      } catch {
        // Keep default unlock mode if PIN state cannot be read.
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, changePin, refreshLockout]);

  useEffect(() => {
    if (lockoutSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      refreshLockout();
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds, refreshLockout]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel?.();
      return true;
    });
    return () => subscription.remove();
  }, [onCancel]);

  const loadBiometrics = useCallback(async () => {
    const [available, enabled] = await Promise.all([
      canUseBiometrics(),
      isBiometricsEnabled(user),
    ]);
    setBiometricsAvailable(available);
    setBiometricsEnabled(enabled);
  }, [user]);

  useEffect(() => {
    loadBiometrics();
  }, [loadBiometrics]);

  const handleBiometricUnlock = useCallback(async (auto = false) => {
    if (
      mode !== 'unlock'
      || changePin
      || !biometricsEnabled
      || !biometricsAvailable
      || submitting
      || lockoutSeconds > 0
    ) {
      return;
    }

    clearPinError();
    const unlocked = await unlockWithBiometrics(BIOMETRIC_UNLOCK_PROMPT);
    if (unlocked) {
      onUnlocked?.();
    }
  }, [
    mode,
    changePin,
    biometricsEnabled,
    biometricsAvailable,
    submitting,
    lockoutSeconds,
    onUnlocked,
    clearPinError,
  ]);

  useEffect(() => {
    if (
      mode !== 'unlock'
      || changePin
      || !biometricsEnabled
      || !biometricsAvailable
      || lockoutSeconds > 0
      || bioPromptedRef.current
    ) {
      return;
    }

    bioPromptedRef.current = true;
    handleBiometricUnlock(true);
  }, [
    mode,
    changePin,
    biometricsEnabled,
    biometricsAvailable,
    lockoutSeconds,
    handleBiometricUnlock,
  ]);

  const resetEntry = () => {
    setPin('');
    if (!pinHasError) {
      setError('');
    }
  };

  const handleSetupComplete = async (confirmedPin) => {
    if (confirmedPin !== pendingPin) {
      setError('PINs do not match. Try again.');
      showPinError();
      setPendingPin('');
      setMode('setup');
      resetEntry();
      return;
    }

    setSubmitting(true);
    try {
      await setLicencePin(user, confirmedPin);
      if (changePin) {
        Alert.alert('PIN updated', 'Your PIN has been changed.', [
          { text: 'OK', onPress: onCancel },
        ]);
      } else {
        onUnlocked?.();
      }
    } catch (err) {
      setError(err.message || 'Could not save PIN.');
      resetEntry();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (enteredPin) => {
    setSubmitting(true);
    try {
      await verifyLicencePin(user, enteredPin);
      clearPinError();
      onUnlocked?.();
    } catch (err) {
      setError(err.message || 'Incorrect PIN.');
      showPinError();
      await refreshLockout();
      resetEntry();
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeVerify = async (enteredPin) => {
    setSubmitting(true);
    try {
      await verifyLicencePin(user, enteredPin);
      clearPinError();
      setPendingPin('');
      setMode('setup');
      resetEntry();
    } catch (err) {
      setError(err.message || 'Incorrect PIN.');
      showPinError();
      await refreshLockout();
      resetEntry();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinComplete = useCallback(async (enteredPin) => {
    if (!isValidPin(enteredPin) || submitting || lockoutSeconds > 0) return;

    if (mode === 'unlock') {
      await handleUnlock(enteredPin);
      return;
    }

    if (mode === 'change-verify') {
      await handleChangeVerify(enteredPin);
      return;
    }

    if (mode === 'setup') {
      setPendingPin(enteredPin);
      setMode('setup-confirm');
      resetEntry();
      return;
    }

    if (mode === 'setup-confirm') {
      await handleSetupComplete(enteredPin);
    }
  }, [mode, submitting, lockoutSeconds, pendingPin, changePin, user]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handlePinComplete(pin);
    }
  }, [pin, handlePinComplete]);

  const handleDigit = (digit) => {
    if (submitting || lockoutSeconds > 0 || pin.length >= PIN_LENGTH) return;
    clearPinError();
    setPin((current) => `${current}${digit}`.slice(0, PIN_LENGTH));
  };

  const handleBackspace = () => {
    if (submitting) return;
    clearPinError();
    setPin((current) => current.slice(0, -1));
  };

  const handleForgotPin = () => {
    Alert.alert(
      'Forgot PIN?',
      'You will need to create a new PIN to access your protected information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset PIN',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLicencePin(user);
              clearPinError();
              setPendingPin('');
              setMode('setup');
              resetEntry();
            } catch (err) {
              Alert.alert('Could not reset PIN', err.message || 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const isSetupFlow = mode === 'setup' || mode === 'setup-confirm';
  const showCancel = isSetupFlow || mode === 'change-verify';
  const showForgotPin = mode === 'unlock' && !changePin;

  const keypadBottomAction = showCancel
    ? { label: 'Cancel', onPress: () => onCancel?.() }
    : showForgotPin
      ? { label: 'Forgot PIN', onPress: handleForgotPin }
      : null;

  const keypadDisabled = submitting || lockoutSeconds > 0;

  const title =
    mode === 'setup' || mode === 'setup-confirm'
      ? mode === 'setup-confirm'
        ? 'Confirm your PIN'
        : 'Create your PIN'
      : mode === 'change-verify'
        ? 'Enter current PIN'
        : 'Enter your PIN';

  const subtitle =
    mode === 'setup'
      ? 'This Pin Protects your sensitive information'
      : mode === 'setup-confirm'
        ? 'Enter the same PIN again.'
        : mode === 'change-verify'
          ? 'Enter your current PIN.'
          : mode === 'unlock'
            ? `Hi, ${displayName}. Enter your secret PIN to continue.`
            : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <RaLogoRing size={84} logoSize={68} />
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <PinBoxes value={pin} hasError={pinHasError} shakeAnim={shakeAnim} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {lockoutSeconds > 0 ? (
          <Text style={styles.lockoutText}>
            Try again in {lockoutSeconds}s
          </Text>
        ) : null}
        {submitting ? <ActivityIndicator color={PRIMARY} style={styles.loader} /> : null}

        {mode === 'unlock' && biometricsEnabled && biometricsAvailable && lockoutSeconds <= 0 ? (
          <Pressable
            style={({ pressed }) => [styles.bioButton, pressed && styles.bioButtonPressed]}
            onPress={() => handleBiometricUnlock(false)}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Unlock with biometrics"
          >
            <Ionicons name="finger-print-outline" size={22} color={PRIMARY} />
            <Text style={styles.bioButtonText}>Use biometrics</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.bottomArea}>
        <PinKeypad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          disabled={keypadDisabled}
        />
        {keypadBottomAction ? (
          <View style={styles.bottomActionArea}>
            <KeypadBottomAction
              label={keypadBottomAction.label}
              onPress={keypadBottomAction.onPress}
              disabled={keypadDisabled}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoArea: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },
  pinBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: NEUTRAL_COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
  },
  pinBoxFilled: {
    borderColor: NEUTRAL_COLORS.gray400,
  },
  pinBoxActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY + '08',
  },
  pinBoxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: NEUTRAL_COLORS.gray900,
  },
  pinDotError: {
    backgroundColor: '#DC2626',
  },
  errorText: {
    ...typography.bodySmall,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  lockoutText: {
    ...typography.bodySmall,
    color: '#B45309',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontFamily: 'Poppins_500Medium',
  },
  loader: {
    marginTop: spacing.md,
  },
  bottomArea: {
    width: '100%',
  },
  keypad: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomActionArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: CONTENT_BACKGROUND,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  keypadCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadBottomAction: {
    width: '100%',
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  keypadBottomActionPressed: {
    backgroundColor: NEUTRAL_COLORS.gray100,
    opacity: 0.9,
  },
  keypadBottomActionDisabled: {
    opacity: 0.45,
  },
  keypadBottomActionText: {
    ...typography.button,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
    fontWeight: 'normal',
  },
  roundKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  keypadDigit: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 26,
    color: NEUTRAL_COLORS.gray900,
    lineHeight: 30,
  },
  keypadLetters: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: NEUTRAL_COLORS.gray500,
    letterSpacing: 1.1,
    marginTop: 2,
  },
  bioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY + '44',
    backgroundColor: PRIMARY + '0D',
  },
  bioButtonPressed: {
    opacity: 0.75,
  },
  bioButtonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
  },
});
