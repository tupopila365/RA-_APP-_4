import React from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity, Platform } from 'react-native';
import { RATheme } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function Card({ 
  children, 
  style, 
  onPress, 
  activeOpacity = 0.7,
  variant = 'default', // 'default', 'elevated', 'outlined', 'flat'
  padding = 'medium', // 'none', 'small', 'medium', 'large'
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityRole = 'button'
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const isDark = colorScheme === 'dark';
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

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[styles.card, variantStyle, paddingStyle, style]}
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
      style={[styles.card, variantStyle, paddingStyle, style]}
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
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  
  // Android-safe default styling
  cardDefault: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0 : 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: isDark ? 0 : 1,
      },
    }),
    borderWidth: 1,
    borderColor: isDark ? colors.border : '#E6EAF0',
  },
  
  // Android-safe elevated styling
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
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
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
