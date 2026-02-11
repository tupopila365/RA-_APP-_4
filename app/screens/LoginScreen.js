import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { validate, getErrorMessage, validators } from '../utils/validation';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';

// Import Unified Design System Components
import {
  GlobalHeader,
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

export default function LoginScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { login } = useAppContext();

  // Get return screen from route params (for protected features)
  const returnScreen = route?.params?.returnScreen;
  const returnParams = route?.params?.returnParams;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  // Dynamic styles based on theme
  const styles = createStyles(colors);

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
      setFormError('Please review the highlighted fields and try again.');
      return;
    }

    setFormError('');
    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);

      // Update app context with user data
      await login(result.user);

      if (returnScreen) {
        navigation.replace(returnScreen, returnParams);
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Show detailed error message
      const errorMessage = error.message || 'Invalid email or password. Please try again.';
      
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Sign In"
        subtitle="Roads Authority Digital Services"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* RA Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Main Form Card */}
            <UnifiedCard variant="elevated" padding="large">
              <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginBottom: spacing.sm }]}>
                Welcome Back
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 }]}>
                Sign in to your Roads Authority account
              </Text>
              {!!formError && (
                <Text style={styles.formErrorText} accessibilityLiveRegion="polite">
                  {formError}
                </Text>
              )}
              
              <UnifiedFormInput
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateField('Email', text, { required: true, email: true });
                }}
                placeholder="Enter your email"
                error={errors.Email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                required
              />

              <UnifiedFormInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validateField('Password', text, { required: true });
                }}
                placeholder="Enter your password"
                error={errors.Password}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />

              <UnifiedButton
                label="Sign In"
                onPress={handleLogin}
                variant="primary"
                size="large"
                iconName="log-in-outline"
                iconPosition="right"
                loading={loading}
                disabled={loading}
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </UnifiedCard>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
                  Forgot your password?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
                  Create New Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Government Portal Branding */}
            <View style={styles.brandingContainer}>
              <Text style={[typography.h2, { color: colors.primary, textAlign: 'center', marginBottom: spacing.xs }]}>
                Roads Authority
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                Digital Services Portal
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Professional government-standard styling using design system
const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formErrorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.lg,
  },
  
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    marginTop: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  
  // Form Container
  formContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Footer Links
  footerLinks: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  
  // Government Branding
  brandingContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
});

// Screen options to hide the default header since we use GlobalHeader
LoginScreen.options = {
  headerShown: false,
};
