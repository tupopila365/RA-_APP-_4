import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderSvgBackground } from './HeaderSvgBackground';
import { SearchBar } from './SearchBar';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS, RA_YELLOW } from '../theme/colors';

export function HomeHeader({
  welcomeMessage = 'Welcome',
  showMenu = false,
  onMenuPress,
  showBack = false,
  onBackPress,
  showNotificationBell = true,
  showExpiredDot = false,
  showAlmostDueDot = false,
  onNotificationPress,
  showSearch = true,
  searchValue,
  onSearchChangeText,
  onSearchSubmit,
}) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.md);
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!showExpiredDot && !showAlmostDueDot) {
      dotOpacity.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 0.25,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showExpiredDot, showAlmostDueDot, dotOpacity]);

  return (
    <View style={[styles.container, { paddingTop }]}>
      <HeaderSvgBackground />

      <View style={styles.content}>
        <View style={styles.topRow}>
          {showBack ? (
            <Pressable
              onPress={onBackPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <View style={styles.iconBubble}>
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </View>
            </Pressable>
          ) : showNotificationBell ? (
            <Pressable
              onPress={onNotificationPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Messages"
            >
              <View style={styles.iconBubble}>
                <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              </View>
              {showExpiredDot ? (
                <Animated.View style={[styles.notificationDot, styles.redDot, { opacity: dotOpacity }]} />
              ) : null}
              {showAlmostDueDot ? (
                <Animated.View style={[styles.notificationDot, styles.yellowDot, { opacity: dotOpacity }]} />
              ) : null}
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}

          {showMenu ? (
            <Pressable
              onPress={onMenuPress}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Menu"
            >
              <View style={styles.iconBubble}>
                <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
              </View>
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        <View style={styles.brandBlock}>
          <View style={styles.logoRing}>
            <Image
              source={require('../assets/ra logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Roads Authority logo"
            />
          </View>

          <Text style={styles.welcomeMessage} numberOfLines={1}>
            {welcomeMessage}
          </Text>
          <Text style={styles.tagline}>Safe Roads to Prosperity</Text>
        </View>

        <View style={styles.searchWrap}>
          {showSearch ? (
            <SearchBar
              placeholder="Search services, forms & more"
              value={searchValue}
              onChangeText={onSearchChangeText}
              onSubmitEditing={onSearchSubmit}
              onSearchPress={onSearchSubmit}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    paddingBottom: spacing.md,
    backgroundColor: '#00B4E6',
    ...Platform.select({
      ios: {
        shadowColor: '#005A7A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  redDot: {
    backgroundColor: '#EF4444',
  },
  yellowDot: {
    top: 18,
    left: 8,
    right: 'auto',
    backgroundColor: '#FACC15',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#003D52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  logo: {
    width: 68,
    height: 68,
  },
  welcomeMessage: {
    ...typography.h4,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    color: NEUTRAL_COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tagline: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: RA_YELLOW,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  searchWrap: {},
});
