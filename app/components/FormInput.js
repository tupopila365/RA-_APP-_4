import React, { useState } from 'react';
import { TextInput, StyleSheet, useColorScheme, View, Text, Platform } from 'react-native';
import { RATheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function FormInput({
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
  const styles = getStyles(colors);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

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
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={multiline || textArea}
          numberOfLines={textArea ? 4 : numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          textAlignVertical={textArea ? 'top' : 'center'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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
      color: '#374151',
      marginBottom: spacing.sm,
      letterSpacing: 0.2,
      ...Platform.select({
        ios: { fontFamily: 'System' },
        android: { fontFamily: 'Roboto' },
      }),
    },
    labelFocused: {
      color: '#00B4E6',
    },
    labelError: {
      color: '#EF4444',
    },
    inputWrapper: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      overflow: 'hidden',
    },
    inputWrapperFocused: {
      borderColor: '#00B4E6',
      borderWidth: 2,
      shadowColor: '#00B4E6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    inputWrapperError: {
      borderColor: '#EF4444',
      borderWidth: 1.5,
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    inputWrapperDisabled: {
      backgroundColor: '#F9FAFB',
      opacity: 0.7,
    },
    input: {
      backgroundColor: 'transparent',
      paddingHorizontal: spacing.md + 4,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: '#111827',
      minHeight: 52,
      lineHeight: 22,
      ...Platform.select({
        ios: { fontFamily: 'System' },
        android: { fontFamily: 'Roboto' },
      }),
    },
    textArea: {
      minHeight: 120,
      paddingTop: spacing.md,
      textAlignVertical: 'top',
    },
    inputError: {
      color: '#111827',
    },
    inputDisabled: {
      color: '#6B7280',
    },
    errorContainer: {
      marginTop: spacing.xs + 2,
      paddingLeft: 2,
    },
    errorText: {
      ...typography.caption,
      fontSize: 12,
      color: '#EF4444',
      fontWeight: '500',
      letterSpacing: 0.1,
    },
  });



