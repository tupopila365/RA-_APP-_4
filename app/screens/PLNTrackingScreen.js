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
import { StatusStepper } from '../components/StatusStepper';

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

  const normalizeStatus = (status) => {
    if (!status) return 'SUBMITTED';
    const normalized = status.toString().trim().toUpperCase().replace(/[\s-]+/g, '_');
    const mapping = {
      PENDING: 'SUBMITTED',
      PENDING_REVIEW: 'UNDER_REVIEW',
      UNDER_REVIEW: 'UNDER_REVIEW',
      APPROVED: 'APPROVED',
      REJECTED: 'DECLINED',
      DECLINED: 'DECLINED',
      PAYMENT_REQUIRED: 'PAYMENT_PENDING',
      PAYMENT_PENDING: 'PAYMENT_PENDING',
      PAYMENT_RECEIVED: 'PAID',
      PAID: 'PAID',
      PLATES_ORDERED: 'PLATES_ORDERED',
      READY_FOR_COLLECTION: 'READY_FOR_COLLECTION',
      COMPLETED: 'READY_FOR_COLLECTION',
      EXPIRED: 'EXPIRED',
    };
    return mapping[normalized] || normalized;
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    const labels = {
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      PAYMENT_PENDING: 'Payment Pending',
      PAID: 'Payment Received',
      PLATES_ORDERED: 'Plates Ordered',
      READY_FOR_COLLECTION: 'Ready for Collection',
      DECLINED: 'Declined',
      EXPIRED: 'Expired',
    };
    return labels[normalized] || 'In Progress';
  };

  const getNextStepsMessage = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'SUBMITTED':
        return 'Your application was received. We will review your documents shortly.';
      case 'UNDER_REVIEW':
        return 'Your documents are being verified by our team.';
      case 'APPROVED':
        return 'Application approved. Please proceed with payment to continue.';
      case 'PAYMENT_PENDING':
        return 'Payment is required to continue processing your plates.';
      case 'PAID':
        return 'Payment received. Plates are being ordered.';
      case 'PLATES_ORDERED':
        return 'Plates ordered. We will notify you once they are ready for collection.';
      case 'READY_FOR_COLLECTION':
        return 'Your plates are ready for collection. Bring your ID to the nearest office.';
      case 'DECLINED':
        return 'Your application was declined. Contact support for details.';
      case 'EXPIRED':
        return 'Your application expired. Please submit a new application.';
      default:
        return 'Your application is being processed. Please check back for updates.';
    }
  };

  const formatHistoryTimestamp = (timestamp) => {
    if (!timestamp) return 'Not specified';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const buildStatusHistory = (history, createdAt, normalizedStatus) => {
    if (Array.isArray(history) && history.length > 0) {
      return history.map((entry) => {
        const entryStatus = normalizeStatus(entry.status || normalizedStatus);
        const entryTimestamp =
          entry.timestamp ||
          entry.date ||
          entry.createdAt ||
          entry.updatedAt ||
          createdAt ||
          new Date().toISOString();

        return {
          ...entry,
          status: entryStatus,
          timestamp: entryTimestamp,
          comment: entry.comment || entry.note || entry.remark || entry.message,
        };
      });
    }

    // Fallback when no history is returned from the API
    const baseTimestamp = createdAt || new Date().toISOString();
    const fallbackHistory = [
      {
        status: 'SUBMITTED',
        timestamp: baseTimestamp,
        comment: 'Application submitted',
      },
    ];

    if (normalizedStatus && normalizedStatus !== 'SUBMITTED') {
      fallbackHistory.push({
        status: normalizedStatus,
        timestamp: baseTimestamp,
        comment: 'Current status',
      });
    }

    return fallbackHistory;
  };

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

      const normalizedStatus = normalizeStatus(result.status || 'SUBMITTED');
      const statusHistory = buildStatusHistory(result.statusHistory, result.createdAt, normalizedStatus);

      // Format the result for display
      const trackingResult = {
        referenceId: result.referenceId,
        status: normalizedStatus,
        estimatedTime: result.estimatedTime || '5–7 working days',
        submittedDate: result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown',
        lastUpdated: result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : 'Unknown',
        nextSteps: getNextStepsMessage(result.status),
        statusHistory,
        paymentDeadline: result.paymentDeadline,
        paymentReceivedAt: result.paymentReceivedAt,
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
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'SUBMITTED':
        return '#2196F3';
      case 'UNDER_REVIEW':
        return '#FF9800';
      case 'APPROVED':
        return '#4CAF50';
      case 'DECLINED':
        return '#F44336';
      case 'PAYMENT_PENDING':
        return '#9C27B0';
      case 'PAID':
        return '#4CAF50';
      case 'PLATES_ORDERED':
        return '#00BCD4';
      case 'READY_FOR_COLLECTION':
        return '#8BC34A';
      case 'EXPIRED':
        return '#9C27B0';
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
                {getStatusLabel(trackingResult.status)}
              </Text>
            </View>
          </View>

          <View style={styles.progressTracker}>
            <View style={styles.progressHeaderRow}>
              <Text style={[typography.h4, { color: colors.text }]}>
                Progress tracker
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                See exactly where your application sits and what is next.
              </Text>
            </View>
            <StatusStepper
              currentStatus={trackingResult.status}
              statusHistory={trackingResult.statusHistory}
              paymentDeadline={trackingResult.paymentDeadline}
            />
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
        <UnifiedCard variant="default" padding="large" style={styles.historyCard}>
          <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginBottom: spacing.xl }]}>
            Status History
          </Text>
          {trackingResult.statusHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />
              <View style={styles.historyContent}>
                <Text style={[typography.body, styles.historyStatusText, { color: colors.text }]}>
                  {getStatusLabel(item.status)}
                </Text>
                {item.comment && (
                  <Text style={[typography.caption, styles.historyComment, { color: colors.textSecondary }]}>
                    {item.comment}
                  </Text>
                )}
                <Text style={[typography.caption, styles.historyTimestamp, { color: colors.textSecondary }]}>
                  {formatHistoryTimestamp(item.timestamp)}
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
          fullWidth
          style={[styles.actionButton, styles.actionButtonLeft]}
        />
        <UnifiedButton
          label="New Search"
          onPress={resetForm}
          variant="primary"
          size="medium"
          iconName="search-outline"
          iconPosition="left"
          fullWidth
          style={styles.actionButton}
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
  
  progressTracker: {
    width: '100%',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  progressHeaderRow: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },

  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
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
  historyComment: {
    marginBottom: spacing.xs,
  },
  historyStatusText: {
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  historyTimestamp: {
    lineHeight: 18,
  },
  historyCard: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
  actionButton: {
    flex: 1,
  },
  actionButtonLeft: {
    marginRight: spacing.md,
  },
});

// Screen options to hide the default header since we use GlobalHeader
PLNTrackingScreen.options = {
  headerShown: false,
};