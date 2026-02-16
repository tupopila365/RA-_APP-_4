import React, { useRef, useCallback } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  View, 
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';

/**
 * Unified Button Component - Bank-grade, Government-ready
 * 
 * Redesigned following Apple Human Interface Guidelines:
 * - Minimum 44pt touch targets for accessibility
 * - 12pt corner radius for modern, premium appearance
 * - Smooth press animation with scale feedback
 * - Clear visual hierarchy with 5 variants
 * - WCAG AA compliant contrast ratios
 * 
 * @example
 * <UnifiedButton 
 *   label="Submit Application" 
 *   variant="primary" 
 *   onPress={handleSubmit}
 *   iconName="checkmark-circle"
 * />
 */
export function UnifiedButton({
  label,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'outline', 'danger', 'success'
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
  accessibilityHint,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  // Size configurations - all meet 44pt minimum touch target
  const sizeConfig = {
    small: {
      style: styles.buttonSmall,
      iconSize: 16,
      textStyle: styles.textSmall,
    },
    medium: {
      style: styles.buttonMedium,
      iconSize: 18,
      textStyle: styles.textMedium,
    },
    large: {
      style: styles.buttonLarge,
      iconSize: 20,
      textStyle: styles.textLarge,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      button: styles.buttonPrimary,
      text: styles.textPrimary,
      iconColor: colors.textInverse,
      pressedBg: colors.primaryDark,
    },
    secondary: {
      button: styles.buttonSecondary,
      text: styles.textSecondary,
      iconColor: colors.text,
      pressedBg: colors.buttonSecondaryHover,
    },
    ghost: {
      button: styles.buttonGhost,
      text: styles.textGhost,
      iconColor: colors.primary,
      pressedBg: colors.backgroundSecondary,
    },
    outline: {
      button: styles.buttonOutline,
      text: styles.textOutline,
      iconColor: colors.primary,
      pressedBg: colors.backgroundSecondary,
    },
    danger: {
      button: styles.buttonDanger,
      text: styles.textDanger,
      iconColor: colors.textInverse,
      pressedBg: colors.errorDark,
    },
    success: {
      button: styles.buttonSuccess,
      text: styles.textSuccess,
      iconColor: colors.textInverse,
      pressedBg: colors.successDark,
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;
  const currentVariant = variantConfig[variant] || variantConfig.primary;

  const buttonStyle = [
    styles.button,
    currentSize.style,
    currentVariant.button,
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const renderIcon = (position) => {
    if (!iconName || iconPosition !== position) return null;
    
    return (
      <Ionicons 
        name={iconName} 
        size={currentSize.iconSize} 
        color={disabled ? colors.textDisabled : currentVariant.iconColor}
        style={position === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' || variant === 'ghost' || variant === 'outline' 
            ? colors.primary 
            : colors.textInverse
          }
        />
      );
    }

    return (
      <>
        {renderIcon('left')}
        <Text 
          style={[
            styles.text,
            currentSize.textStyle,
            currentVariant.text,
            disabled && styles.textDisabled,
          ]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
        {renderIcon('right')}
      </>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          buttonStyle,
          pressed && !disabled && { backgroundColor: currentVariant.pressedBg },
        ]}
        disabled={disabled || loading}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ 
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        <View style={styles.buttonContent}>
          {renderContent()}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    // Base button style
    button: {
      borderRadius: borderRadius.lg, // 12pt - modern Apple-style
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Size Variants - All meet 44pt minimum touch target (Apple HIG)
    buttonSmall: {
      paddingHorizontal: spacing.lg, // 16pt
      paddingVertical: spacing.sm,   // 8pt
      minHeight: 44,                 // Minimum touch target
      minWidth: 64,
    },
    buttonMedium: {
      paddingHorizontal: spacing.xl,  // 20pt
      paddingVertical: spacing.md,    // 12pt
      minHeight: 50,
      minWidth: 80,
    },
    buttonLarge: {
      paddingHorizontal: spacing.xxl, // 24pt
      paddingVertical: spacing.lg,    // 16pt
      minHeight: 56,
      minWidth: 100,
    },

    // Color Variants - Primary (main CTA)
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    
    // Secondary - for less prominent actions
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
      ...Platform.select({
        ios: {
          shadowOpacity: 0.08,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    
    // Ghost - minimal style, for tertiary actions
    buttonGhost: {
      backgroundColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    
    // Outline - bordered style, for secondary emphasis
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    
    // Danger - for destructive actions
    buttonDanger: {
      backgroundColor: colors.error,
    },
    
    // Success - for positive/confirmation actions
    buttonSuccess: {
      backgroundColor: colors.success,
    },

    // Base text style
    text: {
      ...typography.button,
      textAlign: 'center',
    },

    // Text size variants
    textSmall: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
    },
    textMedium: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
    },
    textLarge: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '600',
    },

    // Text color variants
    textPrimary: {
      color: colors.textInverse,
    },
    textSecondary: {
      color: colors.text,
    },
    textGhost: {
      color: colors.primary,
    },
    textOutline: {
      color: colors.primary,
    },
    textDanger: {
      color: colors.textInverse,
    },
    textSuccess: {
      color: colors.textInverse,
    },

    // States
    buttonDisabled: {
      backgroundColor: colors.disabledBackground,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    textDisabled: {
      color: colors.textDisabled,
    },
    buttonFullWidth: {
      width: '100%',
    },

    // Icon spacing
    iconLeft: {
      marginRight: spacing.sm, // 8pt
    },
    iconRight: {
      marginLeft: spacing.sm, // 8pt
    },
  });