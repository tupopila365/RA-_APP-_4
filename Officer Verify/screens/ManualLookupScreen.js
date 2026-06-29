import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {
  ScreenContainer,
  VerifierHeader,
  FormInput,
  PrimaryButton,
} from '../components';
import { verifyByLicenceNumber } from '../services/licenceVerifyService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

export function ManualLookupScreen({ onBack, onResult }) {
  const [licenceNumber, setLicenceNumber] = useState('NAM 879912 PE84');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!licenceNumber.trim()) {
      setError('Licence number is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await verifyByLicenceNumber(licenceNumber.trim());
      onResult?.(result);
    } catch (err) {
      Alert.alert('Lookup failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <VerifierHeader title="Manual lookup" onBack={onBack} />
      <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Use when the QR cannot be scanned. This checks the registry only — it does not prove
          the phone display is genuine.
        </Text>

        <View style={styles.card}>
          <FormInput
            label="Licence number"
            required
            value={licenceNumber}
            onChangeText={(v) => {
              setLicenceNumber(v);
              setError('');
            }}
            placeholder="NAM 879912 PE84"
            autoCapitalize="characters"
            error={error}
          />
          <PrimaryButton
            label="Look up licence"
            onPress={handleLookup}
            enabled={!!licenceNumber.trim()}
            loading={loading}
          />
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  content: {
    paddingTop: spacing.lg,
  },
  intro: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 16,
    padding: spacing.xl,
  },
});
