import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

// Memoize styles per color scheme to avoid recreating on every render
const stylesCache = new Map();

function getStyles(colors) {
  const cacheKey = `${colors.primary}-${colors.text}-${colors.border}`;
  if (stylesCache.has(cacheKey)) {
    return stylesCache.get(cacheKey);
  }

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },

    label: {
      ...typography.bodySmall,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
      letterSpacing: 0.2,
      ...Platform.select({
        ios: { fontFamily: 'System' },
        android: { fontFamily: 'Roboto' },
      }),
    },

    labelFocused: {
      color: colors.primary,
    },

    labelError: {
      color: colors.error,
    },

    inputWrapper: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: Platform.OS === 'android' ? 0 : 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    inputWrapperFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.backgroundSecondary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },

    inputWrapperError: {
      borderColor: colors.error,
      shadowColor: colors.error,
    },

    inputWrapperDisabled: {
      backgroundColor: colors.background,
      opacity: 0.7,
    },

    leftIconContainer: {
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
    },

    rightIconContainer: {
      paddingRight: spacing.md,
      paddingLeft: spacing.sm,
    },

    input: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.text,
      minHeight: 52,
      lineHeight: 22,
      flex: 1,
      ...Platform.select({
        ios: { fontFamily: 'System' },
        android: { fontFamily: 'Roboto' },
      }),
    },

    inputWithLeftIcon: {
      paddingLeft: 0,
    },

    inputWithRightIcon: {
      paddingRight: 0,
    },

    inputMultiline: {
      minHeight: 120,
      textAlignVertical: 'top',
    },

    inputError: {
      color: colors.text,
    },

    inputDisabled: {
      color: colors.textSecondary,
    },

    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs + 2,
    },

    errorText: {
      ...typography.caption,
      fontSize: 12,
      color: colors.error,
      marginLeft: spacing.xs,
      flex: 1,
    },

    helperText: {
      ...typography.caption,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: spacing.xs + 2,
    },
  });

  stylesCache.set(cacheKey, styles);
  return styles;
}

export const UnifiedFormInput = React.memo(function UnifiedFormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  helperText,
  testID,
  accessibilityLabel,
  ...props
}) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => getStyles(colors), [colors.primary, colors.text, colors.border]);

  const hasValue = useMemo(() => value?.length > 0, [value]);
  const showPasswordToggle = secureTextEntry;

  // Memoize callbacks to prevent unnecessary re-renders
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handlePasswordToggle = useCallback(() => setIsPasswordVisible(prev => !prev), []);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text
          style={[
            styles.label,
            (isFocused || hasValue) && styles.labelFocused,
            error && styles.labelError,
          ]}
        >
          {label}
          {required && ' *'}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={20} color={colors.textSecondary} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            error && styles.inputError,
            !editable && styles.inputDisabled,
            leftIcon && styles.inputWithLeftIcon,
            (showPasswordToggle || rightIcon) && styles.inputWithRightIcon,
            { backgroundColor: 'transparent' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel || label}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          importantForAutofill="no"
          {...props}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handlePasswordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
          >
            <Ionicons name={rightIcon} size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
});

