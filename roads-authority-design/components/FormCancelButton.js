import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function FormCancelButton({ label = 'Cancel', onPress, style, textStyle }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    minWidth: 88,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray400,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    ...typography.button,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'normal',
  },
});
