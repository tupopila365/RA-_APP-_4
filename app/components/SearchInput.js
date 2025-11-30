import React from 'react';
import { View, TextInput, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
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
}) {
  const [value, setValue] = React.useState('');
  const debouncedValue = useDebounce(value, debounceDelay);
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={setValue}
        testID={testID}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="search"
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
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 25,
      paddingHorizontal: 15,
      height: 50,
      shadowColor: '#000',
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
  });
