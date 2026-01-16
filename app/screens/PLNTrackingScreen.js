import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';

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

export default function PLNTrackingScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [referenceId, setReferenceId] = useState(route?.params?.referenceId || '');
  const [pin, setPin] = useState(route?.params?.pin || '');
  const [referenceError, setReferenceError] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Tracking result
  const [trackingResult, setTrackingResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Professional styles using design system
  const styles = createStyles(colors, isDark, insets);

  // Auto-check status if params provided
  useEffect(() => {
    if (route?.params?.referenceId && route?.params?.pin) {
      checkStatus();
    }
  }, []);

  // Validate inputs
  const validateInputs = () => {
    let isValid = true;
    
    const rawRef = referenceId.trim();

    if (!rawRef) {
      setReferenceError('Reference ID is required');
      isValid = false;
    } else if (!rawRef.match(/^PLN-\d{4}-[A-Za-z0-9]{12,25}$/)) {
      setReferenceError('Invalid Reference ID format (PLN-YYYY-XXXXXXXXXXXX)');
      isValid = false;
    } else {
      setReferenceError('');
    }
    
    if (!pin.trim()) {
      setPinError('PIN is required');
      isValid = false;
    } else if (pin.trim() !== '12345') {
      setPinError('Invalid PIN (use 12345)');
      isValid = false;
    } else {
      setPinError('');
    }
    
    return isValid;
  };

  // Check application status
  const checkStatus = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      // Call the real PLN tracking API with uppercase reference ID
      const submissionRef = referenceId.trim().toUpperCase();
      const result = await plnService.trackApplication(submissionRef, pin);
      
      // Helper function to get next steps message
      const getNextStepsMessage = (status) => {
        switch (status?.toLowerCase()) {
          case 'pending':
          case 'pending review':
            return 'Your application is being reviewed by our team. You will be notified once the review is complete.';
          case 'approved':
            return 'Your application has been approved! You will receive your personalized number plates soon.';
          case 'rejected':
            return 'Your application has been rejected. Please contact our office for more information.';
          default:
            return 'Your application is being processed. Please check back later for updates.';
        }
      };
      
      // Format the result for display
      const trackingResult = {
        referenceId: result.referenceId,
        status: result.status || 'Pending Review',
        estimatedTime: '5–7 working days',
        submittedDate: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown',
        lastUpdated: result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'Unknown',
        nextSteps: getNextStepsMessage(result.status),
        statusHistory: [
          { 
            status: 'Submitted', 
            date: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown',
            time: result.createdAt ? new Date(result.createdAt).toLocaleTimeString() : 'Unknown'
          },
        ]
      };

      setTrackingResult(trackingResult);
      setShowResult(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to check status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setShowResult(false);
    setTrackingResult(null);
    setReferenceId('');
    setPin('');
    setReferenceError('');
    setPinError('');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return '#2196F3';
      case 'under review':
      case 'pending review':
        return '#FF9800';
      case 'approved':
        return '#4CAF50';
      case 'declined':
        return '#F44336';
      case 'payment pending':
        return '#9C27B0';
      case 'paid':
        return '#4CAF50';
      case 'plates ordered':
        return '#00BCD4';
      case 'ready for collection':
        return '#8BC34A';
      default:
        return '#AAAAAA';
    }
  };

  // Render tracking form
  const renderTrackingForm = () => (
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
          Track PLN Application
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 20 }]}>
          Enter your details to check your application status
        </Text>
        
        <UnifiedFormInput
          label="Reference ID"
          value={referenceId}
          onChangeText={(text) => {
            setReferenceId(text);
            setReferenceError('');
          }}
          placeholder="PLN-2024-ABC123DEF456"
          error={referenceError}
          autoCapitalize="none"
          maxLength={25}
          leftIcon="document-text-outline"
          helperText="Format: PLN-YYYY-XXXXXXXXXXXX (up to 25 characters)"
          required
        />

        <UnifiedFormInput
          label="Tracking PIN"
          value={pin}
          onChangeText={(text) => {
            setPin(text.replace(/[^0-9]/g, ''));
            setPinError('');
          }}
          placeholder="Enter PIN: 12345"
          error={pinError}
          keyboardType="numeric"
          maxLength={5}
          leftIcon="lock-closed-outline"
          helperText="Universal tracking PIN: 12345"
          secureTextEntry={true}
          required
        />
      </UnifiedCard>

      <UnifiedButton
        label="Track Application"
        onPress={checkStatus}
        variant="primary"
        size="large"
        iconName="search-outline"
        iconPosition="right"
        loading={loading}
        disabled={loading}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      {/* Footer Links */}
      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Contact support for assistance')}>
          <Text style={[typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
            Need help with tracking?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('PLNApplication')}>
          <Text style={[typography.body, { color: colors.primary, textDecorationLine: 'underline' }]}>
            Apply for New PLN
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
  );

  // Render tracking result
  const renderTrackingResult = () => (
    <View style={styles.resultContainer}>
      {/* RA Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Result Card */}
      <UnifiedCard variant="elevated" padding="large">
        <View style={styles.statusSection}>
          <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginBottom: spacing.lg }]}>
            Application Status
          </Text>
          
          <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }]}>
            Reference: {trackingResult.referenceId}
          </Text>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(trackingResult.status) + '20', borderColor: getStatusColor(trackingResult.status) }
            ]}>
              <Text style={[
                typography.body,
                { color: getStatusColor(trackingResult.status), fontWeight: '600' }
              ]}>
                {trackingResult.status}
              </Text>
            </View>
          </View>

          <View style={styles.estimatedTimeContainer}>
            <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
              Estimated Time:
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {trackingResult.estimatedTime}
            </Text>
          </View>

          {trackingResult.nextSteps && (
            <View style={styles.nextStepsContainer}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.sm }]}>
                Next Steps:
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
                {trackingResult.nextSteps}
              </Text>
            </View>
          )}
        </View>
      </UnifiedCard>

      {/* Status History */}
      {trackingResult.statusHistory && trackingResult.statusHistory.length > 0 && (
        <UnifiedCard variant="default" padding="large">
          <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginBottom: spacing.lg }]}>
            Status History
          </Text>
          {trackingResult.statusHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />
              <View style={styles.historyContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  {item.status}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {item.date} at {item.time}
                </Text>
              </View>
            </View>
          ))}
        </UnifiedCard>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <UnifiedButton
          label="Check Again"
          onPress={checkStatus}
          variant="outline"
          size="medium"
          iconName="refresh-outline"
          iconPosition="left"
        />
        <UnifiedButton
          label="New Search"
          onPress={resetForm}
          variant="primary"
          size="medium"
          iconName="search-outline"
          iconPosition="left"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <GlobalHeader
        title="Track Application"
        subtitle="PLN Application Status"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: 'help-circle-outline',
            onPress: () => Alert.alert('Help', 'Contact support for assistance'),
            accessibilityLabel: 'Get help',
          },
        ]}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showResult ? renderTrackingResult() : renderTrackingForm()}
      </ScrollView>
    </View>
  );
}

// Professional government-standard styling using design system
const createStyles = (colors, isDark, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  
  // Result Container
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  
  statusSection: {
    alignItems: 'center',
  },
  
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  statusBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 2,
  },
  
  estimatedTimeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
  },
  
  nextStepsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
  },
  
  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.lg,
    marginTop: 4,
  },
  
  historyContent: {
    flex: 1,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    maxWidth: 400,
  },
});

// Screen options to hide the default header since we use GlobalHeader
PLNTrackingScreen.options = {
  headerShown: false,
};