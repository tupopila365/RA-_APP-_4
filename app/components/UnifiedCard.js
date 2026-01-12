import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

/**
 * Unified Card Component - Bank-grade, government-ready
 * Consistent across all screens in the app
 * Based on approved design from locked pages
 */
export function UnifiedCard({ 
  children, 
  style, 
  onPress, 
  activeOpacity = 0.7,
  variant = 'default', // 'default', 'elevated', 'outlined', 'flat'
  padding = 'medium', // 'none', 'small', 'medium', 'large'
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityRole = 'button',
  disabled = false,
}) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const paddingStyle = {
    none: styles.paddingNone,
    small: styles.paddingSmall,
    medium: styles.paddingMedium,
    large: styles.paddingLarge,
  }[padding] || styles.paddingMedium;

  const variantStyle = {
    default: styles.cardDefault,
    elevated: styles.cardElevated,
    outlined: styles.cardOutlined,
    flat: styles.cardFlat,
  }[variant] || styles.cardDefault;

  const cardStyle = [
    styles.card, 
    variantStyle, 
    paddingStyle, 
    disabled && styles.cardDisabled,
    style
  ];

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={cardStyle}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View 
      style={cardStyle}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginBottom: spacing.md,
  },
  cardDefault: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? (isDark ? 0 : 3) : 0,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.15,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? (isDark ? 0 : 6) : 0,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  cardOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardFlat: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: spacing.md,
  },
  paddingMedium: {
    padding: spacing.xl,
  },
  paddingLarge: {
    padding: spacing.xxl,
  },
});