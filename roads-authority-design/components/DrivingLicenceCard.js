import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';
import { CoatOfArms } from './CoatOfArms';
import {
  buildVerificationPayload,
  getRemainingSeconds,
  serializeVerificationPayload,
} from '../services/licenceVerificationService';

const LICENCE = {
  licenceNumber: 'NAM 879912 PE84',
  firstName: 'Peter',
  lastName: 'Kyle',
  age: 'Over 18',
  expiryDate: '21 August 2026',
  code: 'B',
};

const DETAIL_FIELDS = [
  { label: 'Card Number', value: '4832 7195 6604' },
  { label: 'Card Status Changed', value: '21 Aug 2024' },
  { label: 'Licence Expiry Date', value: '21 Aug 2026' },
  { label: 'Licence Status', value: 'Ready for collection' },
  { label: 'Licence Code', value: 'B' },
];

function RaLogo({ size = 44, style }) {
  return (
    <Image
      source={require('../assets/ra logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="Roads Authority logo"
    />
  );
}

function Field({ label, value, compact = false }) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function DrivingLicenceCard() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [verificationPayload, setVerificationPayload] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const qrValue = useMemo(
    () => (verificationPayload ? serializeVerificationPayload(verificationPayload) : ''),
    [verificationPayload]
  );

  const generateQr = useCallback(() => {
    const payload = buildVerificationPayload(LICENCE);
    setVerificationPayload(payload);
    setRemainingSeconds(getRemainingSeconds(payload.exp));
    setQrVisible(true);
  }, []);

  useEffect(() => {
    if (!qrVisible || !verificationPayload) return undefined;

    const tick = () => {
      const seconds = getRemainingSeconds(verificationPayload.exp);
      setRemainingSeconds(seconds);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [qrVisible, verificationPayload]);

  const qrExpired = remainingSeconds <= 0;

  return (
    <View style={styles.card}>

      <View style={styles.cardHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerCoatOfArms}>
            <CoatOfArms size={38} />
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.cardHeaderEyebrow}>Republic of Namibia</Text>
            <Text style={styles.cardHeaderText}>Namibian driving licence</Text>
          </View>
          <Image
            source={require('../assets/Flag_of_Namibia.svg.png')}
            style={styles.headerFlag}
            resizeMode="cover"
            accessibilityLabel="Namibia flag"
          />
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.licencePlate}>
          <View style={styles.licenceNumberBlock}>
            <Text style={styles.fieldLabel}>Licence number</Text>
            <Text style={styles.licenceNumber}>{LICENCE.licenceNumber}</Text>
          </View>
          <View style={styles.validChip}>
            <Ionicons name="shield-checkmark" size={14} color={PRIMARY} />
            <Text style={styles.validChipText}>Valid</Text>
          </View>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.photoFrame}>
            <Image
              source={require('../assets/passport.jpg')}
              style={styles.photo}
              resizeMode="cover"
              accessibilityLabel="Licence holder photo"
            />
          </View>
          <View style={styles.mainFields}>
            <View style={styles.fieldCard}>
              <Field label="First name" value={LICENCE.firstName} compact />
            </View>
            <View style={styles.fieldCard}>
              <Field label="Last name" value={LICENCE.lastName} compact />
            </View>
          </View>
        </View>

        <View style={styles.bottomFields}>
          <View style={[styles.fieldCard, styles.halfField]}>
            <Field label="Age" value={LICENCE.age} compact />
          </View>
          <View style={[styles.fieldCard, styles.halfField]}>
            <Field label="Date of expiry" value={LICENCE.expiryDate} compact />
          </View>
        </View>

        <View style={styles.divider} />

        <Pressable
          style={styles.detailsToggle}
          onPress={() => setDetailsOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={detailsOpen ? 'Hide details' : 'Show details'}
        >
          <View style={styles.detailsIconWrap}>
            <Ionicons
              name={detailsOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={NEUTRAL_COLORS.white}
            />
          </View>
          <Text style={styles.detailsToggleText}>
            {detailsOpen ? 'Hide details' : 'Show details'}
          </Text>
        </Pressable>

        {detailsOpen ? (
          <View style={styles.detailsBlock}>
            {DETAIL_FIELDS.map((field, index) => (
              <View key={field.label}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{field.label}</Text>
                  <Text style={styles.detailValue}>{field.value}</Text>
                </View>
                {index < DETAIL_FIELDS.length - 1 ? <View style={styles.detailDivider} /> : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footerDivider} />

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <RaLogo size={44} />
            <View style={styles.footerMeta}>
              <Text style={styles.footerTitle}>NaTIS</Text>
              <Text style={styles.footerSubtitle}>Roads Authority Namibia</Text>
            </View>
          </View>
          <View style={styles.hologram}>
            <CoatOfArms size={30} />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.officerLink, pressed && styles.officerLinkPressed]}
          onPress={generateQr}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Generate QR code for official traffic officer verification"
        >
          <Ionicons name="lock-closed" size={12} color={NEUTRAL_COLORS.gray500} />
          <Text style={styles.officerLinkText}>Officer verification only</Text>
        </Pressable>
      </View>

      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <View style={styles.qrModalBackdrop}>
          <View style={styles.qrModalCard}>
            <Text style={styles.qrModalTitle}>Officer verification</Text>

            <View style={[styles.qrFrame, qrExpired && styles.qrFrameExpired]}>
              {qrValue && !qrExpired ? (
                <QRCode value={qrValue} size={220} color={NEUTRAL_COLORS.gray900} backgroundColor={NEUTRAL_COLORS.white} />
              ) : (
                <View style={styles.qrExpiredState}>
                  <Ionicons name="time-outline" size={42} color={NEUTRAL_COLORS.gray500} />
                  <Text style={styles.qrExpiredText}>QR code expired</Text>
                </View>
              )}
            </View>

            <Text style={styles.qrLicenceNumber}>{LICENCE.licenceNumber}</Text>

            <Text style={[styles.qrCountdown, qrExpired && styles.qrCountdownExpired]}>
              {qrExpired ? 'Expired' : `Expires in 0:${String(remainingSeconds).padStart(2, '0')}`}
            </Text>

            {qrExpired ? (
              <Pressable style={styles.qrPrimaryButton} onPress={generateQr}>
                <Text style={styles.qrPrimaryButtonText}>Generate new QR code</Text>
              </Pressable>
            ) : null}

            <Pressable style={styles.qrCloseButton} onPress={() => setQrVisible(false)}>
              <Text style={styles.qrCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#003D52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  cardHeader: {
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerRaLogo: {
    flexShrink: 0,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 8,
    padding: 4,
  },
  headerCoatOfArms: {
    flexShrink: 0,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 8,
    padding: 5,
  },
  headerTextBlock: {
    flex: 1,
  },
  cardHeaderEyebrow: {
    ...typography.caption,
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardHeaderText: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
    fontSize: 17,
    lineHeight: 24,
  },
  headerFlag: {
    width: 48,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  cardBody: {
    backgroundColor: '#E8F6FC',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  licencePlate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: PRIMARY + '30',
    gap: spacing.sm,
  },
  licenceNumberBlock: {
    flex: 1,
  },
  licenceNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    lineHeight: 28,
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 1,
    marginTop: 2,
  },
  validChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY + '14',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY + '35',
  },
  validChipText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: PRIMARY,
  },
  mainRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoFrame: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  photo: {
    width: 84,
    height: 104,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  mainFields: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  bottomFields: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  officerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 5,
    marginTop: spacing.md,
    paddingVertical: 4,
  },
  officerLinkPressed: {
    opacity: 0.55,
  },
  officerLinkText: {
    ...typography.caption,
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: NEUTRAL_COLORS.gray500,
    letterSpacing: 0.3,
  },
  halfField: {
    flex: 1,
  },
  fieldCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 10,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
  },
  field: {
    gap: 2,
  },
  fieldCompact: {
    gap: 1,
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 11,
    color: NEUTRAL_COLORS.gray500,
    fontFamily: 'Poppins_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldValue: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: NEUTRAL_COLORS.gray900,
  },
  divider: {
    height: 1,
    backgroundColor: PRIMARY + '25',
    marginBottom: spacing.md,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailsIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsToggleText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_500Medium',
    color: NEUTRAL_COLORS.gray800,
  },
  detailsBlock: {
    marginTop: spacing.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: PRIMARY + '22',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    flex: 1,
  },
  detailValue: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_500Medium',
    color: NEUTRAL_COLORS.gray900,
    textAlign: 'right',
    flex: 1,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: NEUTRAL_COLORS.gray200,
  },
  footerDivider: {
    height: 1,
    backgroundColor: PRIMARY + '20',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  footerMeta: {
    flex: 1,
  },
  footerTitle: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.6,
  },
  footerSubtitle: {
    ...typography.caption,
    fontSize: 10,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 1,
  },
  hologram: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY + '12',
    borderWidth: 1,
    borderColor: PRIMARY + '30',
  },
  qrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  qrModalTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.xs,
  },
  qrFrame: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.md,
  },
  qrFrameExpired: {
    backgroundColor: NEUTRAL_COLORS.gray100,
    borderColor: NEUTRAL_COLORS.gray300,
  },
  qrExpiredState: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  qrExpiredText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontFamily: 'Poppins_500Medium',
  },
  qrLicenceNumber: {
    ...typography.body,
    fontFamily: 'Poppins_700Bold',
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  qrCountdown: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
    marginBottom: spacing.md,
  },
  qrCountdownExpired: {
    color: '#B45309',
  },
  qrPrimaryButton: {
    minHeight: 44,
    width: '100%',
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  qrPrimaryButtonText: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.white,
  },
  qrCloseButton: {
    paddingVertical: spacing.sm,
  },
  qrCloseButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontFamily: 'Poppins_500Medium',
  },
});
