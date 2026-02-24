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
    fontWeight: '400',
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
            <View key={item.key} style={cardsStyles.cardWrap}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [cardsStyles.card, pressed && cardsStyles.cardPressed]}
              >
                <View style={cardsStyles.iconWrap}>
                  <Ionicons name={item.iconName} size={26} color={PRIMARY} />
                </View>
              </Pressable>
              <Text style={cardsStyles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
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
  cardWrap: {
    flex: 1,
    alignItems: 'center',
  },
  card: {
    alignSelf: 'stretch',
    aspectRatio: 1,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  label: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '400',
    color: NEUTRAL_COLORS.gray800,
    textAlign: 'center',
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
});

/**
 * Design 4: CoW-style tiles – white rounded card, icon on top (single colour), label centered below.
 * No top border, no icon circle; clean and uncluttered like City of Windhoek home.
 */
const COLS = 4;
const TILE_GAP = spacing.md;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function HomeSimpleTilesLayout({ items }) {
  const rows = chunk(items, COLS);
  return (
    <View style={simpleStyles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={simpleStyles.row}>
          {row.map((item) => (
            <View key={item.key} style={simpleStyles.tileWrap}>
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [simpleStyles.tile, pressed && simpleStyles.tilePressed]}
              >
                <Ionicons name={item.iconName} size={32} color={PRIMARY} />
              </Pressable>
              <Text style={simpleStyles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          ))}
          {Array.from({ length: COLS - row.length }, (_, i) => (
            <View key={`ph-${rowIndex}-${i}`} style={simpleStyles.tilePlaceholder} />
          ))}
        </View>
      ))}
    </View>
  );
}

const simpleStyles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    marginBottom: TILE_GAP,
    gap: TILE_GAP,
  },
  tileWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  tile: {
    aspectRatio: 1,
    alignSelf: 'stretch',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PRIMARY,
    shadowColor: NEUTRAL_COLORS.gray800,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tilePlaceholder: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
  },
  tilePressed: { opacity: 0.92 },
  label: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '400',
    color: NEUTRAL_COLORS.gray800,
    textAlign: 'center',
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
});

/**
 * Design 5: Topics-style layout – section title, 2-col grid of rounded cards.
 * Each card: light gray bg, icon top-left, label below (left-aligned), chevron right.
 */
export function HomeTopicsLayout({ items }) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View style={topicsStyles.container}>
      <View style={topicsStyles.header}>
        <Text style={topicsStyles.sectionTitle}>Quick access</Text>
      </View>
      <View style={topicsStyles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={topicsStyles.row}>
            {row.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={({ pressed }) => [topicsStyles.card, pressed && topicsStyles.cardPressed]}
              >
                <View style={topicsStyles.cardLeft}>
                  <View style={topicsStyles.iconWrap}>
                    <Ionicons name={item.iconName} size={24} color={PRIMARY} />
                  </View>
                  <Text style={topicsStyles.cardLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={PRIMARY} style={topicsStyles.chevron} />
              </Pressable>
            ))}
            {row.length === 1 && <View style={topicsStyles.cardPlaceholder} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const topicsStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
  },
  grid: {},
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NEUTRAL_COLORS.gray50,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  cardPressed: {
    opacity: 0.92,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  cardLeft: {
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  cardLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: NEUTRAL_COLORS.gray900,
    lineHeight: 20,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  cardPlaceholder: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
