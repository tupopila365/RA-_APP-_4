import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { HeaderSvgBackground } from './HeaderSvgBackground';

export function AppHeader({
  title = 'Roads Authority',
  showBack = false,
  onBackPress,
  showMenu = false,
  onMenuPress,
  logo,
  subtitle,
  welcomeMessage,
}) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.md);

  return (
    <View style={[styles.container, { paddingTop }]}>
      <HeaderSvgBackground />

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

        {/* Right Icon */}
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

      <View style={styles.bottomGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    minHeight: 150,
    justifyContent: 'flex-end',
    overflow: 'hidden',
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
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});