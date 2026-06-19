import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const MOCK_VEHICLES = [
  {
    id: '5',
    make: 'VOLKSWAGEN',
    model: 'POLO VIVO',
    licenceNumber: 'N 28017W',
    chassisNumber: 'AAVZZZ6RZJU055213',
    licenceExpiryDate: '2026-01-30',
  },
  {
    id: '6',
    make: 'MERCEDES-BENZ',
    model: 'ACTROS 2644',
    licenceNumber: 'N 71042W',
    chassisNumber: 'WDB9640322L544901',
    licenceExpiryDate: '2026-02-12',
  },
  {
    id: '7',
    make: 'ISUZU',
    model: 'NQR 500',
    licenceNumber: 'N 66458W',
    chassisNumber: 'JAAN1R75H77100364',
    licenceExpiryDate: '2026-05-09',
  },
  {
    id: '8',
    make: 'FORD',
    model: 'RANGER 3.2 TDCI',
    licenceNumber: 'N 30466W',
    chassisNumber: 'MNBUMFF50GW551287',
    licenceExpiryDate: '2026-03-28',
  },
  {
    id: '9',
    make: 'TRAILER',
    model: 'TR-9200',
    licenceNumber: 'N 8120W',
    chassisNumber: 'WMW9200118276501',
    licenceExpiryDate: '2026-01-14',
  },
  {
    id: '10',
    make: 'MAZDA',
    model: 'BT-50',
    licenceNumber: 'N 44729W',
    chassisNumber: 'MM7UR4DF100129448',
    licenceExpiryDate: '2026-04-26',
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function VehiclesDueForRenewalScreen({ onSelectVehicle }) {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Motor Vehicle Licence Renewal Notice</Text>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>The list below shows vehicles that are due for renewal.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>You may only renew a vehicle licence if you are the registered owner.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>If your motor vehicle licence has expired, it will also display in the list below.</Text>
          </View>
        </View>

        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>
            Filter using either register number, VIN / chassis number, licence number or vehicle make.
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.headerCell, styles.flex2]}>Make</Text>
            <Text style={[styles.headerCell, styles.flex2]}>Model</Text>
            <Text style={[styles.headerCell, styles.flex2]}>Licence Number</Text>
            <Text style={[styles.headerCell, styles.flex2]}>Expiry date</Text>
            <Text style={[styles.headerCell, styles.iconHeaderCell]}></Text>
          </View>
          {MOCK_VEHICLES.map((v, index) => (
            <Pressable
              key={v.id}
              onPress={() => onSelectVehicle && onSelectVehicle(v)}
              style={({ pressed }) => [
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowAlt : null,
                pressed && styles.tableRowPressed,
              ]}
            >
              <Text style={[styles.cell, styles.flex2]}>{v.make}</Text>
              <Text style={[styles.cell, styles.flex2]}>{v.model}</Text>
              <Text style={[styles.cell, styles.flex2]}>{v.licenceNumber}</Text>
              <Text style={[styles.cell, styles.flex2]}>{formatDate(v.licenceExpiryDate)}</Text>
              <View style={[styles.cell, styles.iconCell]}>
                <Ionicons name="chevron-forward" size={18} color={PRIMARY} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  noticeBox: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  noticeTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.bodySmall,
    color: PRIMARY,
    marginRight: spacing.sm,
  },
  bulletText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
    lineHeight: 20,
  },
  filterBox: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  filterLabel: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
  },
  table: {
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 0,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
  },
  headerCell: {
    ...typography.caption,
    color: NEUTRAL_COLORS.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.white,
  },
  tableRowAlt: {
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  tableRowPressed: {
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  cell: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  iconHeaderCell: {
    width: 32,
    textAlign: 'center',
  },
  iconCell: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
});

