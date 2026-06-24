import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const MIN_HEIGHT = 44;

export function FormDropdown({
  label,
  required = false,
  placeholder = '— select —',
  options = [],
  value,
  onSelect,
  error,
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = useMemo(() => options.find((o) => o.value === value), [options, value]);
  const hasValue = !!selectedOption;
  const labelText = `${label}${required ? '*' : ''}`;
  const isFloating = open || hasValue;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.container,
          open && styles.containerFocused,
          error && styles.containerError,
        ]}
      >
        {isFloating ? (
          <Text
            style={[
              styles.floatingLabel,
              open && styles.floatingLabelFocused,
              error && styles.floatingLabelError,
            ]}
          >
            {labelText}
          </Text>
        ) : null}

        <Pressable
          style={[styles.trigger, isFloating && styles.triggerFloating]}
          onPress={() => setOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${selectedOption?.label ?? placeholder}`}
        >
          <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
            {selectedOption?.label ?? (isFloating ? placeholder : labelText)}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={open ? PRIMARY : NEUTRAL_COLORS.gray600}
          />
        </Pressable>
      </View>

      {open ? (
        <View style={styles.optionsList}>
          {options.map((item) => {
            const selected = item.value === value;
            return (
              <Pressable
                key={item.value}
                style={[styles.optionRow, selected && styles.optionSelected]}
                onPress={() => {
                  onSelect?.(item.value);
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item.label}</Text>
                {selected ? <Ionicons name="checkmark" size={22} color={NEUTRAL_COLORS.gray700} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  container: {
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray400,
    borderRadius: 6,
    backgroundColor: NEUTRAL_COLORS.white,
    minHeight: MIN_HEIGHT + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  containerFocused: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  containerError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  floatingLabel: {
    ...typography.label,
    position: 'absolute',
    top: -10,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    color: NEUTRAL_COLORS.gray500,
    zIndex: 2,
  },
  floatingLabelFocused: {
    color: PRIMARY,
  },
  floatingLabelError: {
    color: '#DC2626',
  },
  trigger: {
    minHeight: MIN_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerFloating: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  triggerText: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    textTransform: 'uppercase',
    flex: 1,
    paddingRight: spacing.sm,
  },
  placeholder: {
    textTransform: 'none',
    color: NEUTRAL_COLORS.gray500,
  },
  optionsList: {
    marginTop: spacing.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  optionRow: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  optionSelected: {
    backgroundColor: '#D9E1F2',
  },
  optionText: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray800,
    textTransform: 'uppercase',
  },
  optionTextSelected: {
    color: NEUTRAL_COLORS.gray700,
  },
  errorText: {
    ...typography.caption,
    color: '#DC2626',
    marginTop: spacing.xs,
  },
});
