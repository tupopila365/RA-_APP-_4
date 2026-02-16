import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const OPTIONS = [
  { key: 1, label: 'Grid' },
  { key: 2, label: 'List' },
  { key: 3, label: 'Cards' },
];

export function HomeDesignToggle({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Home layout</Text>
      <View style={styles.segmented}>
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.key;
          const isFirst = opt.key === 1;
          const isLast = opt.key === 3;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={({ pressed }) => [
                styles.option,
                isFirst && styles.optionFirst,
                isLast && styles.optionLast,
                isSelected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.gray200,
    borderRadius: 10,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  optionFirst: {},
  optionLast: {},
  optionSelected: {
    backgroundColor: NEUTRAL_COLORS.white,
    shadowColor: NEUTRAL_COLORS.gray800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
  optionText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: NEUTRAL_COLORS.gray600,
  },
  optionTextSelected: {
    color: PRIMARY,
    fontWeight: '600',
  },
});
