import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';

const MIN_HEIGHT = 48;
const SEARCH_BUTTON_WIDTH = 52;
const INPUT_BORDER_COLOR = RA_YELLOW;

export function SearchBar({
  placeholder = 'Search the RA app',
  value,
  onChangeText,
  onSubmitEditing,
  onSearchPress,
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

  const handleSearchButtonPress = () => {
    onSearchPress?.();
    onSubmitEditing?.();
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
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
      <Pressable
        style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}
        onPress={handleSearchButtonPress}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Ionicons name="search" size={22} color={NEUTRAL_COLORS.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: MIN_HEIGHT,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: INPUT_BORDER_COLOR,
    borderRadius: 0,
    paddingHorizontal: spacing.md,
  },
  inputWrapFocused: {
    borderWidth: 2,
    borderRightWidth: 0,
    borderColor: RA_YELLOW,
    backgroundColor: NEUTRAL_COLORS.gray50,
    ...Platform.select({
      ios: {
        shadowColor: RA_YELLOW,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  inputDisabled: { color: NEUTRAL_COLORS.gray500 },
  searchButton: {
    width: SEARCH_BUTTON_WIDTH,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  searchButtonPressed: {
    opacity: 0.9,
  },
});
