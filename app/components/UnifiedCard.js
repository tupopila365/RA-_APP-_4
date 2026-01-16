import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';

/**
 * Unified Card Component - Bank-grade, government-ready
 * Android-safe styling to prevent foggy/layered appearance
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
    backgroundColor: '#FFFFFF', // Always solid white for bank-grade consistency
    borderRadius: 12, // Consistent radius for professional look
    marginBottom: spacing.md,
  },
  
  // Default: Clean approach for Android compatibility
  cardDefault: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0 : 0.08,
        shadowRadius: 2,
      },
      android: {
        // Use border-only approach for Android to prevent fogginess
        borderWidth: 1,
        borderColor: isDark ? colors.border : '#E6EAF0',
        elevation: 0, // Remove elevation completely
      },
    }),
    // iOS gets border too for consistency
    ...Platform.select({
      ios: {
        borderWidth: 1,
        borderColor: isDark ? colors.border : '#E6EAF0',
      },
    }),
  },
  
  // Elevated: Still avoid elevation on Android
  cardElevated: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.12,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: isDark ? colors.border : '#E6EAF0',
      },
      android: {
        // Android gets a slightly darker border instead of elevation
        borderWidth: 2,
        borderColor: isDark ? colors.border : '#D1D9E6',
        elevation: 0,
      },
    }),
  },
  
  // Outlined: Border-only approach for maximum compatibility
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