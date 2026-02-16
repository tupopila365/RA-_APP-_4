import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { DESIGN_V2_HEADER } from '../designTokens';

const MIN_HEIGHT = 44;

export function FormInput({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  numberOfLines,
  error,
  ...rest
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={NEUTRAL_COLORS.gray400}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    ...typography.label,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray300,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
    minHeight: MIN_HEIGHT,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: { borderBottomColor: '#DC2626' },
  errorText: {
    ...typography.caption,
    color: '#DC2626',
    marginTop: spacing.xs,
  },
});
