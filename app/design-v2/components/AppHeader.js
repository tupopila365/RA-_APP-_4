import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { DESIGN_V2_HEADER } from '../designTokens';

/**
 * App header for design-v2 — deep blue with optional logo, title, back, menu.
 * Use on Home, About, Contact, and all secondary screens.
 */
export function AppHeader({
  title = 'Roads Authority',
  showBack = false,
  onBackPress,
  showMenu = false,
  onMenuPress,
  logo,
  subtitle,
}) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, spacing.md);

  return (
    <LinearGradient
      colors={[DESIGN_V2_HEADER.gradientTop, DESIGN_V2_HEADER.primary]}
      style={[styles.gradient, { paddingTop }]}
    >
      <View style={styles.pattern} />
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <View style={styles.center}>
          {logo != null ? logo : null}
          {subtitle ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{subtitle}</Text>
            </View>
          ) : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {showMenu ? (
          <Pressable
            onPress={onMenuPress}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 100,
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.08,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  badgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    ...typography.h4,
    color: '#FFFFFF',
    fontSize: 20,
  },
});
