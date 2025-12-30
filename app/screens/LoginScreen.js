import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { FormInput, Button, Card } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { validate, getErrorMessage, validators } from '../utils/validation';
import { authService } from '../services/authService';
import { ApiClient } from '../services/api';
import { useAppContext } from '../context/AppContext';
import ENV from '../config/env';
import RAIcon from '../assets/icon.png';

export default function LoginScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { login } = useAppContext();
  const styles = getStyles(colors);

  // Get return screen from route params (for protected features)
  const returnScreen = route?.params?.returnScreen;
  const returnParams = route?.params?.returnParams;

  const [loading, setLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateField = (fieldName, value, rules) => {
    // Clear error immediately if validation passes
    const fieldErrors = validate(value, rules);
    if (fieldErrors.length === 0) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return true;
    }
    
    // Determine which error message to show (prioritize more specific errors)
    const ruleKeys = Object.keys(rules);
    let errorRule = ruleKeys[0]; // Default to first rule
    
    // Check each rule in priority order
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    
    // If value is empty or whitespace, show required error
    if (rules.required && (!trimmedValue || trimmedValue.length === 0)) {
      errorRule = 'required';
    } else if (rules.minLength && trimmedValue && trimmedValue.length < rules.minLength) {
      errorRule = 'minLength';
    } else if (rules.email && trimmedValue && !validators.email(trimmedValue)) {
      errorRule = 'email';
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: getErrorMessage(fieldName, errorRule),
    }));
    return false;
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField('Email', email, { required: true, email: true }) && isValid;
    isValid = validateField('Password', password, { required: true }) && isValid;
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);

      // Update app context with user data
      await login(result.user);

      Alert.alert('Success', 'Logged in successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to return screen if provided, otherwise to main tabs
            if (returnScreen) {
              navigation.replace(returnScreen, returnParams);
            } else {
              navigation.replace('MainTabs');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Login error:', error);
      
      // Show detailed error message
      const errorMessage = error.message || 'Invalid email or password. Please try again.';
      
      Alert.alert(
        'Login Failed',
        errorMessage,
        [
          {
            text: 'Check Connection',
            onPress: handleCheckConnection,
            style: error.status === 408 || error.details?.timeout ? 'default' : 'cancel',
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    try {
      const result = await ApiClient.checkConnection();
      
      if (result.success) {
        Alert.alert(
          'Connection Successful',
          `Backend server is reachable at:\n${result.url}\n\nYou can try logging in again.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Connection Failed',
          `${result.message}\n\nServer URL: ${result.url}\n\nPlease check:\n` +
          `1. Backend server is running\n` +
          `2. IP address in config/env.js: ${ENV.API_BASE_URL}\n` +
          `3. Firewall is not blocking port 5000\n` +
          `4. Device and computer are on the same WiFi network`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Check Failed',
        `Unable to check connection: ${error.message}\n\nServer URL: ${ENV.API_BASE_URL}`,
        [{ text: 'OK' }]
      );
    } finally {
      setCheckingConnection(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={styles.logoContainer}>
              <Image source={RAIcon} style={styles.logo} />
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Sign in to continue</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.formCard} variant="elevated">
            <View style={styles.formSection}>
              <FormInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateField('Email', text, { required: true, email: true });
                }}
                error={errors.Email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <FormInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validateField('Password', text, { required: true });
                }}
                error={errors.Password}
                secureTextEntry
              />
            </View>

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              size="large"
              fullWidth
              iconName="log-in-outline"
            />

            <Button
              label={checkingConnection ? "Checking..." : "Check Connection"}
              onPress={handleCheckConnection}
              loading={checkingConnection}
              disabled={checkingConnection || loading}
              style={styles.checkConnectionButton}
              variant="outline"
              fullWidth
              iconName="wifi-outline"
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    top: 0,
    padding: spacing.sm,
    zIndex: 1,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl, // Extra padding to ensure footer is reachable
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  checkConnectionButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  footerText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
});
