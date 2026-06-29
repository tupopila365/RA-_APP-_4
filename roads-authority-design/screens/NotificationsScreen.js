import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
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

const MESSAGE_TOPICS = {
  driver: { iconName: 'id-card-outline', label: 'Driving licence' },
  vehicle: { iconName: 'car-outline', label: 'Vehicle licence' },
  report: { iconName: 'warning-outline', label: 'Road report' },
  application: { iconName: 'document-text-outline', label: 'Application' },
  payment: { iconName: 'card-outline', label: 'Payment' },
  road: { iconName: 'trail-sign-outline', label: 'Road status' },
  office: { iconName: 'location-outline', label: 'Office' },
  general: { iconName: 'chatbubble-outline', label: 'Message' },
};

function inferMessageTopic(item) {
  if (item?.type && MESSAGE_TOPICS[item.type]) {
    return MESSAGE_TOPICS[item.type];
  }

  const text = `${item?.title || ''} ${item?.message || ''}`.toLowerCase();

  if (text.includes('driver licence') || text.includes('driving licence') || text.includes('learner')) {
    return MESSAGE_TOPICS.driver;
  }
  if (text.includes('vehicle') || text.includes('registration') || text.includes('licence disc')) {
    return MESSAGE_TOPICS.vehicle;
  }
  if (text.includes('report') || text.includes('pothole') || text.includes('damage')) {
    return MESSAGE_TOPICS.report;
  }
  if (text.includes('application') || text.includes('pln')) {
    return MESSAGE_TOPICS.application;
  }
  if (text.includes('payment') || text.includes('paid') || text.includes('invoice')) {
    return MESSAGE_TOPICS.payment;
  }
  if (text.includes('road status') || text.includes('road closure')) {
    return MESSAGE_TOPICS.road;
  }
  if (text.includes('office')) {
    return MESSAGE_TOPICS.office;
  }

  return MESSAGE_TOPICS.general;
}

function MessageTopicIcon({ item, size = 40 }) {
  const topic = inferMessageTopic(item);

  return (
    <View style={[styles.topicIconWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={topic.iconName} size={size * 0.45} color={PRIMARY} />
    </View>
  );
}

function filterItems(items, query) {
  if (!query?.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
  );
}

function isExpiredDate(dateValue) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return new Date(dateValue) < today;
}

function NotificationCard({ item, onMoveToMessages }) {
  const isExpired = isExpiredDate(item.dueDate);
  const topic = inferMessageTopic(item);

  return (
    <View style={styles.notificationCard}>
      <View style={styles.cardRow}>
        <MessageTopicIcon item={item} />
        <View style={styles.cardBody}>
          <Text style={styles.topicLabel}>{topic.label}</Text>
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
      </View>
    </View>
  );
}

function MessageCard({ item }) {
  const topic = inferMessageTopic(item);

  return (
    <View style={styles.messageCard}>
      <View style={styles.cardRow}>
        <MessageTopicIcon item={item} />
        <View style={styles.cardBody}>
          <Text style={styles.topicLabel}>{topic.label}</Text>
          <Text style={styles.messageTitle}>{item.title}</Text>
          <Text style={styles.messageBody}>{item.message}</Text>
        </View>
      </View>
    </View>
  );
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(
    () => filterItems(notifications, searchQuery),
    [notifications, searchQuery]
  );
  const filteredMessages = useMemo(
    () => filterItems(messages, searchQuery),
    [messages, searchQuery]
  );

  const hasSearch = !!searchQuery.trim();
  const hasFilteredNotifications = filteredNotifications.length > 0;
  const hasFilteredMessages = filteredMessages.length > 0;
  const hasNoSearchResults = hasSearch && !hasFilteredNotifications && !hasFilteredMessages;

  const handleMoveToMessages = (notification) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    setMessages((prev) => [{ ...notification, movedAt: new Date().toISOString() }, ...prev]);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SearchBar
        placeholder="Search messages"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search messages"
      />

      {hasNoSearchResults ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No messages match your search.</Text>
        </View>
      ) : null}

      {!hasNoSearchResults && hasFilteredNotifications ? (
        filteredNotifications.map((item) => (
          <NotificationCard key={item.id} item={item} onMoveToMessages={handleMoveToMessages} />
        ))
      ) : !hasNoSearchResults && !hasSearch && notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No new messages.</Text>
        </View>
      ) : null}

      {!hasNoSearchResults && hasFilteredMessages ? (
        filteredMessages.map((item) => <MessageCard key={`m-${item.id}`} item={item} />)
      ) : !hasNoSearchResults && !hasSearch && messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No messages yet.</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  notificationCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  topicIconWrap: {
    backgroundColor: PRIMARY + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: {
    ...typography.caption,
    color: PRIMARY,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10,
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
