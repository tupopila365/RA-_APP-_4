import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../components';
import { ToggleRow } from '../components/ProfileShared';
import { spacing } from '../theme/spacing';
import { NEUTRAL_COLORS } from '../theme/colors';

export function PreferencesScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <ToggleRow
          iconName="chatbubble-outline"
          label="Messages"
          value={notificationsEnabled}
          onToggle={() => setNotificationsEnabled((prev) => !prev)}
        />
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
    padding: spacing.lg,
  },
});