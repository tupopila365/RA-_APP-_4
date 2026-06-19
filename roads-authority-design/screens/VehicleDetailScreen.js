import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

const DEFAULT_MOCK_VEHICLE = {
  make: 'TOYOTA',
  model: 'HILUX 2.8 GD-6',
  licenceNumber: 'N 94821W',
  chassisNumber: 'AHTBA3CD907441562',
  licenceExpiryDate: '2026-03-15',
};

export function VehicleDetailScreen({ vehicle }) {
  const displayVehicle = vehicle || DEFAULT_MOCK_VEHICLE;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Vehicle details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Make</Text>
          <Text style={styles.value}>{displayVehicle.make}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Model</Text>
          <Text style={styles.value}>{displayVehicle.model}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Licence number</Text>
          <Text style={styles.value}>{displayVehicle.licenceNumber}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Chassis / VIN</Text>
          <Text style={[styles.value, styles.multiline]}>{displayVehicle.chassisNumber}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Licence expiry date</Text>
          <Text style={styles.value}>{displayVehicle.licenceExpiryDate}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    flex: 1,
    marginRight: spacing.lg,
  },
  value: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    flex: 1.4,
    textAlign: 'right',
  },
  multiline: {
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
});

