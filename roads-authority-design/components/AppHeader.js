import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { PRIMARY } from '../theme/colors';

export function AppHeader({
  title = 'Roads Authority',
  showBack = false,
  onBackPress,
  showMenu = false,
  onMenuPress,
  showNotificationBell = false,
  showExpiredDot = false,
  showAlmostDueDot = false,
  onNotificationPress,
  logo,
  subtitle,
  welcomeMessage,
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
      <View style={styles.row}>
        {/* Left Icon */}
        {showBack ? (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </Pressable>
        ) : showNotificationBell ? (
          <Pressable
            onPress={onNotificationPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
            hitSlop={12}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
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

        {/* Center Content */}
        <View style={styles.center}>
          {logo}

          {welcomeMessage ? (
            <Text style={styles.welcomeMessage} numberOfLines={1}>
              {welcomeMessage}
            </Text>
          ) : null}

          {subtitle ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{subtitle}</Text>
            </View>
          ) : null}

          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {showMenu ? (
            <Pressable
              onPress={onMenuPress}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
              hitSlop={12}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 128,
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.6,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  redDot: {
    backgroundColor: '#EF4444',
  },
  yellowDot: {
    top: 17,
    left: 9,
    right: 'auto',
    backgroundColor: '#FACC15',
  },

  welcomeMessage: {
    ...typography.bodySmall,
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 6,
  },

  badgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  title: {
    ...typography.h4,
    color: '#FFFFFF',
    fontSize: 22,
    letterSpacing: 0.3,
  },
});