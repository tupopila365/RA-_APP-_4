import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Button, Card } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import RAIcon from '../assets/icon.png';

export default function EmailVerificationScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { login } = useAppContext();
  const styles = getStyles(colors);

  const email = route?.params?.email || '';
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Start cooldown timer if needed
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) {
      Alert.alert('Please wait', `You can resend the email in ${resendCooldown} seconds.`);
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email address not found. Please register again.');
      return;
    }

    setResendLoading(true);
    try {
      await authService.resendVerificationEmail(email);
      setResendCooldown(60); // 60 second cooldown
      Alert.alert('Success', 'Verification email has been resent. Please check your inbox.');
    } catch (error) {
      console.error('Resend verification email error:', error);
      Alert.alert('Error', error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOpenEmailApp = () => {
    // Try to open email app
    const emailUrl = `mailto:${email}`;
    Linking.openURL(emailUrl).catch((err) => {
      console.error('Failed to open email app:', err);
      Alert.alert('Error', 'Could not open email app. Please check your email manually.');
    });
  };

  const handleContinue = () => {
    // Navigate to login screen
    navigation.replace('Login', {
      email: email,
      message: 'Please verify your email before logging in.',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image source={RAIcon} style={styles.logo} />
              <Text style={styles.headerTitle}>Verify Your Email</Text>
              <Text style={styles.headerSubtitle}>Check your inbox</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.contentCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={80} color={colors.primary} />
          </View>

          <Text style={styles.title}>Verification Email Sent</Text>
          
          <Text style={styles.description}>
            We've sent a verification email to:
          </Text>

          <Text style={styles.emailText}>{email}</Text>

          <Text style={styles.instructions}>
            Please click the verification link in the email to activate your account. The link will expire in 24 hours.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              label={resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Verification Email'}
              onPress={handleResendEmail}
              loading={resendLoading}
              disabled={resendLoading || resendCooldown > 0}
              style={styles.button}
              variant="outline"
              fullWidth
              iconName="refresh-outline"
            />

            <Button
              label="Open Email App"
              onPress={handleOpenEmailApp}
              style={styles.button}
              variant="outline"
              fullWidth
              iconName="mail-outline"
            />

            <Button
              label="Continue to Login"
              onPress={handleContinue}
              style={styles.button}
              size="large"
              fullWidth
              iconName="log-in-outline"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn't receive the email? Check your spam folder or try resending.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyLarge,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  contentCard: {
    marginHorizontal: spacing.md,
    marginTop: -spacing.xxl,
    padding: spacing.xl,
    borderRadius: 15,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emailText: {
    ...typography.bodyLarge,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  instructions: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});











