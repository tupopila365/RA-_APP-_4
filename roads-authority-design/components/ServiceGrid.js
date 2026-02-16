import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { ServiceTile } from './ServiceTile';

const COLS = 3;
const GAP = spacing.md;

/** Equal-width cells so every menu box is the same size. */
const styles = StyleSheet.create({
  grid: {},
  row: {
    flexDirection: 'row',
    marginBottom: GAP,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: GAP / 2,
    aspectRatio: 1,
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
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, index) => (
            <View key={item.key || `${rowIndex}-${index}`} style={styles.cell}>
              <ServiceTile
                iconName={item.iconName}
                label={item.label}
                onPress={item.onPress}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

