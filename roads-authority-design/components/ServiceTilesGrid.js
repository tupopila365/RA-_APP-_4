import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuHeader } from './MenuHeader';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const COLS = 4;
const TILE_GAP = spacing.md;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Four-column service tiles — white square card, icon inside, label below.
 * Same layout as the homepage "Tiles" design.
 */
export function ServiceTilesGrid({ items, onItemPress, headerTitle }) {
  const rows = chunk(items, COLS);

  return (
    <View style={[styles.container, !headerTitle && styles.containerNoHeader]}>
      {headerTitle ? (
        <MenuHeader title={headerTitle} style={styles.titleWrap} />
      ) : null}
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((item) => (
              <View key={item.key} style={styles.tileWrap}>
                <Pressable
                  onPress={() => onItemPress?.(item.key)}
                  style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Ionicons name={item.iconName} size={32} color={PRIMARY} />
                </Pressable>
                <Text style={styles.label} numberOfLines={2}>
                  {item.label}
                </Text>
                {item.action ? (
                  <>
                    <View style={styles.underline} />
                    <Text style={styles.action}>{item.action}</Text>
                  </>
                ) : null}
              </View>
            ))}
            {Array.from({ length: COLS - row.length }, (_, i) => (
              <View key={`ph-${rowIndex}-${i}`} style={styles.tilePlaceholder} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
  },
  containerNoHeader: {
    paddingTop: spacing.sm,
  },
  titleWrap: {
    marginBottom: spacing.lg,
  },
  grid: {},
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
  tilePressed: {
    opacity: 0.92,
  },
  label: {
    ...typography.menuItemTitle,
    fontSize: 13,
    lineHeight: 18,
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
    marginTop: spacing.xs,
    letterSpacing: 0.1,
  },
  underline: {
    width: 36,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.xs,
  },
  action: {
    ...typography.menuItemAction,
    fontSize: 11,
    lineHeight: 16,
    color: '#007EA4',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
