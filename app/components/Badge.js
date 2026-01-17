import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function Badge({
  label,
  variant = 'default',
  color,
  backgroundColor,
  textColor,
  style,
  size = 'medium',
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  // Variant-based styling
  const variantStyles = {
    default: {
      backgroundColor: backgroundColor || colors.primary,
      textColor: textColor || colors.primary,
    },
    success: {
      backgroundColor: colors.success,
      textColor: colors.success,
    },
    error: {
      backgroundColor: colors.error,
      textColor: colors.error,
    },
    warning: {
      backgroundColor: '#FFA50020',
      textColor: '#FFA500',
    },
    info: {
      backgroundColor: colors.primary,
      textColor: '#FFFFFF',
    },
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const bgColor = backgroundColor || selectedVariant.backgroundColor;
  const txtColor = textColor || selectedVariant.textColor;

  const sizeStyles = {
    small: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: typography.caption.fontSize,
    },
    medium: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      fontSize: typography.label.fontSize,
    },
    large: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      fontSize: typography.bodySmall.fontSize,
    },
  };

  const selectedSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          paddingHorizontal: selectedSize.paddingHorizontal,
          paddingVertical: selectedSize.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: txtColor,
            fontSize: selectedSize.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    badge: {
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    badgeText: {
      ...typography.label,
      fontWeight: '600',
      textAlign: 'center',
    },
  });






















