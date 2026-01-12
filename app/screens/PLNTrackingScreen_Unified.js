import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import unified design system components
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
import { useTheme } from '../hooks/useTheme';
import { plnService } from '../services/plnService';
import { StatusStepper } from '../components/StatusStepper';

export default function PLNTrackingScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);

  const styles = getStyles(colors, insets);

  const handleCheckStatus = async () => {
    if (!referenceId.trim() || !idNumber.trim()) {
      Alert.alert(
        'Missing Information', 
        'Please enter both your Reference ID and ID Number to track your application.',
        [{ text: 'Understood' }]
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await plnService.trackApplication(referenceId.trim(), idNumber.trim());
      setApplication(result);
    } catch (error) {
      console.error('Error tracking application:', error);
      setError(error.message || 'Unable to locate your application. Please verify your details and try again.');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setReferenceId('');
    setIdNumber('');
    setApplication(null);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'submitted': colors.secondary,
      'under-review': colors.primary,
      'payment-required': colors.secondary,
      'payment-received': colors.primary,
      'approved': colors.success,
      'rejected': colors.error,
      'completed': colors.success,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'submitted': 'Application Submitted',
      'under-review': 'Under Review',
      'payment-required': 'Payment Required',
      'payment-received': 'Payment Received',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed',
    };
    return statusLabels[status] || status;
  };

  const hasSearched = application !== null || error !== null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <GlobalHeader
        title="Track PLN Application"
        subtitle="Check your application status"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Initial Instructions */}
        {!hasSearched && (
          <UnifiedCard variant="default" padding="large" style={styles.instructionsCard}>
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionsIcon}>
                <Ionicons name="search-outline" size={48} color={colors.primary} />
              </View>
              <Text style={styles.instructionsTitle}>Track Your Application</Text>
              <Text style={styles.instructionsMessage}>
                Enter your Reference ID and ID Number to check the current status of your Personalized Number Plate application.
              </Text>
              <View style={styles.instructionsSteps}>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Enter your Reference ID from your application confirmation</Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Enter your ID Number used during application</Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>View your application status and details</Text>
                </View>
              </View>
            </View>
          </UnifiedCard>
        )}

        {/* Search Form */}
        <UnifiedCard variant="default" padding="large" style={styles.searchCard}>
          <View style={styles.searchHeader}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Text style={styles.searchTitle}>Application Details</Text>
          </View>
          
          <UnifiedFormInput
            value={referenceId}
            onChangeText={setReferenceId}
            placeholder="e.g., PLN-2024-001234"
            label="Reference ID"
            leftIcon="bookmark-outline"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          <UnifiedFormInput
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Enter your ID number"
            label="ID Number"
            leftIcon="card-outline"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.searchButtons}>
            <UnifiedButton
              label={loading ? "Checking Status..." : "Check Status"}
              onPress={handleCheckStatus}
              variant="primary"
              size="large"
              loading={loading}
              disabled={loading || !referenceId.trim() || !idNumber.trim()}
              iconName="search"
              fullWidth
            />
            
            {hasSearched && (
              <UnifiedButton
                label="Clear Form"
                onPress={handleClearForm}
                variant="ghost"
                size="medium"
                iconName="refresh"
                style={styles.clearButton}
              />
            )}
          </View>
        </UnifiedCard>

        {/* Loading State */}
        {loading && (
          <UnifiedCard variant="outlined" padding="large" style={styles.loadingCard}>
            <View style={styles.loadingContainer}>
              <UnifiedSkeletonLoader type="text-line" width="60%" height={20} />
              <UnifiedSkeletonLoader type="text-line" width="80%" height={16} />
              <UnifiedSkeletonLoader type="text-line" width="40%" height={16} />
              <Text style={styles.loadingText}>Searching for your application...</Text>
            </View>
          </UnifiedCard>
        )}

        {/* Error Message */}
        {error && !loading && (
          <UnifiedCard variant="outlined" padding="large" style={styles.errorCard}>
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={32} color={colors.error} />
              </View>
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>Application Not Found</Text>
                <Text style={styles.errorText}>{error}</Text>
                <View style={styles.errorHints}>
                  <Text style={styles.errorHintTitle}>Please verify:</Text>
                  <Text style={styles.errorHint}>• Reference ID is entered correctly</Text>
                  <Text style={styles.errorHint}>• ID Number matches your application</Text>
                  <Text style={styles.errorHint}>• Application was submitted successfully</Text>
                </View>
              </View>
            </View>
          </UnifiedCard>
        )}

        {/* Success Indicator */}
        {application && !error && !loading && (
          <UnifiedCard variant="outlined" padding="medium" style={styles.successCard}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.successText}>Application Found Successfully</Text>
            </View>
          </UnifiedCard>
        )}

        {/* Application Details */}
        {application && !loading && (
          <>
            {/* Current Status */}
            <UnifiedCard variant="default" padding="large" style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons name="flag-outline" size={24} color={colors.primary} />
                <Text style={styles.statusTitle}>Current Status</Text>
              </View>
              
              <View style={styles.currentStatusContainer}>
                <View
                  style={[
                    styles.currentStatusBadge,
                    { 
                      backgroundColor: getStatusColor(application.status) + '15',
                      borderColor: getStatusColor(application.status),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(application.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.currentStatusText,
                      { color: getStatusColor(application.status) },
                    ]}
                  >
                    {getStatusLabel(application.status)}
                  </Text>
                </View>
              </View>

              {/* Status Stepper */}
              <View style={styles.stepperContainer}>
                <StatusStepper
                  currentStatus={application.status}
                  statusHistory={application.statusHistory || []}
                />
              </View>
            </UnifiedCard>

            {/* Application Information */}
            <UnifiedCard variant="default" padding="large" style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.infoTitle}>Application Information</Text>
              </View>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reference ID</Text>
                  <Text style={styles.infoValue}>{application.referenceId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Applicant Name</Text>
                  <Text style={styles.infoValue}>{application.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Submission Date</Text>
                  <Text style={styles.infoValue}>{formatDate(application.createdAt)}</Text>
                </View>
                {application.paymentDeadline && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment Deadline</Text>
                    <Text style={[styles.infoValue, styles.deadlineText]}>
                      {formatDate(application.paymentDeadline)}
                    </Text>
                  </View>
                )}
                {application.paymentReceivedAt && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment Received</Text>
                    <Text style={styles.infoValue}>{formatDate(application.paymentReceivedAt)}</Text>
                  </View>
                )}
              </View>
            </UnifiedCard>

            {/* Plate Choices */}
            {application.plateChoices && application.plateChoices.length > 0 && (
              <UnifiedCard variant="default" padding="large" style={styles.plateCard}>
                <View style={styles.plateHeader}>
                  <Ionicons name="car-outline" size={24} color={colors.primary} />
                  <Text style={styles.plateTitle}>Requested Plate Numbers</Text>
                </View>
                
                <View style={styles.plateChoices}>
                  {application.plateChoices.map((choice, index) => (
                    <View key={index} style={styles.plateChoiceItem}>
                      <View style={styles.plateChoiceHeader}>
                        <Text style={styles.plateChoiceNumber}>Choice {index + 1}</Text>
                        <View style={styles.platePreview}>
                          <Text style={styles.plateText}>{choice.text}</Text>
                        </View>
                      </View>
                      {choice.meaning && (
                        <Text style={styles.plateMeaning}>{choice.meaning}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </UnifiedCard>
            )}

            {/* Admin Comments */}
            {application.adminComments && (
              <UnifiedCard variant="outlined" padding="large" style={styles.commentsCard}>
                <View style={styles.commentsHeader}>
                  <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
                  <Text style={styles.commentsTitle}>Official Comments</Text>
                </View>
                <Text style={styles.commentsText}>{application.adminComments}</Text>
              </UnifiedCard>
            )}
          </>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors, insets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: spacing.xxl + (insets?.bottom || 0),
    },

    // Instructions
    instructionsCard: {
      marginBottom: spacing.lg,
    },
    instructionsContainer: {
      alignItems: 'center',
    },
    instructionsIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    instructionsTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    instructionsMessage: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.xl,
    },
    instructionsSteps: {
      alignSelf: 'stretch',
      gap: spacing.md,
    },
    instructionStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepNumberText: {
      ...typography.caption,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    stepText: {
      ...typography.bodySmall,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },

    // Search Form
    searchCard: {
      marginBottom: spacing.lg,
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    searchTitle: {
      ...typography.h4,
      color: colors.text,
    },
    searchButtons: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    clearButton: {
      alignSelf: 'center',
    },

    // Loading State
    loadingCard: {
      marginBottom: spacing.lg,
    },
    loadingContainer: {
      alignItems: 'center',
      gap: spacing.md,
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },

    // Error State
    errorCard: {
      borderColor: colors.error + '40',
      marginBottom: spacing.lg,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    errorIcon: {
      marginTop: spacing.xs,
    },
    errorContent: {
      flex: 1,
    },
    errorTitle: {
      ...typography.h5,
      color: colors.error,
      marginBottom: spacing.sm,
    },
    errorText: {
      ...typography.body,
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 22,
    },
    errorHints: {
      gap: spacing.xs,
    },
    errorHintTitle: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    errorHint: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },

    // Success State
    successCard: {
      borderColor: colors.success + '40',
      marginBottom: spacing.lg,
    },
    successContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    successText: {
      ...typography.body,
      fontWeight: '600',
      color: colors.success,
    },

    // Status Card
    statusCard: {
      marginBottom: spacing.lg,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    statusTitle: {
      ...typography.h4,
      color: colors.text,
    },
    currentStatusContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    currentStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 20,
      borderWidth: 2,
      gap: spacing.sm,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    currentStatusText: {
      ...typography.body,
      fontWeight: '700',
    },
    stepperContainer: {
      marginTop: spacing.md,
    },

    // Info Card
    infoCard: {
      marginBottom: spacing.lg,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    infoTitle: {
      ...typography.h4,
      color: colors.text,
    },
    infoGrid: {
      gap: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    infoValue: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
      textAlign: 'right',
    },
    deadlineText: {
      color: colors.error,
      fontWeight: '600',
    },

    // Plate Card
    plateCard: {
      marginBottom: spacing.lg,
    },
    plateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    plateTitle: {
      ...typography.h4,
      color: colors.text,
    },
    plateChoices: {
      gap: spacing.lg,
    },
    plateChoiceItem: {
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    plateChoiceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    plateChoiceNumber: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    platePreview: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
    },
    plateText: {
      ...typography.h5,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 2,
    },
    plateMeaning: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // Comments Card
    commentsCard: {
      borderColor: colors.primary + '40',
      marginBottom: spacing.lg,
    },
    commentsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    commentsTitle: {
      ...typography.h4,
      color: colors.text,
    },
    commentsText: {
      ...typography.body,
      color: colors.text,
      lineHeight: 24,
    },
  });
}