import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { PRIMARY, NEUTRAL_COLORS } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function FormNextButton({
  label = 'Next',
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
        {loading ? 'Loading…' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 78,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'normal',
  },
  textEnabled: {
    color: NEUTRAL_COLORS.white,
  },
  textDisabled: {
    color: NEUTRAL_COLORS.gray500,
  },
});
