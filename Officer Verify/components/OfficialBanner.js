import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, OFFICER_HEADER, RA_YELLOW } from '../theme/colors';

export function OfficialBanner({ subtitle }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <Ionicons name="shield-checkmark" size={16} color={RA_YELLOW} />
        <Text style={styles.title}>OFFICIAL USE ONLY</Text>
      </View>
      <Text style={styles.subtitle}>
        {subtitle || 'Authorised personnel — Roads Authority verifier prototype'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: OFFICER_HEADER,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 3,
    borderBottomColor: RA_YELLOW,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.label,
    color: NEUTRAL_COLORS.white,
    letterSpacing: 1,
  },
  subtitle: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray300,
    marginTop: spacing.xs,
  },
});
