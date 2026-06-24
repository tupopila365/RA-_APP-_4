import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuHeader } from './MenuHeader';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

/**
 * Two-column service tiles — icon bubble, title, underline, action label.
 * Shared by the home Services grid and NaTIS Services.
 */
export function ServiceMenuGrid({ items, onItemPress, headerTitle }) {
  return (
    <View style={[styles.container, !headerTitle && styles.containerNoHeader]}>
      {headerTitle ? (
        <MenuHeader title={headerTitle} style={styles.titleWrap} />
      ) : null}
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => onItemPress?.(item.key)}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <View style={styles.iconBubble}>
              <Ionicons name={item.iconName} size={30} color={PRIMARY} />
            </View>
            <Text style={styles.menuTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.menuUnderline} />
            <Text style={styles.menuAction}>{item.action}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 240,
    paddingTop: spacing.xl,
  },
  containerNoHeader: {
    paddingTop: spacing.sm,
  },
  titleWrap: {
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.xl,
    paddingTop: spacing.md,
  },
  menuItem: {
    width: '48%',
    alignItems: 'center',
  },
  menuItemPressed: {
    opacity: 0.88,
  },
  iconBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NEUTRAL_COLORS.gray800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuTitle: {
    ...typography.menuItemTitle,
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  menuUnderline: {
    width: 50,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.sm,
  },
  menuAction: {
    ...typography.menuItemAction,
    color: '#007EA4',
    marginTop: spacing.xs,
  },
});
