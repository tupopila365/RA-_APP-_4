import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import { borderRadius } from '../theme/borderRadius';

export function FormInput({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  autoCapitalize = 'none',
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const labelText = `${label}${required ? ' *' : ''}`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{labelText}</Text>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
        placeholder={placeholder || label}
        placeholderTextColor={NEUTRAL_COLORS.gray400}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1.5,
    borderColor: NEUTRAL_COLORS.gray300,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: NEUTRAL_COLORS.gray900,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: PRIMARY,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  error: {
    ...typography.caption,
    color: '#DC2626',
    marginTop: spacing.xs,
  },
});
