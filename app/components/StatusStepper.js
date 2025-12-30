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

export function StatusStepper({ currentStatus, statusHistory = [] }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  // Get the index of current status
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isCompleted = currentIndex !== -1;

  // Get status history in chronological order
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Handle special statuses (DECLINED, EXPIRED)
  if (currentStatus === 'DECLINED' || currentStatus === 'EXPIRED') {
    return (
      <View style={styles.container}>
        <View style={styles.statusItem}>
          <View style={[styles.iconContainer, styles.iconError]}>
            <Ionicons name="close-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>{STATUS_LABELS[currentStatus] || currentStatus}</Text>
            {sortedHistory.length > 0 && sortedHistory[sortedHistory.length - 1].comment && (
              <Text style={styles.statusComment}>
                {sortedHistory[sortedHistory.length - 1].comment}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STATUS_ORDER.map((status, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const showLine = index < STATUS_ORDER.length - 1;

        // Find status in history
        const historyEntry = sortedHistory.find((h) => h.status === status);

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
                    size={20}
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons name="ellipse-outline" size={20} color={colors.textSecondary} />
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
                {historyEntry && historyEntry.comment && (
                  <Text style={styles.statusComment}>{historyEntry.comment}</Text>
                )}
                {historyEntry && historyEntry.timestamp && (
                  <Text style={styles.statusDate}>
                    {new Date(historyEntry.timestamp).toLocaleDateString()}
                  </Text>
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
    statusRow: {
      marginBottom: 8,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    iconCompleted: {
      backgroundColor: colors.success,
    },
    iconCurrent: {
      backgroundColor: colors.primary,
    },
    iconPending: {
      backgroundColor: colors.border,
      borderWidth: 2,
      borderColor: colors.textSecondary,
    },
    iconError: {
      backgroundColor: colors.error,
    },
    statusContent: {
      flex: 1,
      paddingTop: 8,
    },
    statusLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    statusLabelCurrent: {
      color: colors.primary,
    },
    statusLabelCompleted: {
      color: colors.textSecondary,
    },
    statusComment: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    line: {
      width: 2,
      height: 24,
      backgroundColor: colors.border,
      marginLeft: 19,
      marginTop: 4,
      marginBottom: 4,
    },
    lineCompleted: {
      backgroundColor: colors.success,
    },
    lineCurrent: {
      backgroundColor: colors.primary,
      opacity: 0.5,
    },
  });
}


