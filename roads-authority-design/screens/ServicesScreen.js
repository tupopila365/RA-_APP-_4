import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const NATIS_ONLINE_URL = 'https://online.ra.org.na/#/';

const SERVICE_INFO = [
  {
    key: 'natis',
    title: 'NATIS Online',
    iconName: 'globe-outline',
    points: [
      'Renew your driving licence',
      'Book learner or driving licence tests',
      'Apply for a professional driving permit (PrDP)',
      'Renew motor vehicle licence',
      'Access other NaTIS services online',
    ],
  },
  {
    key: 'pln',
    title: 'PLN Application',
    iconName: 'document-text-outline',
    points: [
      'Apply for a Producer Licence Number (PLN)',
      'Submit required documents',
      'Track your application status',
      'Get notified when your plates are ready',
    ],
  },
  {
    key: 'my-apps',
    title: 'My Applications',
    iconName: 'folder-open-outline',
    points: [
      'View all your submitted applications',
      'Check status and next steps',
      'See reference numbers and history',
      'Find where to collect approved items',
    ],
  },
  {
    key: 'my-licences',
    title: 'My licence',
    iconName: 'id-card-outline',
    points: [
      'View your driving licence card status',
      'See card number and expiry date',
      'Demo view – no login required',
    ],
  },
  {
    key: 'vehicles-due',
    title: 'Vehicles due for renewal',
    iconName: 'car-outline',
    points: [
      'See vehicles that are due for renewal',
      'Shows make, model and licence number',
      'Demo view based on sample data',
    ],
  },
];

export function ServicesScreen({ onBack, onPlnApplication, onMyApplications, onMyLicences, onVehiclesDue }) {
  const openNatisOnline = () => Linking.openURL(NATIS_ONLINE_URL);

  const getOnPress = (key) => {
    if (key === 'natis') return openNatisOnline;
    if (key === 'pln') return onPlnApplication || (() => {});
    if (key === 'my-apps') return onMyApplications || (() => {});
    if (key === 'my-licences') return onMyLicences || (() => {});
    if (key === 'vehicles-due') return onVehiclesDue || (() => {});
    return () => {};
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Tap a card below to open the service.</Text>
      {SERVICE_INFO.map((info) => (
        <Pressable
          key={info.key}
          style={({ pressed }) => [styles.infoCard, pressed && styles.infoCardPressed]}
          onPress={getOnPress(info.key)}
        >
          <View style={styles.infoCardHeader}>
            <View style={styles.infoIconWrap}>
              <Ionicons name={info.iconName} size={22} color={PRIMARY} />
            </View>
            <Text style={styles.infoCardTitle}>{info.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={NEUTRAL_COLORS.gray400} />
          </View>
          {info.points.map((point, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCardPressed: {
    opacity: 0.9,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoCardTitle: {
    flex: 1,
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
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
});
