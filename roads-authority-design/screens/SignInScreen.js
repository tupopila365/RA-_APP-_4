import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import { FormInput, BoldMainHeader, InteractiveLink, FormActionButton } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { authService } from '../services/authService';

function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str || '');
}

export function SignInScreen({ onBack, onSignInSuccess, onGoToSignUp, onGoToForgotPassword, onGoToForgotUsername }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();
  const canSubmit = !!email.trim() && !!password && isValidEmail(email.trim());

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
    onGoToForgotPassword?.();
  };
  const handleForgotUsername = () => {
    onGoToForgotUsername?.();
  };
  const handleTerms = () => {
    Alert.alert('Terms & Conditions', 'Open Terms & Conditions content or screen here.');
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
          <BoldMainHeader title="Login" />
          <View style={styles.card} ref={contentRef} collapsable={false}>
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

            <View style={styles.forgotRow}>
              <InteractiveLink
                label="Forgot Username?"
                onPress={handleForgotUsername}
                highlightOnInteract
              />
              <InteractiveLink
                label="Forgot password?"
                onPress={handleForgotPassword}
                style={styles.forgotPasswordLink}
              />
            </View>

            <FormActionButton
              label="Log in"
              onPress={handleSignIn}
              enabled={canSubmit}
              loading={submitting}
            />

            {onGoToSignUp && (
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <InteractiveLink
                  label="Register"
                  onPress={onGoToSignUp}
                />
              </View>
            )}
            <Text style={styles.termsText}>
              By logging in to the Roads Authority website, you are confirming that you have read and agreed to the{' '}
              <Text style={styles.termsLink} onPress={handleTerms}>
                Terms & Conditions
              </Text>{' '}
              for Online Services provided by the Roads Authority.
            </Text>
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
    borderRadius: 12,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  forgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  forgotPasswordLink: {
    marginLeft: spacing.md,
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
  termsText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 32,
  },
  termsLink: {
    color: PRIMARY,
    fontWeight: '600',
  },
});
