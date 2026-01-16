import React, { useState } from 'react';
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

export function UnifiedFormInput({
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
  const styles = getStyles(colors);

  const hasValue = value?.length > 0;
  const showPasswordToggle = secureTextEntry;

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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
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
}

const getStyles = (colors) =>
  StyleSheet.create({
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
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowColor: '#000',
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
      backgroundColor: 'rgba(0, 122, 255, 0.08)',
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
