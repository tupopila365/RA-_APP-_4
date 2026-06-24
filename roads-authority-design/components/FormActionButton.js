import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { PRIMARY, NEUTRAL_COLORS } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function FormActionButton({
  label,
  onPress,
  enabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const disabled = !enabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        enabled ? styles.enabled : styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, enabled ? styles.textEnabled : styles.textDisabled, textStyle]}>
        {loading ? 'Signing in…' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    marginTop: spacing.lg,
  },
  enabled: {
    backgroundColor: PRIMARY,
  },
  disabled: {
    backgroundColor: '#D1D5DB',
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    ...typography.button,
  },
  textEnabled: {
    color: NEUTRAL_COLORS.white,
  },
  textDisabled: {
    color: NEUTRAL_COLORS.gray500,
  },
});
