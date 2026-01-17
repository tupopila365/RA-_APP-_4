import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

const STATUS_ORDER = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'PAYMENT_PENDING',
  'PAID',
  'PLATES_ORDERED',
  'READY_FOR_COLLECTION',
];

const STATUS_LABELS = {
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

const STATUS_DESCRIPTIONS = {
  SUBMITTED: 'Application received and logged',
  UNDER_REVIEW: 'Documents being verified',
  APPROVED: 'Application approved - continue to payment',
  PAYMENT_PENDING: 'Payment required to proceed',
  PAID: 'Payment confirmed',
  PLATES_ORDERED: 'Plates sent to manufacturer',
  READY_FOR_COLLECTION: 'Ready! Visit office to collect',
  DECLINED: 'Application declined',
  EXPIRED: 'Application expired',
};

export function StatusStepper({ currentStatus, statusHistory = [], paymentDeadline }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  // Get the index of current status
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCompleted = currentIndex !== -1;

  // Calculate progress
  const totalSteps = STATUS_ORDER.length;
  const completedSteps = currentIndex + 1;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Get status history in chronological order
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Calculate days remaining for payment deadline
  const getDaysRemaining = () => {
    if (!paymentDeadline) return null;
    const now = new Date();
    const deadline = new Date(paymentDeadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isPaymentUrgent = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isPaymentOverdue = daysRemaining !== null && daysRemaining < 0;

  // Handle special statuses (DECLINED, EXPIRED)
  if (currentStatus === 'DECLINED' || currentStatus === 'EXPIRED') {
    return (
      <View style={styles.container}>
        {/* Progress Header - Show as failed */}
        <View style={styles.progressHeader}>
          <View style={styles.progressHeaderTop}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.progressTitle}>Application Status</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, styles.progressBarError, { width: '100%' }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.error }]}>
            {STATUS_LABELS[currentStatus]}
          </Text>
        </View>

        {/* Status Details */}
        <View style={styles.statusItem}>
          <View style={[styles.iconContainer, styles.iconError]}>
            <Ionicons name="close-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: colors.error }]}>
              {STATUS_LABELS[currentStatus] || currentStatus}
            </Text>
            <Text style={styles.statusDescription}>
              {STATUS_DESCRIPTIONS[currentStatus]}
            </Text>
            {sortedHistory.length > 0 && sortedHistory[sortedHistory.length - 1].comment && (
              <Text style={styles.statusComment}>
                {sortedHistory[sortedHistory.length - 1].comment}
              </Text>
            )}
            {sortedHistory.length > 0 && sortedHistory[sortedHistory.length - 1].timestamp && (
              <Text style={styles.statusDate}>
                {new Date(sortedHistory[sortedHistory.length - 1].timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressHeaderTop}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={styles.progressTitle}>Application Progress</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {completedSteps} of {totalSteps} • {progressPercentage}% Complete
        </Text>
      </View>

      {/* Status Steps */}
      {STATUS_ORDER.map((status, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const showLine = index < STATUS_ORDER.length - 1;

        // Find status in history
        const historyEntry = sortedHistory.find((h) => h.status === status);

        // Check if this is payment pending step
        const isPaymentStep = status === 'PAYMENT_PENDING' && isCurrent;

        return (
          <View key={status} style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.iconContainer,
                  isCurrent && styles.iconCurrent,
                  isActive && !isCurrent && styles.iconCompleted,
                  !isActive && styles.iconPending,
                ]}
              >
                {isActive ? (
                  <Ionicons
                    name={isCurrent ? 'time' : 'checkmark'}
                    size={24}
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color={colors.textSecondary} />
                )}
              </View>
              <View style={styles.statusContent}>
                <Text
                  style={[
                    styles.statusLabel,
                    isCurrent && styles.statusLabelCurrent,
                    isActive && !isCurrent && styles.statusLabelCompleted,
                  ]}
                >
                  {STATUS_LABELS[status] || status}
                </Text>
                
                {/* Status Description */}
                <Text style={styles.statusDescription}>
                  {STATUS_DESCRIPTIONS[status]}
                </Text>

                {/* Payment Deadline Warning */}
                {isPaymentStep && paymentDeadline && (
                  <View style={[
                    styles.paymentWarning,
                    isPaymentOverdue && styles.paymentOverdue,
                    isPaymentUrgent && styles.paymentUrgent,
                  ]}>
                    <Ionicons 
                      name={isPaymentOverdue ? 'alert-circle' : 'time'} 
                      size={16} 
                      color={isPaymentOverdue ? colors.error : isPaymentUrgent ? '#FF9800' : colors.primary} 
                    />
                    <Text style={[
                      styles.paymentWarningText,
                      isPaymentOverdue && { color: colors.error },
                      isPaymentUrgent && { color: '#FF9800' },
                    ]}>
                      {isPaymentOverdue 
                        ? `Overdue by ${Math.abs(daysRemaining)} days`
                        : isPaymentUrgent
                        ? `Due in ${daysRemaining} days`
                        : `Due: ${new Date(paymentDeadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}`
                      }
                    </Text>
                  </View>
                )}

                {/* Admin Comments */}
                {historyEntry && historyEntry.comment && (
                  <View style={styles.commentContainer}>
                    <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.statusComment}>{historyEntry.comment}</Text>
                  </View>
                )}

                {/* Timestamp */}
                {historyEntry && historyEntry.timestamp && (
                  <Text style={styles.statusDate}>
                    {new Date(historyEntry.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}

                {/* Pending Status Message */}
                {!isActive && (
                  <Text style={styles.pendingText}>Pending</Text>
                )}
              </View>
            </View>
            {showLine && (
              <View
                style={[
                  styles.line,
                  index < currentIndex && styles.lineCompleted,
                  index === currentIndex && styles.lineCurrent,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      paddingVertical: 16,
    },
    
    // Progress Header Styles
    progressHeader: {
      backgroundColor: colors.primary + '08',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },
    progressHeaderTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressBarError: {
      backgroundColor: colors.error,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    
    // Status Row Styles
    statusRow: {
      marginBottom: 4,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      marginTop: 4,
    },
    iconCompleted: {
      backgroundColor: colors.success,
    },
    iconCurrent: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    iconPending: {
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
    },
    iconError: {
      backgroundColor: colors.error,
    },
    statusContent: {
      flex: 1,
      paddingTop: 4,
      paddingBottom: 16,
    },
    statusLabel: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statusLabelCurrent: {
      color: colors.primary,
    },
    statusLabelCompleted: {
      color: colors.textSecondary,
    },
    statusDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    
    // Payment Warning Styles
    paymentWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 4,
      marginBottom: 8,
      gap: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    paymentUrgent: {
      backgroundColor: '#FFF3E0',
      borderLeftColor: '#FF9800',
    },
    paymentOverdue: {
      backgroundColor: colors.error + '10',
      borderLeftColor: colors.error,
    },
    paymentWarningText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      flex: 1,
    },
    
    // Comment Styles
    commentContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 8,
      paddingLeft: 8,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
    },
    statusComment: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      flex: 1,
    },
    statusDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 6,
      fontWeight: '500',
    },
    pendingText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 4,
    },
    
    // Line Styles
    line: {
      width: 3,
      height: 32,
      backgroundColor: colors.border,
      marginLeft: 20,
      marginTop: -8,
      marginBottom: -8,
    },
    lineCompleted: {
      backgroundColor: colors.success,
    },
    lineCurrent: {
      backgroundColor: colors.primary,
      opacity: 0.4,
    },
  });
}




















