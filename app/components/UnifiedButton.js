import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { UnifiedSkeletonLoader } from './UnifiedSkeletonLoader';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * Unified Button Component - Bank-grade, government-ready
 * Consistent across all screens in the app
 * Based on approved design from locked pages
 */
export function UnifiedButton({
  label,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'outline', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  iconName,
  iconPosition = 'left', // 'left', 'right'
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityRole = 'button',
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const sizeStyle = {
    small: styles.buttonSmall,
    medium: styles.buttonMedium,
    large: styles.buttonLarge,
  }[size] || styles.buttonMedium;

  const variantStyle = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    ghost: styles.buttonGhost,
    outline: styles.buttonOutline,
    danger: styles.buttonDanger,
  }[variant] || styles.buttonPrimary;

  const textStyle = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    ghost: styles.textGhost,
    outline: styles.textOutline,
    danger: styles.textDanger,
  }[variant] || styles.textPrimary;

  const iconSize = {
    small: 16,
    medium: 18,
    large: 20,
  }[size] || 18;

  const iconColor = {
    primary: colors.textInverse,
    secondary: colors.text,
    ghost: colors.primary,
    outline: colors.primary,
    danger: colors.textInverse,
  }[variant] || colors.textInverse;

  const buttonStyle = [
    styles.button,
    sizeStyle,
    variantStyle,
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <UnifiedSkeletonLoader type="button" animated={true} />
        </View>
      );
    }

    const iconElement = iconName ? (
      <Ionicons 
        name={iconName} 
        size={iconSize} 
        color={disabled ? colors.textSecondary : iconColor} 
      />
    ) : null;

    const textElement = (
      <Text 
        style={[
          textStyle, 
          disabled && styles.textDisabled,
          iconName && iconPosition === 'left' && styles.textWithLeftIcon,
          iconName && iconPosition === 'right' && styles.textWithRightIcon,
        ]}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    );

    if (iconPosition === 'right') {
      return (
        <>
          {textElement}
          {iconElement}
        </>
      );
    }

    return (
      <>
        {iconElement}
        {textElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <View style={styles.buttonContent}>
        {renderContent()}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    button: {
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Size Variants
    buttonSmall: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      minHeight: 36,
    },
    buttonMedium: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 48,
    },
    buttonLarge: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 56,
    },

    // Color Variants
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
    },
    buttonGhost: {
      backgroundColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonDanger: {
      backgroundColor: colors.error,
    },

    // Text Styles
    textPrimary: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: colors.textInverse,
    },
    textSecondary: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: colors.text,
    },
    textGhost: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: colors.primary,
    },
    textOutline: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: colors.primary,
    },
    textDanger: {
      ...typography.bodyMedium,
      fontWeight: '600',
      color: colors.textInverse,
    },

    // States
    buttonDisabled: {
      opacity: 0.6,
      shadowOpacity: 0,
      elevation: 0,
    },
    textDisabled: {
      color: colors.textSecondary,
    },
    buttonFullWidth: {
      width: '100%',
    },

    // Icon Spacing
    textWithLeftIcon: {
      marginLeft: spacing.xs,
    },
    textWithRightIcon: {
      marginRight: spacing.xs,
    },

    // Loading State
    loadingContainer: {
      width: 60,
      height: 20,
    },
  });