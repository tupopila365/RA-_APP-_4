import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  RaLogoRing,
  FormInput,
  PrimaryButton,
  OfficialBanner,
} from '../components';
import { login } from '../services/officerAuthService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

export function LoginScreen({ onLoginSuccess }) {
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!officerId.trim() && !!password;

  const handleLogin = async () => {
    const next = {};
    if (!officerId.trim()) next.officerId = 'Officer ID is required';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const session = await login(officerId.trim(), password);
      onLoginSuccess?.(session);
    } catch (err) {
      Alert.alert('Login failed', err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <OfficialBanner subtitle="RA Verifier — authorised personnel only" />
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoWrap}>
              <RaLogoRing size={88} logoSize={70} />
            </View>
            <Text style={styles.heading}>Officer sign in</Text>
            <Text style={styles.subheading}>Verify digital driving licences</Text>

            <View style={styles.card}>
              <FormInput
                label="Officer ID"
                required
                value={officerId}
                onChangeText={(v) => {
                  setOfficerId(v);
                  setErrors((e) => ({ ...e, officerId: undefined }));
                }}
                placeholder="NAMPOL-1001"
                autoCapitalize="characters"
                error={errors.officerId}
              />
              <FormInput
                label="Password"
                required
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((e) => ({ ...e, password: undefined }));
                }}
                placeholder="Password"
                secureTextEntry
                error={errors.password}
              />
              <Text style={styles.demoHint}>Demo: NAMPOL-1001 / demo1234</Text>
              <PrimaryButton
                label="Sign in"
                onPress={handleLogin}
                enabled={canSubmit}
                loading={submitting}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray900,
  },
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 76, 110, 0.72)',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h3,
    color: NEUTRAL_COLORS.white,
    textAlign: 'center',
  },
  subheading: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray200,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 20,
    padding: spacing.xl,
  },
  demoHint: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
