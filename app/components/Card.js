import React from 'react';
import { View, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
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
  const styles = getStyles(colors);

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

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginBottom: spacing.md,
  },
  cardDefault: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
