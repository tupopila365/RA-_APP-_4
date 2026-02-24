import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { DESIGN_V2_HEADER } from '../designTokens';

const MIN_HEIGHT = 44;
const PRIMARY = DESIGN_V2_HEADER.primary;

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
  editable = true,
  onFocus,
  onBlur,
  onFocusWithRef,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  const handleFocus = (e) => {
    setFocused(true);
    onFocusWithRef?.(wrapRef.current);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View ref={wrapRef} style={styles.wrap} collapsable={false}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
          focused && styles.inputFocused,
        ]}
        placeholder={placeholder}
        placeholderTextColor={NEUTRAL_COLORS.gray400}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
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
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    borderRadius: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
    minHeight: MIN_HEIGHT,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
  },
  inputError: { borderColor: '#DC2626', borderBottomColor: '#DC2626' },
  errorText: {
    ...typography.caption,
    color: '#DC2626',
    marginTop: spacing.xs,
  },
});
