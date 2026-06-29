import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { PRIMARY, NEUTRAL_COLORS } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function PrimaryButton({ label, onPress, enabled = true, loading = false, style }) {
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
      <Text style={[styles.text, enabled ? styles.textEnabled : styles.textDisabled]}>
        {loading ? 'Please wait…' : label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed, style]}
    >
      <Text style={styles.secondaryText}>{label}</Text>
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
  },
  enabled: {
    backgroundColor: PRIMARY,
  },
  disabled: {
    backgroundColor: NEUTRAL_COLORS.gray300,
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
  secondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    marginTop: spacing.sm,
  },
  secondaryText: {
    ...typography.button,
    color: PRIMARY,
  },
});
