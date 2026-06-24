import React from 'react';
import { StyleSheet } from 'react-native';
import { ScreenContainer, DrivingLicenceCard } from '../components';
import { spacing } from '../theme/spacing';

export function MyLicencesScreen() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <DrivingLicenceCard />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
