import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

export function useProfileDisplay(user) {
  return useMemo(() => {
    const isLoggedIn = !!user;
    const displayName = user?.fullName?.trim()
      || user?.email?.trim()
      || 'Guest User';
    const username = user?.fullName?.trim()
      || user?.email?.trim()?.split('@')[0]
      || 'Guest';
    const idName = user?.idNumber?.trim()
      || user?.fullName?.trim()
      || '—';
    const email = user?.email?.trim() || '';
    const base = user?.fullName?.trim() || user?.email?.trim() || '';
    let initials = 'RA';
    if (base) {
      const parts = base.split(/\s+/).filter(Boolean);
      initials = parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : base.slice(0, 2).toUpperCase();
    }

    return { isLoggedIn, displayName, username, idName, email, initials };
  }, [user]);
}

export function ProfileAvatar({ initials, isLoggedIn, size = 52 }) {
  const radius = size / 2;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: radius },
        !isLoggedIn && styles.avatarGuest,
      ]}
    >
      {isLoggedIn ? (
        <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
      ) : (
        <Ionicons name="person-outline" size={size * 0.46} color={PRIMARY} />
      )}
    </View>
  );
}

export function ProfileNavRow({ iconName, title, subtitle, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
      onPress={onPress}
    >
      <View style={styles.navIconWrap}>
        <Ionicons name={iconName} size={20} color={PRIMARY} />
      </View>
      <View style={styles.navCopy}>
        <Text style={styles.navTitle}>{title}</Text>
        {subtitle ? <Text style={styles.navSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={NEUTRAL_COLORS.gray400} />
    </Pressable>
  );
}

export function ToggleRow({ iconName, label, value, onToggle, disabled = false }) {
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

export function VehicleStatusBadge({ status }) {
  const configs = {
    valid: { label: 'Valid', color: '#15803D', bg: '#16A34A14', border: '#16A34A33' },
    'due-soon': { label: 'Due soon', color: '#B45309', bg: '#F59E0B14', border: '#F59E0B33' },
    expired: { label: 'Expired', color: '#B91C1C', bg: '#EF444414', border: '#EF444433' },
  };
  const config = configs[status] || configs.valid;

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
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
    letterSpacing: 0.5,
  },
  navRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray100,
  },
  navRowPressed: {
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  navIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCopy: {
    flex: 1,
    minWidth: 0,
  },
  navTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    fontSize: 15,
  },
  navSubtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginTop: 2,
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
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
});
