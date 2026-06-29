import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import {
  ProfileAvatar,
  ProfileNavRow,
  useProfileDisplay,
} from '../components/ProfileShared';
import { getRegisteredVehicleCounts } from '../data/registeredVehicles';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

export function MyProfileHubScreen({
  user,
  onSignIn,
  onSignUp,
  onLogout,
  onOpenAccountDetails,
  onOpenRegisteredVehicles,
  onOpenAppSettings,
}) {
  const { isLoggedIn, displayName, email, initials } = useProfileDisplay(user);
  const { total } = getRegisteredVehicleCounts();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <ProfileAvatar initials={initials} isLoggedIn={isLoggedIn} />
        <View style={styles.profileMeta}>
          <Text style={styles.profileName} numberOfLines={1}>
            {isLoggedIn ? displayName : 'Guest'}
          </Text>
          <Text style={styles.profileSub} numberOfLines={1}>
            {isLoggedIn ? email || 'Signed in' : 'Sign in to access your services'}
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
        <>
          <View style={styles.card}>
            <ProfileNavRow
              iconName="person-outline"
              title="Account details"
              subtitle="View your registered details"
              onPress={onOpenAccountDetails}
            />
            <ProfileNavRow
              iconName="car-outline"
              title="Registered vehicles"
              subtitle={
                total === 1
                  ? '1 vehicle linked to your ID'
                  : `${total} vehicles linked to your ID`
              }
              onPress={onOpenRegisteredVehicles}
            />
            <ProfileNavRow
              iconName="settings-outline"
              title="Settings"
              subtitle="Personalize the app your way"
              onPress={onOpenAppSettings}
            />
          </View>

          <Pressable style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color={NEUTRAL_COLORS.white} />
            <Text style={styles.logoutButtonText}>Log off</Text>
          </Pressable>
        </>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
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
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
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
