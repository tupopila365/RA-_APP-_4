import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import {
  canUseBiometrics,
  getBiometricLabel,
  hasLicencePin,
  isBiometricsEnabled,
  setBiometricsEnabled,
} from '../services/licenceLockService';

function ToggleRow({ iconName, label, value, onToggle, disabled = false }) {
  return (
    <Pressable
      style={[styles.toggleRow, disabled && styles.toggleRowDisabled]}
      onPress={disabled ? undefined : onToggle}
    >
      <View style={styles.toggleLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={18} color={PRIMARY} />
        </View>
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <View style={[styles.switchPill, value ? styles.switchPillOn : styles.switchPillOff]}>
        <View style={[styles.switchKnob, value ? styles.switchKnobOn : styles.switchKnobOff]} />
      </View>
    </Pressable>
  );
}

const ACCOUNT_METRICS = [
  { key: 'licences', iconName: 'id-card-outline', value: '1', label: 'Licences' },
  { key: 'vehicles', iconName: 'car-outline', value: '2', label: 'Vehicles' },
  { key: 'renewals', iconName: 'time-outline', value: '1', label: 'Due soon' },
];

function MetricCard({ iconName, value, label }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIconWrap}>
        <Ionicons name={iconName} size={16} color={PRIMARY} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function SettingsScreen({ user, onSignIn, onSignUp, onLogout, onChangeLicencePin }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [hasPin, setHasPin] = useState(false);
  const isLoggedIn = !!user;

  const displayName = useMemo(() => {
    if (user?.fullName?.trim()) return user.fullName.trim();
    if (user?.email?.trim()) return user.email.trim();
    return 'Guest User';
  }, [user]);

  const initials = useMemo(() => {
    const base = user?.fullName?.trim() || user?.email?.trim() || '';
    if (!base) return 'RA';
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
  }, [user]);

  const loadLicenceSecurity = useCallback(async () => {
    if (!user) {
      setHasPin(false);
      setBiometricsEnabledState(false);
      setBiometricsAvailable(false);
      return;
    }

    const [pinSet, bioAvailable, bioEnabled, label] = await Promise.all([
      hasLicencePin(user),
      canUseBiometrics(),
      isBiometricsEnabled(user),
      getBiometricLabel(),
    ]);
    setHasPin(pinSet);
    setBiometricsAvailable(bioAvailable);
    setBiometricsEnabledState(bioEnabled);
    setBiometricLabel(label);
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
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={[styles.avatar, !isLoggedIn && styles.avatarGuest]}>
            {isLoggedIn ? (
              <Text style={styles.avatarText}>{initials}</Text>
            ) : (
              <Ionicons name="person-outline" size={24} color={PRIMARY} />
            )}
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName} numberOfLines={1}>
              {isLoggedIn ? displayName : 'Guest'}
            </Text>
            <Text style={styles.profileSub} numberOfLines={1}>
              {isLoggedIn
                ? user?.email?.trim() || 'Signed in'
                : 'Sign in to access your services'}
            </Text>
          </View>
          {isLoggedIn ? (
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Active</Text>
            </View>
          ) : null}
        </View>

        {isLoggedIn ? (
          <View style={styles.metricsRow}>
            {ACCOUNT_METRICS.map((metric) => (
              <MetricCard
                key={metric.key}
                iconName={metric.iconName}
                value={metric.value}
                label={metric.label}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <ToggleRow
            iconName="notifications-outline"
            label="Notifications"
            value={notificationsEnabled}
            onToggle={() => setNotificationsEnabled((prev) => !prev)}
          />
        </View>

        {isLoggedIn ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Security</Text>
            <Text style={styles.sectionHint}>
              Your PIN unlocks Settings, Notifications, and your driving licence.
            </Text>
            {biometricsAvailable ? (
              <ToggleRow
                iconName="finger-print-outline"
                label={`Unlock with ${biometricLabel}`}
                value={biometricsEnabled}
                onToggle={handleBiometricsToggle}
              />
            ) : (
              <Text style={styles.unavailableText}>
                Biometrics are not available on this device.
              </Text>
            )}
            <Pressable style={styles.changePinButton} onPress={() => onChangeLicencePin?.()}>
              <Ionicons name="key-outline" size={18} color={PRIMARY} />
              <Text style={styles.changePinButtonText}>
                {hasPin ? 'Change PIN' : 'Set up PIN'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {isLoggedIn ? (
          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color={NEUTRAL_COLORS.white} />
            <Text style={styles.logoutButtonText}>Log out</Text>
          </Pressable>
        ) : (
          <View style={styles.authActions}>
            <Pressable style={styles.loginButton} onPress={onSignIn}>
              <Ionicons name="log-in-outline" size={18} color={NEUTRAL_COLORS.white} />
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
            <Pressable style={styles.registerButton} onPress={onSignUp}>
              <Ionicons name="person-add-outline" size={18} color={PRIMARY} />
              <Text style={styles.registerButtonText}>Register</Text>
            </Pressable>
          </View>
        )}
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
  },
  sectionTitle: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing.md,
  },
  sectionHint: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  unavailableText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginBottom: spacing.sm,
  },
  profileCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGuest: {
    backgroundColor: PRIMARY + '14',
    borderWidth: 1,
    borderColor: PRIMARY + '33',
  },
  avatarText: {
    ...typography.body,
    fontFamily: 'Poppins_700Bold',
    color: NEUTRAL_COLORS.white,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    fontSize: 16,
  },
  profileSub: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#16A34A14',
    borderWidth: 1,
    borderColor: '#16A34A33',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusPillText: {
    ...typography.caption,
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#15803D',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY + '14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.body,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: NEUTRAL_COLORS.gray900,
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: NEUTRAL_COLORS.gray500,
    marginTop: 1,
  },
  toggleRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleRowDisabled: {
    opacity: 0.6,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PRIMARY + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  toggleLabel: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray800,
    fontFamily: 'Poppins_500Medium',
  },
  switchPill: {
    width: 48,
    height: 28,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchPillOn: {
    backgroundColor: PRIMARY,
  },
  switchPillOff: {
    backgroundColor: NEUTRAL_COLORS.gray300,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  switchKnobOn: {
    alignSelf: 'flex-end',
  },
  switchKnobOff: {
    alignSelf: 'flex-start',
  },
  changePinButton: {
    marginTop: spacing.sm,
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
  authActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  loginButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loginButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  registerButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  registerButtonText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
  logoutButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  logoutButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
  },
});
