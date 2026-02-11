import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

/**
 * FilterDropdownBox - Pill-shaped filter box with dropdown selection
 *
 * Design matches reference:
 * - White background with subtle light gray border
 * - Soft drop shadow
 * - Pill/capsule shape (highly rounded)
 * - Displays placeholder when empty, selected value when chosen
 * - Small 'x' on right to clear selection
 * - Tap to open dropdown
 */
export function FilterDropdownBox({
  label,
  placeholder,
  value,
  options,
  onSelect,
  onClear,
  /** When value is null, this option is shown as selected in the dropdown (e.g. "All", "All Regions") */
  nullMapsToOption,
  testID,
  accessibilityLabel,
}) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const displayText = value || placeholder;
  const hasValue = !!value;

  const handleSelect = (option) => {
    onSelect(option);
    setDropdownVisible(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation?.();
    onClear?.();
    setDropdownVisible(false);
  };

  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => setDropdownVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel || `${label}: ${displayText}`}
        accessibilityState={{ expanded: dropdownVisible }}
        accessibilityHint="Double tap to open options"
        testID={testID}
      >
        <Text
          style={[styles.displayText, !hasValue && styles.placeholderText]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={hasValue ? handleClear : undefined}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={hasValue ? 'Clear selection' : undefined}
          accessible={hasValue}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={hasValue ? colors.textSecondary : 'rgba(128,128,128,0.3)'}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDropdownVisible(false)}
          />
          <View
            style={[styles.dropdownCard, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => {
                const isSelected = value === item || (value == null && item === nullMapsToOption);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: colors.border },
                      isSelected && { backgroundColor: colors.primary + '15' },
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        isSelected && { color: colors.primary, fontWeight: '600' },
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.optionList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors, isDark) {
  const boxBg = isDark ? colors.cardBackground : '#FFFFFF';
  const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.12)';

  return StyleSheet.create({
    wrapper: {
      flex: 1,
      minWidth: 0,
    },
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: boxBg,
      borderWidth: 1,
      borderColor,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
      ...shadows.sm,
    },
    displayText: {
      ...typography.body,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontWeight: '400',
    },
    clearButton: {
      marginLeft: 8,
      padding: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
      position: 'relative',
    },
    dropdownCard: {
      borderRadius: 12,
      padding: 16,
      maxHeight: 320,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    modalTitle: {
      ...typography.subtitle,
      fontWeight: '600',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    optionList: {
      maxHeight: 260,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
    },
    optionText: {
      ...typography.body,
    },
  });
}

