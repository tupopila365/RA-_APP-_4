import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { spacing } from '../theme/spacing';
import { ServiceTile } from './ServiceTile';

const COLS = 4;
const GAP = spacing.md;

/** Content width: screen minus container horizontal padding (spacing.lg each side). */
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_PADDING = spacing.lg * 2;
const CONTENT_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING;
const CELL_SIZE = (CONTENT_WIDTH - (COLS - 1) * GAP) / COLS;

/** Tile is square (icon only); label sits below outside the tile. */
const styles = StyleSheet.create({
  grid: {},
  row: {
    flexDirection: 'row',
    marginBottom: GAP,
    gap: GAP,
  },
  cell: {
    width: CELL_SIZE,
    flex: 0,
  },
});

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function ServiceGrid({ items = [] }) {
  const rows = chunk(items, COLS);
  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => {
        const cells = [];
        for (let i = 0; i < COLS; i++) {
          const item = row[i];
          cells.push(
            <View key={item ? item.key : `empty-${rowIndex}-${i}`} style={styles.cell}>
              {item ? (
                <ServiceTile
                  iconName={item.iconName}
                  label={item.label}
                  onPress={item.onPress}
                />
              ) : null}
            </View>
          );
        }
        return <View key={rowIndex} style={styles.row}>{cells}</View>;
      })}
    </View>
  );
}

