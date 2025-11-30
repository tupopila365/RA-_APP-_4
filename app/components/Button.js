import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, View } from 'react-native';
import { RATheme } from '../theme/colors';

export function Button({
  onPress,
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
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
  }[variant];

  const variantTextStyle = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[variantStyle, style, disabled && styles.disabled]}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <View style={styles.buttonContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        {!loading && <Text style={[styles.buttonText, variantTextStyle]}>{label}</Text>}
        {loading && <Text style={[styles.buttonText, variantTextStyle]}>Loading...</Text>}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    primaryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghostButton: {
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 14,
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
    iconContainer: {
      marginRight: 8,
    },
    disabled: {
      opacity: 0.5,
    },
  });
