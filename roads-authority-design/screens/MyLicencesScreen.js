import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';

// Pure front-end mock data for the NaTIS-style licence card
const MOCK_LICENCE_CARD = {
  cardNumber: '4832 7195 6604',
  cardStatusChanged: '2024-08-21',
  licenceExpiryDate: '2026-08-21',
  licenceStatus: 'Ready for collection',
};

const LICENCE_FIELDS = [
  { label: 'Card Number', key: 'cardNumber', formatter: (value) => value || '—' },
  { label: 'Card Status Changed', key: 'cardStatusChanged', formatter: formatDate },
  { label: 'Licence Expiry Date', key: 'licenceExpiryDate', formatter: formatDate },
  { label: 'Licence Status', key: 'licenceStatus', formatter: (value) => value || '—', isStatus: true },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function LicenceIntro() {
  return (
    <View style={styles.introBlock}>
      <View style={styles.introBadge}>
        <Ionicons name="id-card-outline" size={20} color={PRIMARY} />
      </View>
      <Text style={styles.introTitle}>Driving Licence Status</Text>
      <Text style={styles.introDescription}>
        View your latest driving licence card status and key card details below.
      </Text>
    </View>
  );
}

function LicenceStatusCard({ cardData }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopBar}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color={RA_YELLOW} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Driving licence status</Text>
        </View>
        <Text style={styles.cardSubheading}>Latest Driving Licence status</Text>
      </View>

      <View style={styles.fieldGroup}>
        {LICENCE_FIELDS.map((field, index) => {
          const rawValue = cardData[field.key];
          const formattedValue = field.formatter(rawValue);
          return (
            <View key={field.key}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={[styles.fieldValue, field.isStatus && styles.statusValue]}>{formattedValue}</Text>
              </View>
              {index < LICENCE_FIELDS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function MyLicencesScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <LicenceIntro />
      <LicenceStatusCard cardData={MOCK_LICENCE_CARD} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: NEUTRAL_COLORS.gray50,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  introBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  introBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  introTitle: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.xs,
  },
  introDescription: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 21,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: PRIMARY,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.35)',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  cardTopBar: {
    marginBottom: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
  },
  cardSubheading: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.92)',
  },
  fieldGroup: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.32)',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 48,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.94)',
    letterSpacing: 0.2,
  },
  fieldValue: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    fontWeight: '600',
    marginLeft: spacing.lg,
  },
  statusValue: {
    color: RA_YELLOW,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
