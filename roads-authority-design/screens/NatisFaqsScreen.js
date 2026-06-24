import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

function LinkText({ children, href }) {
  return (
    <Pressable onPress={() => Linking.openURL(href)} hitSlop={6}>
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

function Bullet({ children }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export function NatisFaqsScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <View style={styles.titleUnderline} />
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeHeading}>Important Notice</Text>

        <Text style={styles.sectionTitle}>
          1. Please note that a licence disc for your vehicle will not be printed under the following circumstances:
        </Text>
        <Bullet>If you have outstanding license fees for other unlicensed vehicles owned by you.</Bullet>
        <Bullet>
          If the vehicle/s that you are currently licensing require(s) Roadworthy Certification, Annual user fee
          for Personalize License Number (PLN) and or Mass Distance Charges (MDC).
        </Bullet>
        <Bullet>
          If there is an admin mark against the vehicle which could prevent the issue of the license disc.
        </Bullet>
        <Bullet>If the vehicle has a Police mark or a Police clearance required.</Bullet>

        <Text style={styles.sectionTitle}>
          2. What can you do to ensure that you receive a licence disc when processing your motor vehicle license
          renewal online?
        </Text>
        <Bullet>
          If you have more than one unlicensed vehicle, ensure that all vehicle licenses are paid at the same time.
        </Bullet>
        <Bullet>
          If required take the vehicle/s for a Roadworthy Test, and submit the Confirmation of Payment (CoP) for MDC
          and annual user fee for PLN to ensure that a license disc is issued.
        </Bullet>
        <View style={styles.inlineRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            Email the CoP to{' '}
            <LinkText href="mailto:online.enatis@ra.org.na">online.enatis@ra.org.na</LinkText>
          </Text>
        </View>
        <View style={styles.inlineRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            Contact the call centre to solve admin mark issue at{' '}
            <LinkText href="tel:+264612847777">+264 61 284 7777</LinkText> or send email to{' '}
            <LinkText href="mailto:online.enatis@ra.org.na">online.enatis@ra.org.na</LinkText>
          </Text>
        </View>
        <Bullet>Ensure that NAMPOL have verified and cleared the vehicle.</Bullet>

        <Text style={styles.sectionTitle}>3. Also take note of the following:</Text>
        <Bullet>All motor vehicles licenses renewed via the online platform will be delivered within 5 working days.</Bullet>
        <Bullet>
          In the event where a Motor Vehicle License Disc was not printed, the vehicle owner will have to apply at any
          NaTIS office after all conditions for the issuing of a disc have been met. The afore-mentioned may result in
          pro-rata fees being applied to issue the vehicle license disc. The traditional renewal application process
          will need to be followed at any NaTIS office.
        </Bullet>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: NEUTRAL_COLORS.gray800,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    marginTop: spacing.xs,
  },
  noticeCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 8,
    padding: spacing.lg,
  },
  noticeHeading: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray800,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    marginRight: spacing.sm,
    marginTop: 1,
  },
  bulletText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
    lineHeight: 22,
  },
  linkText: {
    ...typography.bodySmall,
    color: PRIMARY,
    textDecorationLine: 'underline',
  },
});
