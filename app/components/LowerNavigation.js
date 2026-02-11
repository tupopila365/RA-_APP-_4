export { LowerNavigationClean as LowerNavigation } from './LowerNavigationClean';

import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TAB_META = {
  Home: { icon: 'home-outline', activeIcon: 'home', label: 'HOME' },
  Notifications: { icon: 'notifications-outline', activeIcon: 'notifications', label: 'ALERTS' },
  Chatbot: { icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: 'CHAT', center: true },
  Offices: { icon: 'search-outline', activeIcon: 'search', label: 'OFFICES' },
  Settings: { icon: 'settings-outline', activeIcon: 'settings', label: 'SETTINGS' },
};

const ORDERED_TABS = ['Home', 'Notifications', 'Chatbot', 'Offices', 'Settings'];

export function LowerNavigation({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(insets.bottom), [insets.bottom]);
  const activeRouteName = state.routes[state.index]?.name;

  const visibleRoutes = ORDERED_TABS
    .map((name) => state.routes.find((route) => route.name === name))
    .filter(Boolean);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.navBar}>
        {visibleRoutes.map((route) => {
          const meta = TAB_META[route.name] || TAB_META.Home;
          const isFocused = activeRouteName === route.name;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.navItem}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              activeOpacity={0.75}
            >
              {meta.center ? (
                <View style={styles.centerItemWrap}>
                  <View style={styles.centerBadge} />
                  <View style={[styles.centerIconContainer, isFocused && styles.centerIconContainerActive]}>
                    <Ionicons
                      name={isFocused ? meta.activeIcon : meta.icon}
                      size={30}
                      color={isFocused ? '#0B4A86' : '#0B3C78'}
                    />
                  </View>
                  <Text style={[styles.navLabel, styles.centerLabel]}>CHAT</Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name={isFocused ? meta.activeIcon : meta.icon}
                    size={22}
                    color={isFocused ? '#2563FF' : '#A4B0C5'}
                  />
                  <Text style={[styles.navLabel, isFocused && styles.navLabelActive]}>{meta.label}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getStyles(insetBottom) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: Math.max(insetBottom, 8),
      backgroundColor: 'transparent',
    },
    navBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      borderWidth: 1,
      borderColor: '#E7EDF6',
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#0A2D5E',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
        },
        android: {
          elevation: 7,
        },
      }),
    },
    navItem: {
      flex: 1,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    navLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#B6C0D1',
      marginTop: 4,
      letterSpacing: 0.2,
    },
    navLabelActive: {
      color: '#2563FF',
      fontWeight: '700',
    },
    centerItemWrap: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: -34,
    },
    centerBadge: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#FDC010',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      marginBottom: -8,
      zIndex: 2,
    },
    centerIconContainer: {
      width: 86,
      height: 74,
      borderRadius: 22,
      backgroundColor: '#F8FAFF',
      borderWidth: 1,
      borderColor: '#E7EDF6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerIconContainerActive: {
      backgroundColor: '#F2F8FF',
    },
    centerLabel: {
      marginTop: 2,
    },
  });
}

import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TAB_META = {
  Home: { icon: 'home-outline', activeIcon: 'home', label: 'HOME' },
  Notifications: { icon: 'notifications-outline', activeIcon: 'notifications', label: 'ALERTS' },
  Chatbot: { icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: 'CHAT', center: true },
  Offices: { icon: 'search-outline', activeIcon: 'search', label: 'OFFICES' },
  Settings: { icon: 'settings-outline', activeIcon: 'settings', label: 'SETTINGS' },
};

const ORDERED_TABS = ['Home', 'Notifications', 'Chatbot', 'Offices', 'Settings'];

