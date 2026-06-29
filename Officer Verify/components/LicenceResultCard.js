import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import { borderRadius } from '../theme/borderRadius';

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function LicenceResultCard({ licence, method }) {
  if (!licence) return null;

  const photoSource =
    typeof licence.photo === 'number' ? licence.photo : { uri: licence.photo };

  return (
    <View style={styles.card}>
      {method === 'manual_lookup' ? (
        <View style={styles.methodNote}>
          <Text style={styles.methodNoteText}>Manual lookup — live QR not verified</Text>
        </View>
      ) : null}

      <View style={styles.photoWrap}>
        <Image source={photoSource} style={styles.photo} resizeMode="cover" />
      </View>

      <Text style={styles.name}>{licence.fullName}</Text>
      <Text style={styles.number}>{licence.displayNumber || licence.licenceNumber}</Text>

      <View style={styles.divider} />

      <DetailRow label="Licence code" value={licence.codeDisplay || licence.codes?.join(', ')} />
      <DetailRow label="Issue date" value={licence.issueDate} />
      <DetailRow label="Expiry date" value={licence.expiryDisplay || licence.expiryDate} />
      <DetailRow label="Status" value={String(licence.status || '').toUpperCase()} />

      {licence.restrictions?.length ? (
        <DetailRow label="Restrictions" value={licence.restrictions.join(', ')} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  methodNote: {
    backgroundColor: '#FEF9C3',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  methodNoteText: {
    ...typography.caption,
    color: '#854D0E',
    textAlign: 'center',
  },
  photoWrap: {
    alignSelf: 'center',
    width: 120,
    height: 150,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PRIMARY,
    marginBottom: spacing.md,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  name: {
    ...typography.h4,
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'center',
  },
  number: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.gray200,
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    flex: 1,
  },
  rowValue: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
    textAlign: 'right',
  },
});
