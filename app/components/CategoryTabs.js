import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

/**
 * CategoryTabs - Horizontal scrollable tab bar for filtering content
 * Used in the Executive Dashboard for Government Services filtering
 */
export function CategoryTabs({ categories, selectedCategory, onSelectCategory, style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.7}
              style={[styles.tab, isSelected && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={category.label}
            >
              {category.icon && (
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={styles.tabIcon}
                />
              )}
              <Text
                style={[styles.tabText, isSelected && styles.tabTextActive]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      paddingHorizontal: spacing.xs,
      gap: spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 36,
    },
    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabIcon: {
      marginRight: spacing.xs,
    },
    tabText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
