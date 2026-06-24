import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

export function MenuHeader({ title, style, titleStyle }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
  },
  underline: {
    width: 62,
    height: 4,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.sm,
  },
});
