import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useDebounce } from '../hooks/useDebounce';
import { spacing } from '../theme/spacing';

const MIN_TOUCH_SIZE = 44;

function getStyles(colors, isFocused) {
  return StyleSheet.create({
    wrapper: {
      position: 'relative',
      zIndex: 1000,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      minHeight: MIN_TOUCH_SIZE,
      borderWidth: 2,
      borderColor: isFocused ? colors.primary : colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    iconWrap: {
      width: 20,
      height: 20,
      marginRight: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: spacing.md,
      ...Platform.select({
        ios: { paddingVertical: spacing.sm },
      }),
    },
    clearButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      marginRight: -spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    suggestionsContainer: {
      position: 'absolute',
      top: MIN_TOUCH_SIZE + spacing.sm,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
      maxHeight: 280,
      zIndex: 1001,
    },
    suggestionsList: {
      flexGrow: 0,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastSuggestionItem: {
      borderBottomWidth: 0,
    },
    suggestionItemPressed: {
      backgroundColor: colors.primary + '12',
    },
    suggestionIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    suggestionText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      lineHeight: 20,
    },
  });
}

export const SearchInput = React.memo(function SearchInput({
  placeholder = 'Search...',
  onSearch,
  onClear,
  debounceDelay = 500,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  suggestions = [], // Array of suggestion strings
  showSuggestions = false, // Control visibility of suggestions
  onSuggestionSelect, // Callback when a suggestion is selected
  maxSuggestions = 5, // Maximum number of suggestions to show
  value: controlledValue, // Optional controlled value
  defaultValue = '', // Default for uncontrolled usage
  onChangeTextImmediate, // Callback fired on every keystroke (before debounce)
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const debouncedValue = useDebounce(value, debounceDelay);
  const { colors } = useTheme();

  // Memoize styles — update on focus for border state
  const styles = useMemo(() => getStyles(colors, isFocused), [colors, isFocused]);
  
  // Memoize the search callback to prevent unnecessary re-renders
  const memoizedOnSearch = useRef(onSearch);
  useEffect(() => {
    memoizedOnSearch.current = onSearch;
  }, [onSearch]);

  // Keep internal value in sync when defaultValue changes (uncontrolled only)
  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, isControlled]);

  useEffect(() => {
    if (memoizedOnSearch.current) {
      memoizedOnSearch.current(debouncedValue);
    }
  }, [debouncedValue]);

  // Memoize filtered suggestions to avoid recalculating on every render
  const filteredSuggestions = useMemo(() => {
    if (!value || value.length === 0) return [];
    
    const lowerValue = value.toLowerCase();
    return suggestions
      .filter(suggestion => {
        const lowerSuggestion = suggestion.toLowerCase();
        return lowerSuggestion.includes(lowerValue) && lowerSuggestion !== lowerValue;
      })
      .slice(0, maxSuggestions);
  }, [suggestions, value, maxSuggestions]);

  // Show/hide suggestions based on focus, value, and suggestions array
  useEffect(() => {
    if (showSuggestions && isFocused && value.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestionDropdown(true);
    } else {
      setShowSuggestionDropdown(false);
    }
  }, [showSuggestions, isFocused, value, filteredSuggestions.length]);

  const handleChangeText = useCallback(
    (text) => {
      if (!isControlled) {
        setInternalValue(text);
      }
      if (onChangeTextImmediate) {
        onChangeTextImmediate(text);
      }
    },
    [isControlled, onChangeTextImmediate]
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    setShowSuggestionDropdown(false);
    if (onChangeTextImmediate) {
      onChangeTextImmediate('');
    }
    if (onClear) {
      onClear();
    }
  }, [isControlled, onClear, onChangeTextImmediate]);

  const handleSuggestionPress = useCallback((suggestion) => {
    if (!isControlled) {
      setInternalValue(suggestion);
    }
    setShowSuggestionDropdown(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    if (onChangeTextImmediate) {
      onChangeTextImmediate(suggestion);
    }
    if (memoizedOnSearch.current) {
      memoizedOnSearch.current(suggestion);
    }
  }, [isControlled, onSuggestionSelect, onChangeTextImmediate]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const blurTimeoutRef = useRef(null);
  const handleBlur = useCallback(() => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Delay blur to allow suggestion tap to register
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 200);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value && value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            testID="search-clear-button"
            accessible={true}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestionDropdown && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={true}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <Pressable
                key={`${suggestion}-${index}`}
                style={({ pressed }) => [
                  styles.suggestionItem,
                  pressed && styles.suggestionItemPressed,
                  index === filteredSuggestions.length - 1 && styles.lastSuggestionItem,
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
                testID={`suggestion-${index}`}
                accessible={true}
                accessibilityLabel={`Suggestion: ${suggestion}`}
                accessibilityRole="button"
              >
                <View style={styles.suggestionIconWrap}>
                  <Ionicons name="search" size={18} color={colors.primary} />
                </View>
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {suggestion}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});
