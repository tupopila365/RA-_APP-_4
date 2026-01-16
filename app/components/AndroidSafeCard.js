import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

/**
 * Android-Safe Card Component - Bank-grade, government-ready
 * 
 * Designed specifically to avoid Android rendering issues:
 * - Minimal elevation (max 2 for Android)
 * - No overflow: 'hidden' with elevation
 * - Single solid backgroundColor (#FFFFFF)
 * - Border-based separation for consistency
 * - Platform-specific optimizations
 * - Professional bank-like appearance
 */
export function AndroidSafeCard({ 
  children, 
  style, 
  onPress, 
  activeOpacity = 0.7,
  variant = 'default', // 'default', 'elevated', 'outlined', 'flat'
  padding = 'medium', // 'none', 'small', 'medium', 'large'
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityRole,
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
        accessibilityRole={accessibilityRole || 'button'}
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
    backgroundColor: '#FFFFFF', // Always solid white for consistency
    borderRadius: 12, // Professional radius
    marginBottom: spacing.md,
    // NO overflow: 'hidden' to prevent Android elevation clipping
  },
  
  // Default: Minimal elevation with border fallback - Android-safe
  cardDefault: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0 : 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: isDark ? 0 : 1, // Android-safe elevation
      },
    }),
    borderWidth: 1,
    borderColor: isDark ? colors.border : '#E6EAF0', // Consistent border
  },
  
  // Elevated: Slightly more elevation but still Android-safe
  cardElevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: isDark ? 0 : 2, // Max 2 for Android safety
      },
    }),
    borderWidth: 1,
    borderColor: isDark ? colors.border : '#E6EAF0',
  },
  
  // Outlined: Border-only, no elevation - Most Android-safe
  cardOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Flat: No visual separation
  cardFlat: {
    backgroundColor: 'transparent',
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
    padding: spacing.sm,
  },
  paddingMedium: {
    padding: spacing.md,
  },
  paddingLarge: {
    padding: spacing.lg,
  },
});

// Export as default for easy migration
export default AndroidSafeCard;