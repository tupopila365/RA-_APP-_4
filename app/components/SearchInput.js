import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, TextInput, StyleSheet, useColorScheme, TouchableOpacity, Text, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { useDebounce } from '../hooks/useDebounce';

// Memoize styles per color scheme
const stylesCache = new Map();

function getStyles(colors) {
  const cacheKey = `${colors.primary}-${colors.text}-${colors.border}`;
  if (stylesCache.has(cacheKey)) {
    return stylesCache.get(cacheKey);
  }

  const styles = StyleSheet.create({
    wrapper: {
      position: 'relative',
      zIndex: 1000,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 52,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    clearButton: {
      padding: 5,
    },
    suggestionsContainer: {
      position: 'absolute',
      top: 55,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
      maxHeight: 200,
      zIndex: 1001,
    },
    suggestionsList: {
      flex: 1,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastSuggestionItem: {
      borderBottomWidth: 0,
    },
    suggestionItemPressed: {
      backgroundColor: colors.primary,
    },
    suggestionIcon: {
      marginRight: 10,
    },
    suggestionText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
  });

  stylesCache.set(cacheKey, styles);
  return styles;
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
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => getStyles(colors), [colors.primary, colors.text, colors.border]);
  
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
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />
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
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
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
          >
            {filteredSuggestions.map((suggestion, index) => (
              <Pressable
                key={`${suggestion}-${index}`}
                style={({ pressed }) => [
                  styles.suggestionItem,
                  pressed && styles.suggestionItemPressed,
                  index === filteredSuggestions.length - 1 && styles.lastSuggestionItem
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
                testID={`suggestion-${index}`}
                accessible={true}
                accessibilityLabel={`Suggestion: ${suggestion}`}
                accessibilityRole="button"
              >
                <Ionicons 
                  name="search" 
                  size={16} 
                  color={colors.textSecondary} 
                  style={styles.suggestionIcon} 
                />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});
