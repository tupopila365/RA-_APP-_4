import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';

/**
 * TabBar - A reusable tab bar component for switching between views
 * @param {Array} tabs - Array of tab objects with {id, label, count}
 * @param {string} activeTab - The currently active tab ID
 * @param {function} onTabChange - Callback when a tab is selected
 * @param {string} testID - Test identifier
 */
export function TabBar({
  tabs = [],
  activeTab,
  onTabChange,
  testID,
  accessibilityLabel = 'Tab navigation',
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
            testID={`${testID}-${tab.id}`}
            accessibilityRole="tab"
            accessibilityLabel={`${tab.label}${tab.count !== undefined ? ` - ${tab.count}` : ''}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
              {tab.count !== undefined && ` - (${tab.count})`}
            </Text>
            {isActive && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    tabTextActive: {
      fontWeight: '700',
      color: colors.primary,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
    },
  });






