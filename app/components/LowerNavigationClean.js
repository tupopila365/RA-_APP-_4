import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const TAB_META = {
  Home: { icon: 'home-outline', activeIcon: 'home', label: 'Home' },
  Notifications: { icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts' },
  Chatbot: { icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Chat', center: true },
  Offices: { icon: 'location-outline', activeIcon: 'location', label: 'Offices' },
  Settings: { icon: 'settings-outline', activeIcon: 'settings', label: 'Settings' },
};

const ORDERED_TABS = ['Home', 'Notifications', 'Chatbot', 'Offices', 'Settings'];

export function LowerNavigationClean({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark, insets.bottom), [colors, isDark, insets.bottom]);
  const activeRouteName = state.routes[state.index]?.name;

  const visibleRoutes = ORDERED_TABS
    .map((name) => state.routes.find((route) => route.name === name))
    .filter(Boolean);

  return (
    <View style={styles.navBar} pointerEvents="box-none">
        {visibleRoutes.map((route) => {
          const meta = TAB_META[route.name] || TAB_META.Home;
          const isFocused = activeRouteName === route.name;
          const iconColor = isFocused ? colors.primary : colors.textMuted;
          const labelColor = isFocused ? colors.primary : colors.textMuted;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.navItem}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              activeOpacity={0.7}
            >
              {meta.center ? (
                <View style={styles.centerItemWrap}>
                  <View style={[styles.centerIconContainer, isFocused && styles.centerIconContainerActive]}>
                    <Ionicons
                      name={isFocused ? meta.activeIcon : meta.icon}
                      size={24}
                      color={iconColor}
                    />
                  </View>
                  <Text style={[styles.navLabel, styles.centerLabel, { color: labelColor }]}>{meta.label}</Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name={isFocused ? meta.activeIcon : meta.icon}
                    size={22}
                    color={iconColor}
                  />
                  <Text style={[styles.navLabel, isFocused && styles.navLabelActive, { color: isFocused ? colors.primary : colors.textMuted }]}>
                    {meta.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

function getStyles(colors, isDark, insetBottom) {
  return StyleSheet.create({
    navBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginHorizontal: spacing.xxl,
      marginTop: spacing.sm,
      marginBottom: Math.max(insetBottom, spacing.sm),
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    navItem: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingVertical: spacing.sm,
    },
    navLabel: {
      ...typography.caption,
      fontWeight: '500',
      marginTop: spacing.xs,
    },
    navLabelActive: {
      fontWeight: '600',
    },
    centerItemWrap: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: -24,
    },
    centerIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerIconContainerActive: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    centerLabel: {
      marginTop: spacing.xs,
    },
  });
}

