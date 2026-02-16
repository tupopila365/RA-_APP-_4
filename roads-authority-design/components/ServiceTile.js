import React from 'react';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { DESIGN_V2_HEADER } from '../designTokens';

const PRIMARY = DESIGN_V2_HEADER.primary;
const ICON_BG_OPACITY = '20';

export function ServiceTile({ iconName, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={28} color={PRIMARY} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderTopWidth: 3,
    borderTopColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: NEUTRAL_COLORS.gray800,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  pressed: {
    opacity: 0.92,
    ...Platform.select({
      ios: { shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY + ICON_BG_OPACITY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    fontSize: 13,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray800,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
