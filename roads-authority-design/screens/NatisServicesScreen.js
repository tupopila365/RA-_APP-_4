import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import {
  ProfileNavRow,
  VehicleStatusBadge,
  useProfileDisplay,
} from '../components/ProfileShared';
import { getRegisteredVehicleCounts } from '../data/registeredVehicles';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const NATIS_SECTIONS = [
  {
    title: 'Licence',
    items: [
      {
        key: 'view-driving-licence',
        iconName: 'id-card-outline',
        title: 'Driving Licence',
        subtitle: 'View your digital licence',
      },
      {
        key: 'driving-test',
        iconName: 'car-sport-outline',
        title: 'Driving Licence Test',
        subtitle: 'Book a test appointment',
      },
      {
        key: 'learner-test',
        iconName: 'time-outline',
        title: "Learner's Licence Test",
        subtitle: 'Book a learner test',
      },
    ],
  },
  {
    title: 'Vehicle',
    items: [
      {
        key: 'renew-vehicle',
        iconName: 'refresh-circle-outline',
        title: 'Renew Motor Vehicle Licence',
        subtitle: 'Renew disk online',
      },
    ],
  },
  {
    title: 'Information',
    items: [
      {
        key: 'forms',
        iconName: 'document-text-outline',
        title: 'Forms',
        subtitle: 'Download NaTIS forms',
      },
      {
        key: 'faqs',
        iconName: 'help-circle-outline',
        title: 'FAQs',
        subtitle: 'Licensing & vehicle help',
      },
    ],
  },
];

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function GuestBanner({ onSignIn, onSignUp }) {
  return (
    <View style={styles.guestCard}>
      <View style={styles.guestHeader}>
        <View style={styles.guestIconWrap}>
          <Ionicons name="person-outline" size={22} color={PRIMARY} />
        </View>
        <View style={styles.guestCopy}>
          <Text style={styles.guestTitle}>Sign in for NaTIS services</Text>
          <Text style={styles.guestSubtitle}>Access your licence and vehicle renewals</Text>
        </View>
      </View>
      <View style={styles.authActions}>
        <Pressable style={styles.loginButton} onPress={onSignIn}>
          <Ionicons name="log-in-outline" size={18} color={NEUTRAL_COLORS.white} />
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>
        <Pressable style={styles.registerButton} onPress={onSignUp}>
          <Ionicons name="person-add-outline" size={18} color={PRIMARY} />
          <Text style={styles.registerButtonText}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LoggedInStatusCard({ displayName, vehicleTotal, vehicleDueSoon, onOpenProfile }) {
  const vehicleSummary =
    vehicleTotal === 0
      ? 'No vehicles linked'
      : vehicleDueSoon === 0
        ? vehicleTotal === 1
          ? '1 vehicle linked'
          : `${vehicleTotal} vehicles linked`
        : vehicleDueSoon === 1
          ? `${vehicleTotal} vehicles · 1 renewal due`
          : `${vehicleTotal} vehicles · ${vehicleDueSoon} renewals due`;

  return (
    <Pressable
      style={({ pressed }) => [styles.statusCard, pressed && styles.statusCardPressed]}
      onPress={onOpenProfile}
    >
      <View style={styles.statusRow}>
        <Ionicons name="id-card-outline" size={18} color={PRIMARY} />
        <Text style={styles.statusRowLabel}>Driving licence</Text>
        <VehicleStatusBadge status="valid" />
      </View>
      <View style={styles.statusRow}>
        <Ionicons name="car-outline" size={18} color={PRIMARY} />
        <Text style={styles.statusRowMeta}>{vehicleSummary}</Text>
      </View>
      <View style={styles.statusFooter}>
        <Text style={styles.statusName} numberOfLines={1}>{displayName}</Text>
        <View style={styles.statusLink}>
          <Text style={styles.statusLinkText}>View profile</Text>
          <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
        </View>
      </View>
    </Pressable>
  );
}

export function NatisServicesScreen({
  user,
  onMenuItemPress,
  onSignIn,
  onSignUp,
  onOpenProfile,
}) {
  const { isLoggedIn, displayName } = useProfileDisplay(user);
  const { total: vehicleTotal, dueSoon: vehicleDueSoon } = getRegisteredVehicleCounts();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      {isLoggedIn ? (
        <LoggedInStatusCard
          displayName={displayName}
          vehicleTotal={vehicleTotal}
          vehicleDueSoon={vehicleDueSoon}
          onOpenProfile={onOpenProfile}
        />
      ) : (
        <GuestBanner onSignIn={onSignIn} onSignUp={onSignUp} />
      )}

      {NATIS_SECTIONS.map((section) => (
        <Section key={section.title} title={section.title}>
          {section.items.map((item) => (
            <ProfileNavRow
              key={item.key}
              iconName={item.iconName}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => onMenuItemPress?.(item.key)}
            />
          ))}
        </Section>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: NEUTRAL_COLORS.gray600,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
  },
  guestCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    gap: spacing.md,
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  guestIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCopy: {
    flex: 1,
    minWidth: 0,
  },
  guestTitle: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    fontSize: 15,
  },
  guestSubtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginTop: 2,
  },
  authActions: {
    gap: spacing.sm,
  },
  loginButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loginButtonText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  registerButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  registerButtonText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
  },
  statusCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statusCardPressed: {
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusRowLabel: {
    ...typography.bodySmall,
    fontFamily: 'Poppins_500Medium',
    color: NEUTRAL_COLORS.gray800,
    flex: 1,
  },
  statusRowMeta: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    flex: 1,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray100,
    gap: spacing.sm,
  },
  statusName: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    flex: 1,
  },
  statusLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statusLinkText: {
    ...typography.caption,
    fontFamily: 'Poppins_600SemiBold',
    color: PRIMARY,
  },
});
