import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { DESIGN_V2_HEADER } from '../designTokens';
import { InfoCard } from './InfoCard';

const CELL_SIZE = 56;
const COLORS = ['#7C3AED', '#F59E0B', '#DC2626', '#7C3AED', '#059669'];

export function IconGridCard({ title = 'Values', items = [] }) {
  return (
    <InfoCard title={title}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {items.map((item, index) => (
            <View key={item.key || index} style={styles.cell}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: item.color || COLORS[index % COLORS.length] },
                ]}
              >
                <Ionicons name={item.iconName} size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </InfoCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  cell: {
    alignItems: 'center',
    minWidth: 72,
  },
  iconWrap: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    textAlign: 'center',
  },
});
