import React from 'react';
import { View, TextInput, StyleSheet, useColorScheme, TouchableOpacity, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { useDebounce } from '../hooks/useDebounce';

export function SearchInput({
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
}) {
  const [value, setValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [showSuggestionDropdown, setShowSuggestionDropdown] = React.useState(false);
  const debouncedValue = useDebounce(value, debounceDelay);
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Show/hide suggestions based on focus, value, and suggestions array
  React.useEffect(() => {
    if (showSuggestions && isFocused && value.length > 0 && suggestions.length > 0) {
      setShowSuggestionDropdown(true);
    } else {
      setShowSuggestionDropdown(false);
    }
  }, [showSuggestions, isFocused, value, suggestions]);

  const handleClear = () => {
    setValue('');
    setShowSuggestionDropdown(false);
    if (onClear) {
      onClear();
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setValue(suggestion);
    setShowSuggestionDropdown(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay blur to allow suggestion tap to register
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  // Filter and limit suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(value.toLowerCase()) &&
      suggestion.toLowerCase() !== value.toLowerCase()
    )
    .slice(0, maxSuggestions);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={setValue}
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
}

const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      position: 'relative',
      zIndex: 1000,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 25,
      paddingHorizontal: 15,
      height: 50,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      backgroundColor: colors.card,
      borderRadius: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
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
