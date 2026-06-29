import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { VehicleStatusBadge } from '../components/ProfileShared';
import { REGISTERED_VEHICLES } from '../data/registeredVehicles';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

function formatExpiryDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function VehicleRow({ vehicle, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.vehicleRow, pressed && styles.vehicleRowPressed]}
      onPress={() => onPress?.(vehicle)}
    >
      <View style={styles.vehicleIconWrap}>
        <Ionicons name="car-outline" size={20} color={PRIMARY} />
      </View>
      <View style={styles.vehicleCopy}>
        <Text style={styles.vehicleTitle} numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text style={styles.vehicleMeta} numberOfLines={1}>
          {vehicle.licenceNumber} · Expires {formatExpiryDate(vehicle.licenceExpiryDate)}
        </Text>
      </View>
      <VehicleStatusBadge status={vehicle.status} />
      <Ionicons name="chevron-forward" size={18} color={NEUTRAL_COLORS.gray400} style={styles.chevron} />
    </Pressable>
  );
}

export function RegisteredVehiclesScreen({ onSelectVehicle, onRenewVehicle }) {
  const vehicles = REGISTERED_VEHICLES;

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      {vehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={32} color={NEUTRAL_COLORS.gray400} />
          <Text style={styles.emptyTitle}>No registered vehicles</Text>
          <Text style={styles.emptyCaption}>
            Vehicles linked to your ID will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {vehicles.map((vehicle, index) => (
            <View key={vehicle.id}>
              <VehicleRow vehicle={vehicle} onPress={onSelectVehicle} />
              {index < vehicles.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      )}

      {vehicles.some((v) => v.status === 'due-soon' || v.status === 'expired') ? (
        <Pressable style={styles.renewLink} onPress={onRenewVehicle}>
          <Ionicons name="refresh-circle-outline" size={18} color={PRIMARY} />
          <Text style={styles.renewLinkText}>Renew a vehicle licence disc</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  vehicleRowPressed: {
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  vehicleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCopy: {
    flex: 1,
    minWidth: 0,
  },
  vehicleTitle: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    fontSize: 14,
  },
  vehicleMeta: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: 2,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
  emptyState: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
  },
  emptyCaption: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    textAlign: 'center',
  },
  renewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  renewLinkText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
});
