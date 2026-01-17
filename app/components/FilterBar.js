import React from 'react';
import { ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { FilterChip } from './FilterChip';
import { RATheme } from '../theme/colors';

/**
 * FilterBar - A reusable horizontal scrollable filter bar component
 * @param {Array} filters - Array of filter objects with {label, value} or array of strings
 * @param {string|number} selectedFilter - The currently selected filter value
 * @param {function} onFilterChange - Callback when a filter is selected
 * @param {string} testID - Test identifier
 */
export function FilterBar({
  filters = [],
  selectedFilter,
  onFilterChange,
  testID,
  accessibilityLabel = 'Filter options',
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  // Normalize filters to always have {label, value} format
  const normalizedFilters = filters.map((filter) => {
    if (typeof filter === 'string') {
      return { label: filter, value: filter };
    }
    return filter;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {normalizedFilters.map((filter) => {
        const isSelected = selectedFilter === filter.value;
        return (
          <FilterChip
            key={filter.value}
            label={filter.label}
            selected={isSelected}
            onPress={() => onFilterChange(filter.value)}
            testID={`${testID}-${filter.value}`}
            accessibilityLabel={`Filter by ${filter.label}`}
          />
        );
      })}
    </ScrollView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      maxHeight: 50,
      marginBottom: 5,
    },
    content: {
      paddingHorizontal: 15,
      paddingVertical: 5,
    },
  });























