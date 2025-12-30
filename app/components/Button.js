import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function Button({
  onPress,
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconName,
  iconPosition = 'left', // 'left' or 'right'
  size = 'medium', // 'small', 'medium', 'large'
  fullWidth = false,
  style,
  textStyle,
  testID,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const variantStyle = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    ghost: styles.ghostButton,
    outline: styles.outlineButton,
    danger: styles.dangerButton,
  }[variant] || styles.primaryButton;

  const variantTextStyle = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    outline: styles.outlineText,
    danger: styles.dangerText,
  }[variant] || styles.primaryText;

  const sizeStyle = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  }[size] || styles.mediumButton;

  const sizeTextStyle = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  }[size] || styles.mediumText;

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary}
          style={styles.loadingIndicator}
        />
      );
    }

    if (iconName) {
      const iconColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary;
      return (
        <Ionicons
          name={iconName}
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color={iconColor}
          style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
        />
      );
    }

    if (icon) {
      return <View style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}>{icon}</View>;
    }

    return null;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <View style={styles.buttonContent}>
        {iconPosition === 'left' && renderIcon()}
        {!loading && label && (
          <Text style={[styles.buttonText, variantTextStyle, sizeTextStyle, textStyle]}>
            {label}
          </Text>
        )}
        {loading && !label && <View style={styles.loadingContainer}>{renderIcon()}</View>}
        {iconPosition === 'right' && renderIcon()}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    primaryButton: {
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghostButton: {
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dangerButton: {
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      minHeight: 36,
    },
    mediumButton: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: 8,
      minHeight: 48,
    },
    largeButton: {
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.lg,
      borderRadius: 8,
      minHeight: 56,
    },
    fullWidth: {
      width: '100%',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontWeight: '600',
      textAlign: 'center',
    },
    smallText: {
      ...typography.bodySmall,
      fontWeight: '600',
    },
    mediumText: {
      ...typography.body,
      fontWeight: '600',
    },
    largeText: {
      ...typography.h5,
      fontWeight: '600',
    },
    primaryText: {
      color: '#FFFFFF',
    },
    secondaryText: {
      color: '#000000',
    },
    ghostText: {
      color: colors.primary,
    },
    outlineText: {
      color: colors.primary,
    },
    dangerText: {
      color: '#FFFFFF',
    },
    iconLeft: {
      marginRight: spacing.xs,
    },
    iconRight: {
      marginLeft: spacing.xs,
    },
    loadingIndicator: {
      marginRight: spacing.xs,
    },
    loadingContainer: {
      padding: spacing.xs,
    },
    disabled: {
      opacity: 0.6,
    },
  });
