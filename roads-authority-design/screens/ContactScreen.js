import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { RA_CONTACTS } from '../data/contacts';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

function formatPhoneForTel(phone) {
  return (phone || '').replace(/\s/g, '');
}

function ContactRow({ icon, label, value, onPress, href }) {
  const handlePress = () => {
    if (onPress) onPress();
    else if (href) Linking.openURL(href);
  };
  if (!value && !href) return null;
  return (
    <Pressable style={styles.contactRow} onPress={handlePress} disabled={!onPress && !href}>
      <Ionicons name={icon} size={20} color={PRIMARY} style={styles.rowIcon} />
      <View style={styles.contactRowText}>
        <Text style={styles.contactLabel}>{label}</Text>
        {value ? <Text style={styles.contactValue}>{value}</Text> : null}
      </View>
      <Ionicons name="open-outline" size={18} color={NEUTRAL_COLORS.gray400} />
    </Pressable>
  );
}

function ContactCard({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ContactScreen({ onBack }) {
  const handleCall = (phone) => {
    if (phone) Linking.openURL(`tel:${formatPhoneForTel(phone)}`);
  };
  const handleEmail = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Roads Authority contact details. Call, email or visit the website.
      </Text>

      <ContactCard title={RA_CONTACTS.headOffice.name}>
        <ContactRow
          icon="location-outline"
          label="Address"
          value={RA_CONTACTS.headOffice.address}
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RA_CONTACTS.headOffice.address + ', Namibia')}`}
        />
        <ContactRow
          icon="call-outline"
          label="Telephone"
          value={RA_CONTACTS.headOffice.phone}
          onPress={() => handleCall(RA_CONTACTS.headOffice.phone)}
        />
        <ContactRow
          icon="mail-outline"
          label="Email"
          value={RA_CONTACTS.headOffice.email}
          onPress={() => handleEmail(RA_CONTACTS.headOffice.email)}
        />
        <ContactRow
          icon="globe-outline"
          label="Website"
          value="www.ra.org.na"
          href={RA_CONTACTS.headOffice.website}
        />
      </ContactCard>

      <ContactCard title={RA_CONTACTS.permits.name}>
        <ContactRow
          icon="call-outline"
          label="Telephone"
          value={RA_CONTACTS.permits.phone}
          onPress={() => handleCall(RA_CONTACTS.permits.phone)}
        />
        <ContactRow
          icon="mail-outline"
          label="Email"
          value={RA_CONTACTS.permits.email}
          onPress={() => handleEmail(RA_CONTACTS.permits.email)}
        />
      </ContactCard>

      <ContactCard title={RA_CONTACTS.fraudHotline.name}>
        <ContactRow
          icon="call-outline"
          label="Hotline"
          value={RA_CONTACTS.fraudHotline.phone}
          onPress={() => handleCall(RA_CONTACTS.fraudHotline.phone)}
        />
        <ContactRow
          icon="mail-outline"
          label="Email"
          value={RA_CONTACTS.fraudHotline.email}
          onPress={() => handleEmail(RA_CONTACTS.fraudHotline.email)}
        />
        {RA_CONTACTS.fraudHotline.note ? (
          <Text style={styles.note}>{RA_CONTACTS.fraudHotline.note}</Text>
        ) : null}
      </ContactCard>
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
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NEUTRAL_COLORS.gray200,
  },
  contactRowText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  contactLabel: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
  },
  contactValue: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    marginTop: 2,
  },
  rowIcon: {
    marginRight: 0,
  },
  note: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
