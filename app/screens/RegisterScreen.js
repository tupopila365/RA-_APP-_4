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
import { FormInput, Button, Card, SectionTitle } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { validate, getErrorMessage, validators } from '../utils/validation';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import RAIcon from '../assets/icon.png';

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAppContext();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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

      // Check if email verification is required
      if (result.emailVerificationRequired || !result.user.isEmailVerified) {
        // Navigate to email verification screen
        navigation.replace('EmailVerification', {
          email: result.user.email || email.trim(),
        });
      } else {
        // If email is already verified (shouldn't happen on registration, but handle it)
        await login(result.user);
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('MainTabs');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
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
              <Text style={styles.headerTitle}>Create Account</Text>
              <Text style={styles.headerSubtitle}>Join Roads Authority Namibia</Text>
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
            <SectionTitle title="Account Information" />
            <View style={styles.formSection}>
              <FormInput
                label="Full Name (Optional)"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (text.trim()) {
                    validateField('Full Name', text, { minLength: 2 });
                  } else {
                    setErrors((prev) => ({ ...prev, 'Full Name': null }));
                  }
                }}
                error={errors['Full Name']}
              />
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
                placeholder="Enter password (min 8 characters)"
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
                error={errors.Password}
                secureTextEntry
              />
              <FormInput
                label="Confirm Password"
                placeholder="Confirm your password"
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
                error={errors['Confirm Password']}
                secureTextEntry
              />
              <FormInput
                label="Phone Number (Optional)"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (text.trim()) {
                    validateField('Phone Number', text, { phone: true });
                  } else {
                    setErrors((prev) => ({ ...prev, 'Phone Number': null }));
                  }
                }}
                error={errors['Phone Number']}
                keyboardType="phone-pad"
              />
            </View>

            <Button
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              size="large"
              fullWidth
              iconName="person-add-outline"
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    paddingBottom: spacing.xxxl * 2, // Extra padding to ensure footer is reachable
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  formSection: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
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
