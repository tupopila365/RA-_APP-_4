import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import { FormInput } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { authService } from '../services/authService';

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str || '');
}

export function SignInScreen({ onBack, onSignInSuccess, onGoToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authService.login(email.trim(), password);
      const user = await authService.getStoredUser();
      onSignInSuccess?.(user);
      Alert.alert('Signed in', 'You are now signed in.', [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (err) {
      Alert.alert('Sign in failed', err.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot password', 'Reset password can be added here (e.g. open reset link or screen).');
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card} ref={contentRef} collapsable={false}>
            <Text style={styles.cardHeading}>Roads Authority</Text>
            <Text style={styles.subtitle}>
              Sign in to your Roads Authority account to access applications and reports.
            </Text>

            <FormInput
              label="Email"
              required
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              onFocusWithRef={onFocusWithRef}
            />
            <FormInput
              label="Password"
              required
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              onFocusWithRef={onFocusWithRef}
            />

            <Pressable style={styles.forgotWrap} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleSignIn}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>{submitting ? 'Signing in…' : 'Sign in'}</Text>
            </Pressable>

            {onGoToSignUp && (
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <Pressable onPress={onGoToSignUp}>
                  <Text style={styles.switchLink}>Sign up</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.xxxl,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeading: {
    ...typography.h4,
    color: PRIMARY,
    marginBottom: spacing.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
  },
  forgotWrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  forgotText: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  switchText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
  switchLink: {
    ...typography.bodySmall,
    color: PRIMARY,
    fontWeight: '700',
  },
});
