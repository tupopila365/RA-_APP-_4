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

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  // Professional styles using design system
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
    } else if (rules.phone && trimmedValue && !validators.phone(trimmedValue)) {
      errorRule = 'phone';
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: getErrorMessage(fieldName, errorRule),
    }));
    return false;
  };

  const validateForm = () => {
    let isValid = true;

    // Full name is optional, but if provided, validate it
    if (fullName.trim()) {
      isValid = validateField('Full Name', fullName, { minLength: 2 }) && isValid;
    }

    isValid = validateField('Email', email, { required: true, email: true }) && isValid;
    isValid = validateField('Password', password, { required: true, minLength: 8 }) && isValid;
    isValid = validateField('Confirm Password', confirmPassword, { required: true }) && isValid;

    // Check password match
    if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
    }

    // Phone number is optional, but if provided, validate it
    if (phoneNumber.trim()) {
      isValid = validateField('Phone Number', phoneNumber, { phone: true }) && isValid;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register(
        email.trim(),
        password,
        fullName.trim() || null,
        phoneNumber.trim() || null
      );

      // Email verification disabled - log user in directly
      await login(result.user);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.replace('MainTabs');
          },
        },
      ]);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('User with this email')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (errorMessage.includes('Password') && errorMessage.includes('8 characters')) {
        errorMessage = 'Password must be at least 8 characters long.';
      } else if (errorMessage.includes('Email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      Alert.alert('Registration Failed', errorMessage, [
        {
          text: errorMessage.includes('already exists') ? 'Go to Login' : 'OK',
          onPress: errorMessage.includes('already exists') 
            ? () => navigation.navigate('Login')
            : undefined,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Create Account"
        subtitle="Join Roads Authority Digital Services"
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
                Create Account
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 }]}>
                Join Roads Authority Digital Services
              </Text>
              
              <UnifiedFormInput
                label="Full Name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (text.trim()) {
                    validateField('Full Name', text, { minLength: 2 });
                  } else {
                    setErrors((prev) => ({ ...prev, 'Full Name': null }));
                  }
                }}
                placeholder="Enter your full name"
                error={errors['Full Name']}
                autoCapitalize="words"
                leftIcon="person-outline"
                helperText="Optional - helps us personalize your experience"
              />

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
                  validateField('Password', text, { required: true, minLength: 8 });
                  // Re-validate confirm password if it's already filled
                  if (confirmPassword) {
                    if (text !== confirmPassword) {
                      setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
                    } else {
                      setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
                    }
                  }
                }}
                placeholder="Enter password (min 8 characters)"
                error={errors.Password}
                secureTextEntry
                leftIcon="lock-closed-outline"
                helperText="Minimum 8 characters required"
                required
              />

              <UnifiedFormInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateField('Confirm Password', text, { required: true });
                  if (text !== password) {
                    setErrors((prev) => ({ ...prev, 'Confirm Password': 'Passwords do not match' }));
                  } else {
                    setErrors((prev) => ({ ...prev, 'Confirm Password': null }));
                  }
                }}
                placeholder="Confirm your password"
                error={errors['Confirm Password']}
                secureTextEntry
                leftIcon="lock-closed-outline"
                required
              />

              <UnifiedFormInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (text.trim()) {
                    validateField('Phone Number', text, { phone: true });
                  } else {
                    setErrors((prev) => ({ ...prev, 'Phone Number': null }));
                  }
                }}
                placeholder="Enter your phone number"
                error={errors['Phone Number']}
                keyboardType="phone-pad"
                leftIcon="call-outline"
                helperText="Optional - for account recovery and notifications"
              />

              <UnifiedButton
                label="Create Account"
                onPress={handleRegister}
                variant="primary"
                size="large"
                iconName="person-add-outline"
                iconPosition="right"
                loading={loading}
                disabled={loading}
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </UnifiedCard>

            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
                  Already have an account? Sign In
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
RegisterScreen.options = {
  headerShown: false,
};
