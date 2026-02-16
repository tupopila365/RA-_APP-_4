import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

export function DropdownSelector({
  label,
  required,
  placeholder = '— select —',
  options = [],
  value,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${displayText}`}
      >
        <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color={NEUTRAL_COLORS.gray500} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray300,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  triggerText: {
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
  },
  placeholder: {
    color: NEUTRAL_COLORS.gray400,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 8,
    maxHeight: 320,
  },
  option: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  optionText: {
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
  },
});
