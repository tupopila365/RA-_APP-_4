import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Text, 
  ScrollView, 
  Pressable, 
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useDebounce } from '../hooks/useDebounce';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';

/**
 * Search Input Component - Bank-grade, Government-ready
 * 
 * Redesigned following Apple Human Interface Guidelines:
 * - 48pt minimum height for comfortable touch target
 * - 12pt corner radius matching design system
 * - Smooth focus animation
 * - Accessible suggestions dropdown
 * - Debounced search for performance
 * 
 * @example
 * <SearchInput
 *   placeholder="Search applications..."
 *   onSearch={handleSearch}
 *   suggestions={recentSearches}
 *   showSuggestions
 * />
 */

const MIN_TOUCH_SIZE = 48;

function getStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      position: 'relative',
      zIndex: 1000,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: borderRadius.lg, // 12pt - consistent with form inputs
      paddingHorizontal: spacing.lg, // 16pt
      minHeight: MIN_TOUCH_SIZE,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    containerFocused: {
      borderColor: colors.inputBorderFocus,
      borderWidth: 2,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    iconWrap: {
      width: 24,
      height: 24,
      marginRight: spacing.md, // 12pt
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      lineHeight: 22,
      paddingVertical: spacing.md, // 12pt
      ...Platform.select({
        ios: { 
          fontFamily: 'System',
          paddingVertical: spacing.sm + 2, // 10pt for iOS
        },
        android: { 
          fontFamily: 'Roboto',
        },
      }),
    },
    clearButton: {
      width: MIN_TOUCH_SIZE,
      height: MIN_TOUCH_SIZE,
      marginRight: -spacing.md, // -12pt to align with container edge
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Suggestions dropdown
    suggestionsContainer: {
      position: 'absolute',
      top: MIN_TOUCH_SIZE + spacing.sm, // 8pt gap
      left: 0,
      right: 0,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg, // 12pt
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
      maxHeight: 300,
      zIndex: 1001,
    },
    suggestionsList: {
      flexGrow: 0,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52, // Comfortable touch target
      paddingVertical: spacing.md, // 12pt
      paddingHorizontal: spacing.lg, // 16pt
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    lastSuggestionItem: {
      borderBottomWidth: 0,
    },
    suggestionItemPressed: {
      backgroundColor: colors.backgroundSecondary,
    },
    suggestionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md, // 8pt
      backgroundColor: colors.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md, // 12pt
    },
    suggestionTextContainer: {
      flex: 1,
    },
    suggestionText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      lineHeight: 20,
    },
    suggestionSubtext: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      marginTop: 2,
    },
    chevronIcon: {
      marginLeft: spacing.sm, // 8pt
    },
    // Empty state
    emptyState: {
      paddingVertical: spacing.xl, // 20pt
      paddingHorizontal: spacing.lg, // 16pt
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
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
  suggestions = [], // Array of suggestion strings or objects { text, subtext }
  showSuggestions = false, // Control visibility of suggestions
  onSuggestionSelect, // Callback when a suggestion is selected
  maxSuggestions = 5, // Maximum number of suggestions to show
  value: controlledValue, // Optional controlled value
  defaultValue = '', // Default for uncontrolled usage
  onChangeTextImmediate, // Callback fired on every keystroke (before debounce)
  emptyStateText = 'No results found', // Text to show when no suggestions match
  showEmptyState = false, // Show empty state when no matches
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const debouncedValue = useDebounce(value, debounceDelay);
  const { colors } = useTheme();
  const inputRef = useRef(null);

  // Memoize styles
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  // Animation for focus state
  const focusAnim = useRef(new Animated.Value(0)).current;
  
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
        const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
        const lowerSuggestion = text.toLowerCase();
        return lowerSuggestion.includes(lowerValue) && lowerSuggestion !== lowerValue;
      })
      .slice(0, maxSuggestions);
  }, [suggestions, value, maxSuggestions]);

  // Show/hide suggestions based on focus, value, and suggestions array
  useEffect(() => {
    const hasMatches = filteredSuggestions.length > 0;
    const shouldShowEmpty = showEmptyState && value.length > 0 && !hasMatches;
    
    if (showSuggestions && isFocused && value.length > 0 && (hasMatches || shouldShowEmpty)) {
      setShowSuggestionDropdown(true);
    } else {
      setShowSuggestionDropdown(false);
    }
  }, [showSuggestions, isFocused, value, filteredSuggestions.length, showEmptyState]);

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
    // Refocus input after clear
    inputRef.current?.focus();
  }, [isControlled, onClear, onChangeTextImmediate]);

  const handleSuggestionPress = useCallback((suggestion) => {
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    
    if (!isControlled) {
      setInternalValue(text);
    }
    setShowSuggestionDropdown(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    if (onChangeTextImmediate) {
      onChangeTextImmediate(text);
    }
    if (memoizedOnSearch.current) {
      memoizedOnSearch.current(text);
    }
  }, [isControlled, onSuggestionSelect, onChangeTextImmediate]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      speed: 20,
      bounciness: 0,
    }).start();
  }, [focusAnim]);

  const blurTimeoutRef = useRef(null);
  const handleBlur = useCallback(() => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Delay blur to allow suggestion tap to register
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      Animated.spring(focusAnim, {
        toValue: 0,
        useNativeDriver: false,
        speed: 20,
        bounciness: 0,
      }).start();
    }, 200);
  }, [focusAnim]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Icon color based on focus state
  const iconColor = isFocused ? colors.primary : colors.textSecondary;

  return (
    <View style={[styles.wrapper, style]}>
      {/* Search input container */}
      <View style={[
        styles.container,
        isFocused && styles.containerFocused,
      ]}>
        <View style={styles.iconWrap}>
          <Ionicons name="search" size={20} color={iconColor} />
        </View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          accessible={true}
          accessibilityLabel={accessibilityLabel || placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityRole="search"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never" // We use custom clear button
          maxFontSizeMultiplier={1.3}
        />
        {value && value.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            testID="search-clear-button"
            accessible={true}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {showSuggestionDropdown && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={true}
            >
              {filteredSuggestions.map((suggestion, index) => {
                const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
                const subtext = typeof suggestion === 'object' ? suggestion.subtext : null;
                
                return (
                  <Pressable
                    key={`${text}-${index}`}
                    style={({ pressed }) => [
                      styles.suggestionItem,
                      pressed && styles.suggestionItemPressed,
                      index === filteredSuggestions.length - 1 && styles.lastSuggestionItem,
                    ]}
                    onPress={() => handleSuggestionPress(suggestion)}
                    testID={`suggestion-${index}`}
                    accessible={true}
                    accessibilityLabel={`Suggestion: ${text}`}
                    accessibilityRole="button"
                  >
                    <View style={styles.suggestionIconWrap}>
                      <Ionicons name="search" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionText} numberOfLines={1}>
                        {text}
                      </Text>
                      {subtext && (
                        <Text style={styles.suggestionSubtext} numberOfLines={1}>
                          {subtext}
                        </Text>
                      )}
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={colors.textSecondary}
                      style={styles.chevronIcon}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : showEmptyState && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>{emptyStateText}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});
