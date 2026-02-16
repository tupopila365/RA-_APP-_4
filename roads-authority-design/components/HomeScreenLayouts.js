import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceGrid } from './ServiceGrid';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

/**
 * Design 1: 3-column grid of tiles (current default).
 */
export function HomeGridLayout({ items }) {
  return <ServiceGrid items={items} />;
}

/**
 * Design 2: Single-column list – full-width rows, icon left, label, chevron.
 * Completely different from the grid.
 */
export function HomeListLayout({ items }) {
  return (
    <View style={listStyles.container}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={({ pressed }) => [listStyles.row, pressed && listStyles.rowPressed]}
        >
          <View style={listStyles.iconWrap}>
            <Ionicons name={item.iconName} size={24} color={PRIMARY} />
          </View>
          <Text style={listStyles.label} numberOfLines={1}>
            {item.label}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={NEUTRAL_COLORS.gray400} />
        </Pressable>
      ))}
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  rowPressed: { backgroundColor: NEUTRAL_COLORS.gray50 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  label: {
    flex: 1,
    ...typography.body,
    fontWeight: '500',
    color: NEUTRAL_COLORS.gray900,
  },
});

/**
 * Design 3: 2-column compact cards – small tiles, no top border, soft shadow.
 * Visually distinct from both grid and list.
 */
export function HomeCardsLayout({ items }) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View style={cardsStyles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={cardsStyles.row}>
          {row.map((item) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={({ pressed }) => [cardsStyles.card, pressed && cardsStyles.cardPressed]}
            >
              <View style={cardsStyles.iconWrap}>
                <Ionicons name={item.iconName} size={26} color={PRIMARY} />
              </View>
              <Text style={cardsStyles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          ))}
          {row.length === 1 && <View style={cardsStyles.cardPlaceholder} />}
        </View>
      ))}
    </View>
  );
}

const cardsStyles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    shadowColor: NEUTRAL_COLORS.gray800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.9 },
  cardPlaceholder: { flex: 1, marginLeft: spacing.md },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: NEUTRAL_COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray800,
    textAlign: 'center',
  },
});
