import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const MIN_HEIGHT = 48;

export function SearchBar({
  placeholder = 'Search the RA app',
  value,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,
  editable = true,
  accessibilityLabel = 'Search',
}) {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.wrapper, focused && styles.wrapperFocused]}>
      <Ionicons
        name="search"
        size={22}
        color={focused ? PRIMARY : NEUTRAL_COLORS.gray500}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        placeholder={placeholder}
        placeholderTextColor={NEUTRAL_COLORS.gray400}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    paddingHorizontal: spacing.lg,
    minHeight: MIN_HEIGHT,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  wrapperFocused: {
    borderColor: PRIMARY,
    backgroundColor: NEUTRAL_COLORS.gray50,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  icon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
    paddingVertical: spacing.sm,
  },
  inputDisabled: { color: NEUTRAL_COLORS.gray500 },
});
