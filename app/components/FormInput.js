import React, { useState, useMemo, useCallback } from 'react';
import { TextInput, StyleSheet, useColorScheme, View, Text, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
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
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    inputWrapperError: {
      borderColor: colors.error,
      borderWidth: 1.5,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    inputWrapperDisabled: {
      backgroundColor: colors.background,
      opacity: 0.7,
    },
    input: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacing.md + 4,
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
    inputWithIcon: {
      paddingRight: 48,
    },
    textArea: {
      minHeight: 120,
      paddingTop: spacing.md,
      textAlignVertical: 'top',
    },
    inputError: {
      color: colors.text,
    },
    inputDisabled: {
      color: colors.textSecondary,
    },
    errorContainer: {
      marginTop: spacing.xs + 2,
      paddingLeft: 2,
    },
    errorText: {
      ...typography.caption,
      fontSize: 12,
      color: colors.error,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    passwordToggle: {
      position: 'absolute',
      right: spacing.md + 4,
      padding: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  stylesCache.set(cacheKey, styles);
  return styles;
}

export const FormInput = React.memo(function FormInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
  textArea = false,
  ...props
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => getStyles(colors), [colors.primary, colors.text, colors.border]);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const hasValue = useMemo(() => value && value.length > 0, [value]);
  const showPasswordToggle = secureTextEntry;

  // Memoize callbacks to prevent unnecessary re-renders
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handlePasswordToggle = useCallback(() => setIsPasswordVisible(prev => !prev), []);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, (isFocused || hasValue) && styles.labelFocused, error && styles.labelError]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        !editable && styles.inputWrapperDisabled,
      ]}>
        <TextInput
          style={[
            styles.input,
            textArea && styles.textArea,
            error && styles.inputError,
            !editable && styles.inputDisabled,
            showPasswordToggle && styles.inputWithIcon,
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline || textArea}
          numberOfLines={textArea ? 4 : numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={editable}
          textAlignVertical={textArea ? 'top' : 'center'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={handlePasswordToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});


