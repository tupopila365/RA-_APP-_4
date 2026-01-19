import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useColorScheme } from 'react-native';
import { notificationsService } from '../services/notificationsService';

// Import Unified Design System Components
import {
  UnifiedFormInput,
  UnifiedCard,
  UnifiedButton,
  UnifiedSkeletonLoader,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

/**
 * Format timestamp to relative time (e.g., "2 hours ago", "Yesterday", "Dec 15, 2024")
 */
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // For older dates, show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get icon name for notification type
 */
const getNotificationIcon = (type) => {
  const iconMap = {
    news: 'newspaper',
    tender: 'document-text',
    vacancy: 'briefcase',
    general: 'information-circle',
  };
  return iconMap[type] || 'notifications';
};

/**
 * Get color for notification type - all use primary color
 */
const getNotificationColor = (type, colors) => {
  return colors.primary;
};

export default function NotificationsScreen({ navigation }) {
  const { colors, colorScheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadNotifications(1, true);
  }, []);

  // Configure status bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor('transparent');
      RNStatusBar.setTranslucent(true);
    }
    RNStatusBar.setBarStyle('light-content');
    RNStatusBar.setHidden(false);
  }, []);

  const loadNotifications = async (pageNum = 1, reset = false) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await notificationsService.getUserNotifications(pageNum, 20);

      if (reset) {
        setNotifications(result.notifications || []);
      } else {
        setNotifications((prev) => [...prev, ...(result.notifications || [])]);
      }

      setHasMore(pageNum < result.totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(page + 1, false);
    }
  };


  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Alerts',
      'Are you sure you want to delete all alerts?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            setPage(1);
            setHasMore(false);
          },
        },
      ]
    );
  };

  // Check if notification has a related page to navigate to
  const hasRelatedContent = (notification) => {
    if (!notification) return false;
    const { type, relatedId, data } = notification;
    
    if (type === 'general') {
      return false;
    }
    
    return (
      (type === 'news' && relatedId) ||
      type === 'tender' ||
      type === 'vacancy' ||
      !!data?.screen
    );
  };

  const handleViewRelatedContent = () => {
    if (!selectedNotification) return;

    const { type, relatedId, data } = selectedNotification;
    setShowDetailModal(false);

    if (type === 'general') {
      return;
    }

    if (type === 'news' && relatedId) {
      navigation.navigate('News', {
        screen: 'NewsDetail',
        params: { id: relatedId },
      });
    } else if (type === 'tender') {
      navigation.navigate('Procurement', {
        screen: 'BidsRFQs',
      });
    } else if (type === 'vacancy') {
      navigation.navigate('Vacancies');
    } else if (data?.screen) {
      if (data.params) {
        navigation.navigate(data.screen, data.params);
      } else {
        navigation.navigate(data.screen);
      }
    }
  };


  const styles = getStyles(colors);

  // Show loading state on initial load
  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <UnifiedSkeletonLoader type="list-item" count={5} />
        </View>
      </View>
    );
  }

  // Show error state if initial load fails
  if (error && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          </View>
          <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginBottom: spacing.sm }]}>
            Something went wrong
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }]}>
            {error}
          </Text>
          <UnifiedButton
            label="Try Again"
            onPress={() => loadNotifications(1, true)}
            variant="primary"
            size="medium"
            iconName="refresh-outline"
            iconPosition="left"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          <>
            <View style={styles.notificationsContainer}>
              {notifications.map((notification, index) => (
                <UnifiedCard
                  key={notification.id}
                  variant="default"
                  padding="medium"
                  onPress={() => handleNotificationPress(notification)}
                  style={styles.notificationCard}
                >
                  <View style={styles.notificationRow}>
                    <View
                      style={[
                        styles.notificationIconContainer,
                        { backgroundColor: getNotificationColor(notification.type, colors) + '15' },
                      ]}
                    >
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={22}
                        color={getNotificationColor(notification.type, colors)}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={[typography.bodyLarge, { color: colors.text, flex: 1, marginRight: spacing.sm }]} numberOfLines={2}>
                          {notification.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {formatTimeAgo(notification.sentAt)}
                        </Text>
                      </View>
                      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]} numberOfLines={2}>
                        {notification.body}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </View>
                </UnifiedCard>
              ))}
            </View>

            {loadingMore && (
              <View style={styles.loadingMore}>
                <UnifiedSkeletonLoader type="circle" width={20} height={20} />
              </View>
            )}

            {!hasMore && notifications.length > 0 && (
              <View style={styles.endMessage}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  You're all caught up
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
            </View>
            <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginBottom: spacing.sm }]}>
              No alerts yet
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              You'll see notifications and alerts here when they arrive
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Notification Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <UnifiedCard variant="elevated" padding="large" style={styles.modalContent}>
              {selectedNotification && (
                <>
                  <View style={styles.modalHeader}>
                    <View
                      style={[
                        styles.modalIconContainer,
                        { backgroundColor: getNotificationColor(selectedNotification.type, colors) + '15' },
                      ]}
                    >
                      <Ionicons
                        name={getNotificationIcon(selectedNotification.type)}
                        size={28}
                        color={getNotificationColor(selectedNotification.type, colors)}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowDetailModal(false)}
                    >
                      <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    style={styles.modalScrollView} 
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>
                      {selectedNotification.title}
                    </Text>

                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
                      {formatTimeAgo(selectedNotification.sentAt)}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[typography.body, { color: colors.text, lineHeight: 24, marginBottom: spacing.xl }]}>
                      {selectedNotification.body}
                    </Text>

                    {hasRelatedContent(selectedNotification) && (
                      <UnifiedButton
                        label={
                          selectedNotification.type === 'news'
                            ? 'View Article'
                            : selectedNotification.type === 'tender'
                            ? 'View Tender'
                            : selectedNotification.type === 'vacancy'
                            ? 'View Vacancy'
                            : 'View Details'
                        }
                        onPress={handleViewRelatedContent}
                        variant="primary"
                        size="large"
                        iconName="arrow-forward"
                        iconPosition="right"
                        fullWidth
                      />
                    )}
                  </ScrollView>
                </>
              )}
            </UnifiedCard>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    loadingContainer: {
      flex: 1,
      padding: spacing.xl,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    errorIconContainer: {
      marginBottom: spacing.lg,
    },
    notificationsContainer: {
      gap: spacing.md,
    },
    notificationCard: {
      marginBottom: spacing.sm,
    },
    notificationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notificationIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    notificationContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    loadingMore: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    endMessage: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
    },
    emptyIconContainer: {
      marginBottom: spacing.lg,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      maxHeight: '85%',
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: 400,
    },
    modalScrollView: {
      flexGrow: 0,
    },
    modalScrollContent: {
      paddingBottom: spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    modalIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButton: {
      padding: spacing.xs,
    },
    divider: {
      height: 1,
      marginBottom: spacing.lg,
    },
  });
}
