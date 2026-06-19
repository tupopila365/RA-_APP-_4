import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const defaultCardData = {
  cardNumber: 'RA-CA-2048-7781',
  cardStatusChanged: '2026-04-21',
  licenseExpiryDate: '2029-04-21',
  licenseStatus: 'ACTIVE',
};

export default function PremiumLicenseCard({ data = defaultCardData }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const rows = [
    { label: 'Card Number', value: data.cardNumber || '-' },
    { label: 'Card Status Changed', value: data.cardStatusChanged || '-' },
    { label: 'License Expiry Date', value: data.licenseExpiryDate || '-' },
    { label: 'License Status', value: data.licenseStatus || '-' },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index < rows.length - 1 ? styles.rowDivider : null]}
        >
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: '#0F172A',
      borderWidth: 1,
      borderColor: '#1E293B',
      borderRadius: 0,
      overflow: 'hidden',
    },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: 'transparent',
      borderRadius: 0,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#334155',
    },
    label: {
      fontSize: 12,
      color: '#94A3B8',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      fontWeight: '600',
    },
    value: {
      fontSize: 16,
      color: '#F8FAFC',
      fontWeight: '700',
    },
  });
