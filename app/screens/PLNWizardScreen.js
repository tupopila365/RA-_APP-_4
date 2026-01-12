import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const { width } = Dimensions.get('window');

export default function PLNWizardScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Step 1: Plate Details
  const [plateText, setPlateText] = useState('');
  const [plateError, setPlateError] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  
  // Step 2: Applicant Details
  const [fullName, setFullName] = useState('');
  const [contactMethod, setContactMethod] = useState('phone'); // 'phone' or 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [contactError, setContactError] = useState('');
  
  // OTP Step
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef([]);
  
  // Step 4: Confirmation
  const [referenceId, setReferenceId] = useState('');
  const [trackingPin, setTrackingPin] = useState('');

  const styles = createStyles(colors, isDark, insets);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step titles
  const stepTitles = {
    1: 'Apply for Personalized Number Plate',
    2: 'Applicant Information',
    3: 'Verify Your Contact',
    4: 'Review & Submit',
    5: 'Application Submitted'
  };

  // Progress indicators
  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: 'Plate', completed: currentStep > 1 },
      { number: 2, label: 'Applicant', completed: currentStep > 2 },
      { number: 3, label: 'Review', completed: currentStep > 4 },
      { number: 4, label: 'Done', completed: currentStep === 5 }
    ];

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <View style={styles.stepContainer}>
              <View style={[
                styles.stepCircle,
                step.completed && styles.stepCircleCompleted,
                currentStep === step.number && styles.stepCircleCurrent
              ]}>
                {step.completed ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    currentStep === step.number && styles.stepNumberCurrent
                  ]}>
                    {step.number}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                step.completed && styles.stepLabelCompleted,
                currentStep === step.number && styles.stepLabelCurrent
              ]}>
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepConnector,
                step.completed && styles.stepConnectorCompleted
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  // Plate text validation
  const validatePlateText = (text) => {
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (cleanText.length === 0) {
      setPlateError('');
      setAvailabilityMessage('');
      return;
    }
    
    if (cleanText.length > 8) {
      setPlateError('Maximum 8 characters allowed');
      setAvailabilityMessage('');
      return;
    }
    
    // Check for offensive words (basic check)
    const offensiveWords = ['FUCK', 'SHIT', 'DAMN', 'HELL'];
    if (offensiveWords.some(word => cleanText.includes(word))) {
      setPlateError('This text is not allowed');
      setAvailabilityMessage('');
      return;
    }
    
    setPlateError('');
    setAvailabilityMessage('This plate appears available');
  };

  // Handle plate text change
  const handlePlateTextChange = (text) => {
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPlateText(cleanText);
    validatePlateText(cleanText);
  };

  // Validate contact information
  const validateContact = () => {
    if (!fullName.trim()) {
      setNameError('Full name is required');
      return false;
    }
    setNameError('');

    if (contactMethod === 'phone') {
      if (!phoneNumber.trim() || phoneNumber.length < 8) {
        setContactError('Valid phone number is required');
        return false;
      }
    } else {
      if (!email.trim() || !email.includes('@')) {
        setContactError('Valid email address is required');
        return false;
      }
    }
    setContactError('');
    return true;
  };

  // Send OTP
  const sendOTP = async () => {
    if (!validateContact()) return;
    
    setOtpLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOtpSent(true);
      setCurrentStep(3);
      setCountdown(30);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  // Verify OTP
  const verifyOTP = async (otpCode) => {
    setLoading(true);
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpCode === '123456') { // Demo OTP
        setCurrentStep(4);
      } else {
        setOtpError('Invalid verification code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit application
  const submitApplication = async () => {
    setLoading(true);
    try {
      // Simulate application submission
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock reference ID and tracking PIN
      const refId = `PLN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      setReferenceId(refId);
      setTrackingPin(pin);
      setCurrentStep(5);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    // In a real app, use Clipboard API
    Alert.alert('Copied', `${text} copied to clipboard`);
  };

  // Download PDF
  const downloadPDF = () => {
    Alert.alert('Download', 'PDF download started');
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{stepTitles[1]}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Preferred plate text</Text>
              <TextInput
                style={[styles.textInput, plateError && styles.textInputError]}
                value={plateText}
                onChangeText={handlePlateTextChange}
                placeholder="Enter plate text"
                placeholderTextColor={colors.textSecondary}
                maxLength={8}
                autoCapitalize="characters"
                autoFocus
              />
              
              <View style={styles.rulesContainer}>
                <Text style={styles.rulesTitle}>Rules:</Text>
                <Text style={styles.rulesText}>• Maximum 8 characters</Text>
                <Text style={styles.rulesText}>• Letters and numbers only</Text>
                <Text style={styles.rulesText}>• No offensive words</Text>
              </View>
              
              {plateError ? (
                <Text style={styles.errorText}>{plateError}</Text>
              ) : availabilityMessage ? (
                <Text style={styles.successText}>✓ {availabilityMessage}</Text>
              ) : null}
            </View>

            <Button
              title="Continue"
              onPress={() => plateText.length > 0 && !plateError && setCurrentStep(2)}
              disabled={!plateText || !!plateError}
              style={styles.continueButton}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{stepTitles[2]}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.textInput, nameError && styles.textInputError]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
              {nameError && <Text style={styles.errorText}>{nameError}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contact Method</Text>
              <View style={styles.contactMethodContainer}>
                <TouchableOpacity
                  style={[
                    styles.contactMethodButton,
                    contactMethod === 'phone' && styles.contactMethodButtonActive
                  ]}
                  onPress={() => setContactMethod('phone')}
                >
                  <Text style={[
                    styles.contactMethodText,
                    contactMethod === 'phone' && styles.contactMethodTextActive
                  ]}>
                    Phone Number
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.contactMethodButton,
                    contactMethod === 'email' && styles.contactMethodButtonActive
                  ]}
                  onPress={() => setContactMethod('email')}
                >
                  <Text style={[
                    styles.contactMethodText,
                    contactMethod === 'email' && styles.contactMethodTextActive
                  ]}>
                    Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {contactMethod === 'phone' ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={[styles.textInput, contactError && styles.textInputError]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+264 81 234 5678"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
                {contactError && <Text style={styles.errorText}>{contactError}</Text>}
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[styles.textInput, contactError && styles.textInputError]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {contactError && <Text style={styles.errorText}>{contactError}</Text>}
              </View>
            )}

            <Text style={styles.privacyText}>
              We only use this to verify your application.
            </Text>

            <Button
              title="Send Verification Code"
              onPress={sendOTP}
              loading={otpLoading}
              style={styles.continueButton}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Verify Your Contact</Text>
            
            <Text style={styles.otpInstructions}>
              Enter the 6-digit code sent to {contactMethod === 'phone' ? `+264•••${phoneNumber.slice(-3)}` : `${email.split('@')[0]}•••@${email.split('@')[1]}`}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => otpRefs.current[index] = ref}
                  style={[styles.otpInput, otpError && styles.otpInputError]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            {otpError && <Text style={styles.errorText}>{otpError}</Text>}

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setCountdown(30);
                sendOTP();
              }}
              disabled={countdown > 0}
            >
              <Text style={[
                styles.resendText,
                countdown > 0 && styles.resendTextDisabled
              ]}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Submit</Text>
            
            <Card style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Plate Text:</Text>
                <Text style={styles.reviewValue}>{plateText}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Applicant Name:</Text>
                <Text style={styles.reviewValue}>{fullName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Contact Method:</Text>
                <Text style={styles.reviewValue}>
                  {contactMethod === 'phone' ? phoneNumber : email}
                </Text>
              </View>
            </Card>

            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color="#FF6B35" />
              <Text style={styles.warningText}>
                Please confirm details. Changes cannot be made after submission.
              </Text>
            </View>

            <Button
              title="Submit Application"
              onPress={submitApplication}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
              <Text style={styles.successTitle}>
                Your application was submitted successfully
              </Text>
            </View>

            <Card style={styles.trackingCard}>
              <Text style={styles.trackingTitle}>🔐 Tracking Details</Text>
              
              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>REFERENCE ID:</Text>
                <View style={styles.trackingValueContainer}>
                  <Text style={styles.trackingValue}>{referenceId}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(referenceId)}>
                    <Ionicons name="copy" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>TRACKING PIN:</Text>
                <View style={styles.trackingValueContainer}>
                  <Text style={styles.trackingValue}>{trackingPin}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(trackingPin)}>
                    <Ionicons name="copy" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#FF6B35" />
                <Text style={styles.trackingWarning}>
                  Save these details. They are required to track your application.
                </Text>
              </View>
            </Card>

            <View style={styles.actionButtons}>
              <Button
                title="📋 Copy Details"
                onPress={() => copyToClipboard(`${referenceId} - ${trackingPin}`)}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="📄 Download PDF"
                onPress={downloadPDF}
                variant="outline"
                style={styles.actionButton}
              />
            </View>

            <Button
              title="Track Application"
              onPress={() => navigation.navigate('PLNTracking', { referenceId, trackingPin })}
              style={styles.trackButton}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        {currentStep > 1 && currentStep < 5 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        {renderProgressBar()}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, isDark, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: insets.top + 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    position: 'absolute',
    top: insets.top + 20,
    left: 20,
    zIndex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepCircleCurrent: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'TwitterChirp-Regular',
  },
  stepNumberCurrent: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'TwitterChirp-Regular',
  },
  stepLabelCompleted: {
    color: '#4CAF50',
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
    marginBottom: 24,
  },
  stepConnectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'TwitterChirp-Bold',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'TwitterChirp-Medium',
  },
  textInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: 'TwitterChirp-Regular',
  },
  textInputError: {
    borderColor: '#FF6B35',
  },
  rulesContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'TwitterChirp-Medium',
  },
  rulesText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'TwitterChirp-Regular',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 8,
    fontFamily: 'TwitterChirp-Regular',
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontFamily: 'TwitterChirp-Regular',
  },
  contactMethodContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  contactMethodButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  contactMethodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  contactMethodText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'TwitterChirp-Regular',
  },
  contactMethodTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'TwitterChirp-Regular',
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  otpInstructions: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'TwitterChirp-Regular',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: 'TwitterChirp-Bold',
  },
  otpInputError: {
    borderColor: '#FF6B35',
  },
  resendButton: {
    alignSelf: 'center',
    padding: 12,
  },
  resendText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'TwitterChirp-Regular',
  },
  resendTextDisabled: {
    color: colors.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'TwitterChirp-Regular',
  },
  reviewCard: {
    marginBottom: 24,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'TwitterChirp-Regular',
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'TwitterChirp-Medium',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    fontFamily: 'TwitterChirp-Regular',
  },
  submitButton: {
    marginTop: 'auto',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 28,
    fontFamily: 'TwitterChirp-Bold',
  },
  trackingCard: {
    marginBottom: 24,
    backgroundColor: colors.primary + '08',
    borderWidth: 2,
    borderColor: colors.primary + '20',
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'TwitterChirp-Bold',
  },
  trackingRow: {
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'TwitterChirp-Medium',
  },
  trackingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'TwitterChirp-Bold',
  },
  trackingWarning: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    fontFamily: 'TwitterChirp-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  trackButton: {
    marginTop: 'auto',
  },
});