export function LowerNavigation({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(insets.bottom), [insets.bottom]);
  const activeRoute = state.routes[state.index]?.name;
  const visibleRoutes = ORDERED_TABS
    .map((name) => state.routes.find((route) => route.name === name))
    .filter(Boolean);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.navBar}>
        {visibleRoutes.map((route) => {
          const meta = TAB_META[route.name] || TAB_META.Home;
          const isFocused = activeRoute === route.name;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.navItem}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              activeOpacity={0.75}
            >
              {meta.center ? (
                <View style={styles.centerItemWrap}>
                  <View style={styles.centerBadge} />
                  <View style={[styles.centerIconContainer, isFocused && styles.centerIconContainerActive]}>
                    <Ionicons
                      name={isFocused ? meta.activeIcon : meta.icon}
                      size={30}
                      color={isFocused ? '#0B4A86' : '#0B3C78'}
                    />
                  </View>
                  <Text style={[styles.navLabel, styles.centerLabel]}>CHAT</Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name={isFocused ? meta.activeIcon : meta.icon}
                    size={22}
                    color={isFocused ? '#2563FF' : '#A4B0C5'}
                  />
                  <Text style={[styles.navLabel, isFocused && styles.navLabelActive]}>{meta.label}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getStyles(insetBottom) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: Math.max(insetBottom, 8),
      backgroundColor: 'transparent',
    },
    navBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      borderWidth: 1,
      borderColor: '#E7EDF6',
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#0A2D5E',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
        },
        android: {
          elevation: 7,
        },
      }),
    },
    navItem: {
      flex: 1,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    navLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#B6C0D1',
      marginTop: 4,
      letterSpacing: 0.2,
    },
    navLabelActive: {
      color: '#2563FF',
      fontWeight: '700',
    },
    centerItemWrap: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: -34,
    },
    centerBadge: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#FDC010',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      marginBottom: -8,
      zIndex: 2,
    },
    centerIconContainer: {
      width: 86,
      height: 74,
      borderRadius: 22,
      backgroundColor: '#F8FAFF',
      borderWidth: 1,
      borderColor: '#E7EDF6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerIconContainerActive: {
      backgroundColor: '#F2F8FF',
    },
    centerLabel: {
      marginTop: 2,
    },
  });
}

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

const TAB_CONFIG = {
  Home: { icon: 'home-outline', iconActive: 'home', label: 'HOME' },
  Notifications: { icon: 'notifications-outline', iconActive: 'notifications', label: 'ALERTS' },
  Chatbot: { icon: 'chatbubble-outline', iconActive: 'chatbubble', label: 'CHAT', center: true },
  Offices: { icon: 'search-outline', iconActive: 'search', label: 'OFFICES' },
  Settings: { icon: 'settings-outline', iconActive: 'settings', label: 'SETTINGS' },
};

const VISIBLE_TABS = ['Home', 'Notifications', 'Chatbot', 'Offices', 'Settings'];

export function LowerNavigation({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors, insets.bottom);

  const routes = state.routes.filter((route) => VISIBLE_TABS.includes(route.name));

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        {routes.map((route) => {
          const isFocused = state.routes[state.index]?.name === route.name;
          const config = TAB_CONFIG[route.name] || TAB_CONFIG.Home;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              activeOpacity={0.75}
              style={styles.tabButton}
            >
              {config.center ? (
                <View style={styles.centerWrap}>
                  <View style={styles.centerBadge} />
                  <View style={[styles.centerIconContainer, isFocused && styles.centerIconContainerActive]}>
                    <Ionicons
                      name={isFocused ? config.iconActive : config.icon}
                      size={30}
                      color={isFocused ? colors.primary : '#0B3C78'}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <Ionicons
                    name={isFocused ? config.iconActive : config.icon}
                    size={22}
                    color={isFocused ? '#2563FF' : '#A4B0C5'}
                  />
                  <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{config.label}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getStyles(colors, insetBottom) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingBottom: Math.max(insetBottom, 8),
      paddingTop: 8,
      backgroundColor: 'transparent',
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      borderWidth: 1,
      borderColor: '#E9EEF6',
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#0A2D5E',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
        },
        android: {
          elevation: 7,
        },
      }),
    },
    tabButton: {
      flex: 1,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#B6C0D1',
      marginTop: 4,
      letterSpacing: 0.2,
    },
    tabLabelActive: {
      color: '#2563FF',
      fontWeight: '700',
    },
    centerWrap: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: -34,
    },
    centerBadge: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#FDC010',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      marginBottom: -8,
      zIndex: 2,
    },
    centerIconContainer: {
      width: 86,
      height: 74,
      borderRadius: 22,
      backgroundColor: '#F8FAFF',
      borderWidth: 1,
      borderColor: '#E9EEF6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerIconContainerActive: {
      backgroundColor: '#F5FAFF',
    },
  });
}