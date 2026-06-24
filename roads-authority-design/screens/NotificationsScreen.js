import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY } from '../theme/colors';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n0',
    type: 'driver',
    title: 'Driver licence has expired',
    message: 'Your driver licence expired on 20 Jan 2026. Renew immediately to avoid penalties.',
    dueDate: '2026-01-20',
  },
  {
    id: 'n1',
    type: 'driver',
    title: 'Driver licence expires soon',
    message: 'Your driver licence will expire in 3 months on 21 Aug 2026.',
    dueDate: '2026-08-21',
  },
  {
    id: 'n2',
    type: 'vehicle',
    title: 'Vehicle licence expires soon',
    message: 'Vehicle registration N 12345 W will expire in 3 months on 18 Aug 2026.',
    dueDate: '2026-08-18',
  },
  {
    id: 'n3',
    type: 'vehicle',
    title: 'Vehicle licence reminder',
    message: 'Vehicle registration N 77890 W is approaching expiry in 3 months.',
    dueDate: '2026-09-02',
  },
];

function getTypeIcon(type) {
  return type === 'driver' ? 'id-card-outline' : 'car-outline';
}

function isExpiredDate(dateValue) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return new Date(dateValue) < today;
}

function NotificationCard({ item, onMoveToMessages }) {
  const isExpired = isExpiredDate(item.dueDate);

  return (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      {isExpired ? (
        <View style={styles.expiredAction}>
          <Ionicons name="alert-circle-outline" size={16} color="#B91C1C" />
          <Text style={styles.expiredActionText}>Renewal required</Text>
        </View>
      ) : (
        <Pressable style={styles.archiveButton} onPress={() => onMoveToMessages(item)}>
          <Ionicons name="checkmark-done-outline" size={16} color={NEUTRAL_COLORS.gray700} />
          <Text style={styles.archiveButtonText}>Move to messages</Text>
        </Pressable>
      )}
    </View>
  );
}

function MessageCard({ item }) {
  return (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <Ionicons name="mail-outline" size={16} color={NEUTRAL_COLORS.gray600} />
        <Text style={styles.messageHeaderText}>Message</Text>
      </View>
      <Text style={styles.messageTitle}>{item.title}</Text>
      <Text style={styles.messageBody}>{item.message}</Text>
    </View>
  );
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [messages, setMessages] = useState([]);

  const hasNotifications = notifications.length > 0;
  const hasMessages = messages.length > 0;

  const handleMoveToMessages = (notification) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    setMessages((prev) => [{ ...notification, movedAt: new Date().toISOString() }, ...prev]);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      {hasNotifications ? (
        notifications.map((item) => (
          <NotificationCard key={item.id} item={item} onMoveToMessages={handleMoveToMessages} />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active notifications.</Text>
        </View>
      )}

      {hasMessages ? (
        messages.map((item) => <MessageCard key={`m-${item.id}`} item={item} />)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No messages yet.</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  notificationCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  notificationTitle: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    lineHeight: 20,
  },
  archiveButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray300,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
  },
  archiveButtonText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray700,
    fontFamily: 'Poppins_600SemiBold',
  },
  expiredAction: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
  },
  expiredActionText: {
    ...typography.caption,
    color: '#B91C1C',
    fontFamily: 'Poppins_600SemiBold',
  },
  messageCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  messageHeaderText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    fontFamily: 'Poppins_600SemiBold',
  },
  messageTitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray900,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  messageBody: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 12,
    padding: spacing.md,
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
  },
});
