import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components';
import { ProfileAvatar, useProfileDisplay } from '../components/ProfileShared';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export function AccountDetailsScreen({ user }) {
  const { isLoggedIn, username, idName, email, initials } = useProfileDisplay(user);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <ProfileAvatar initials={initials} isLoggedIn={isLoggedIn} size={72} />
        </View>
        <DetailRow label="Username" value={username} />
        <DetailRow label="ID name" value={idName} />
        {email ? <DetailRow label="Email" value={email} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarWrap: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    fontSize: 12,
    color: NEUTRAL_COLORS.gray500,
    fontFamily: 'Poppins_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    ...typography.body,
    fontFamily: 'Poppins_600SemiBold',
    color: NEUTRAL_COLORS.gray900,
    fontSize: 16,
    textAlign: 'center',
  },
});
