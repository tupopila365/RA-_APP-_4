import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
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
import { LoadingIndicator, ErrorState, EmptyState } from '../components';

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
 * Get color for notification type
 */
const getNotificationColor = (type) => {
  const colorMap = {
    news: '#007AFF',
    tender: '#FF9500',
    vacancy: '#34C759',
    general: '#5856D6',
  };
  return colorMap[type] || '#5856D6';
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <LoadingIndicator message="Loading alerts..." />
      </SafeAreaView>
    );
  }

  // Show error state if initial load fails
  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ErrorState
          message={error}
          onRetry={() => loadNotifications(1, true)}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00B4E6']}
            tintColor="#00B4E6"
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
      >
        {notifications.length > 0 ? (
          <>
            <View style={styles.notificationsContainer}>
              {notifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                  style={[
                    styles.notificationCard,
                    { backgroundColor: colors.card },
                  ]}
                >
                  <View
                    style={[
                      styles.notificationIconContainer,
                      { backgroundColor: getNotificationColor(notification.type) + '15' },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={22}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={2}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                        {formatTimeAgo(notification.sentAt)}
                      </Text>
                    </View>
                    <Text style={[styles.notificationBody, { color: colors.textSecondary }]} numberOfLines={2}>
                      {notification.body}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            {loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#00B4E6" />
              </View>
            )}

            {!hasMore && notifications.length > 0 && (
              <View style={styles.endMessage}>
                <Text style={[styles.endMessageText, { color: colors.textSecondary }]}>
                  You're all caught up
                </Text>
              </View>
            )}
          </>
        ) : (
          <EmptyState
            message="No alerts yet"
            icon="notifications-outline"
            accessibilityLabel="No alerts available"
          />
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
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              {selectedNotification && (
                <>
                  <View style={styles.modalHeader}>
                    <View
                      style={[
                        styles.modalIconContainer,
                        { backgroundColor: getNotificationColor(selectedNotification.type) + '15' },
                      ]}
                    >
                      <Ionicons
                        name={getNotificationIcon(selectedNotification.type)}
                        size={28}
                        color={getNotificationColor(selectedNotification.type)}
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
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      {selectedNotification.title}
                    </Text>

                    <Text style={[styles.modalTime, { color: colors.textSecondary }]}>
                      {formatTimeAgo(selectedNotification.sentAt)}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.modalBodyText, { color: colors.text }]}>
                      {selectedNotification.body}
                    </Text>

                    {hasRelatedContent(selectedNotification) && (
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={handleViewRelatedContent}
                      >
                        <Text style={styles.viewButtonText}>
                          {selectedNotification.type === 'news'
                            ? 'View Article'
                            : selectedNotification.type === 'tender'
                            ? 'View Tender'
                            : selectedNotification.type === 'vacancy'
                            ? 'View Vacancy'
                            : 'View Details'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: 16,
      paddingBottom: 32,
    },
    notificationsContainer: {
      paddingHorizontal: 16,
    },
    notificationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    notificationIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    notificationContent: {
      flex: 1,
      marginRight: 12,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    notificationTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 20,
      marginRight: 8,
    },
    notificationTime: {
      fontSize: 12,
      fontWeight: '500',
    },
    notificationBody: {
      fontSize: 14,
      lineHeight: 19,
    },
    loadingMore: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    endMessage: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    endMessageText: {
      fontSize: 14,
      fontWeight: '500',
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
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 20,
      minHeight: 400,
    },
    modalScrollView: {
      flexGrow: 0,
    },
    modalScrollContent: {
      paddingBottom: 30,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 28,
      marginBottom: 8,
    },
    modalTime: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
    },
    divider: {
      height: 1,
      marginBottom: 20,
    },
    modalBodyText: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 24,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#00B4E6',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 14,
      gap: 8,
      marginTop: 8,
      marginBottom: 10,
      shadowColor: '#00B4E6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    viewButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
