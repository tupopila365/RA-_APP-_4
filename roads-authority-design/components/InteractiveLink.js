import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { PRIMARY } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function InteractiveLink({
  label,
  onPress,
  highlightOnInteract = false,
  style,
  textStyle,
  disabled = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed, hovered }) => [
        styles.base,
        highlightOnInteract && (pressed || hovered) && styles.highlight,
        (pressed || hovered) && styles.interacting,
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed, hovered }) => (
        <Text
          style={[
            styles.text,
            (pressed || hovered) && styles.textInteracting,
            disabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  interacting: {
    opacity: 0.95,
  },
  highlight: {
    backgroundColor: '#DDE7EF',
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '600',
  },
  textInteracting: {
    color: '#0098C4',
  },
  disabled: {
    opacity: 0.55,
  },
  textDisabled: {
    color: '#7FB3C4',
  },
});
