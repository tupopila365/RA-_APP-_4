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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { notificationsService } from '../services/notificationsService';

import {
  UnifiedCard,
  UnifiedButton,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { NoDataDisplay } from '../components/NoDataDisplay';

const TYPE_FILTERS = ['All', 'News', 'Tenders', 'Vacancies', 'General'];
const TYPE_MAP = { All: null, News: 'news', Tenders: 'tender', Vacancies: 'vacancy', General: 'general' };

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
};

const getNotificationIcon = (type) => {
  const map = { news: 'newspaper', tender: 'document-text', vacancy: 'briefcase', general: 'information-circle' };
  return map[type] || 'notifications';
};

const getTypeColor = (type, colors) => {
  const map = {
    news: colors.primary,
    tender: colors.secondary,
    vacancy: colors.success,
    general: colors.textSecondary,
  };
  return map[type] || colors.primary;
};

export default function NotificationsScreen({ navigation }) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadNotifications = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setError(null);
      if (reset) setLoading(true);
      else setLoadingMore(true);

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
  }, []);

  useEffect(() => {
    loadNotifications(1, true);
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(1, true);
  }, [loadNotifications]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) loadNotifications(page + 1, false);
  }, [loadingMore, hasMore, page, loadNotifications]);

  const filteredNotifications = useMemo(() => {
    const type = TYPE_MAP[selectedFilter];
    if (!type) return notifications;
    return notifications.filter((n) => n.type === type);
  }, [notifications, selectedFilter]);

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Alerts',
      'Remove all alerts from this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
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

  const hasRelatedContent = (notification) => {
    if (!notification) return false;
    const { type, relatedId, data } = notification;
    if (type === 'general') return false;
    return (type === 'news' && relatedId) || type === 'tender' || type === 'vacancy' || !!data?.screen;
  };

  const handleViewRelated = () => {
    if (!selectedNotification) return;
    const { type, relatedId, data } = selectedNotification;
    setShowDetailModal(false);

    if (type === 'news' && relatedId) {
      navigation.navigate('News', { screen: 'NewsDetail', params: { id: relatedId } });
    } else if (type === 'tender') {
      navigation.navigate('Procurement', { screen: 'ProcurementMain' });
    } else if (type === 'vacancy') {
      navigation.navigate('Vacancies');
    } else if (data?.screen) {
      navigation.navigate(data.screen, data.params || {});
    }
  };

  const getActionLabel = (type) => {
    const map = { news: 'View Article', tender: 'View Tender', vacancy: 'View Vacancy' };
    return map[type] || 'View Details';
  };

  const styles = getStyles(colors);

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingSpinner fullScreen message="Loading alerts..." />
      </SafeAreaView>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ErrorState
          message={error}
          onRetry={() => loadNotifications(1, true)}
          fullScreen
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 60) loadMore();
        }}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeTitle}>Alerts</Text>
          <Text style={styles.welcomeSubtitle}>
            Notifications and updates from Roads Authority
          </Text>
        </View>

        {notifications.length > 0 && (
          <>
            <View style={styles.toolbarRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
              >
                {TYPE_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedFilter === filter && styles.filterChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {selectedFilter !== 'All' && (
              <View style={styles.resultsRow}>
                <Text style={styles.resultsCount}>
                  {filteredNotifications.length} {filteredNotifications.length === 1 ? 'alert' : 'alerts'}
                </Text>
              </View>
            )}
          </>
        )}

        {filteredNotifications.length > 0 ? (
          <View style={styles.content}>
            {filteredNotifications.map((notification) => {
              const typeColor = getTypeColor(notification.type, colors);
              return (
                <UnifiedCard
                  key={notification.id}
                  variant="elevated"
                  padding="large"
                  onPress={() => handleNotificationPress(notification)}
                  style={styles.alertCard}
                  accessible
                  accessibilityLabel={`${notification.title}, ${formatTimeAgo(notification.sentAt)}`}
                  accessibilityHint="Double tap to view details"
                >
                  <View style={styles.alertRow}>
                    <View style={[styles.iconWrap, { backgroundColor: typeColor + '18' }]}>
                      <Ionicons
                        name={getNotificationIcon(notification.type)}
                        size={24}
                        color={typeColor}
                      />
                    </View>
                    <View style={styles.alertBody}>
                      <View style={styles.alertHeader}>
                        <Text style={styles.alertTitle} numberOfLines={2}>
                          {notification.title}
                        </Text>
                        <Text style={styles.alertTime}>
                          {formatTimeAgo(notification.sentAt)}
                        </Text>
                      </View>
                      <Text style={styles.alertPreview} numberOfLines={2}>
                        {notification.body}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </View>
                </UnifiedCard>
              );
            })}

            {loadingMore && (
              <View style={styles.loadingMore}>
                <LoadingSpinner size="small" message="Loading more..." />
              </View>
            )}

            {!hasMore && (
              <View style={styles.endRow}>
                <Text style={styles.endText}>You're all caught up</Text>
              </View>
            )}
          </View>
        ) : (
          <NoDataDisplay
            preset="notifications"
            message={
              notifications.length === 0
                ? 'You will see alerts here when they arrive.'
                : `No ${selectedFilter.toLowerCase()} alerts.`
            }
            style={styles.emptyState}
          />
        )}
      </ScrollView>

      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selectedNotification && (
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalInner}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalIconWrap,
                      {
                        backgroundColor:
                          getTypeColor(selectedNotification.type, colors) + '18',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(selectedNotification.type)}
                      size={28}
                      color={getTypeColor(selectedNotification.type, colors)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                <Text style={styles.modalTime}>
                  {formatTimeAgo(selectedNotification.sentAt)}
                </Text>

                <View style={styles.modalDivider} />

                <Text style={styles.modalBody}>{selectedNotification.body}</Text>

                {hasRelatedContent(selectedNotification) && (
                  <UnifiedButton
                    label={getActionLabel(selectedNotification.type)}
                    onPress={handleViewRelated}
                    variant="primary"
                    size="large"
                    iconName="arrow-forward"
                    iconPosition="right"
                    fullWidth
                    style={styles.modalButton}
                  />
                )}
              </ScrollView>
            )}
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
      backgroundColor: colors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    welcomeRow: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    welcomeTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.xs,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    welcomeSubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    filterContainer: {
      flex: 1,
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      minWidth: 72,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      ...typography.bodySmall,
      fontWeight: '500',
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    filterChipTextActive: {
      color: colors.textInverse || '#FFFFFF',
      fontWeight: '600',
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      gap: 4,
      marginLeft: spacing.sm,
    },
    clearButtonText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.error,
    },
    resultsRow: {
      paddingBottom: spacing.sm,
    },
    resultsCount: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    content: {
      paddingTop: spacing.xs,
    },
    alertCard: {
      marginBottom: spacing.lg,
    },
    alertRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    alertBody: {
      flex: 1,
      marginRight: spacing.sm,
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    alertTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    alertTime: {
      ...typography.caption,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    alertPreview: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    loadingMore: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    endRow: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    endText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    emptyState: {
      minHeight: 280,
      paddingVertical: spacing.xxxl,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.backgroundSecondary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    },
    modalHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    modalScroll: {
      flex: 1,
    },
    modalInner: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    modalIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      ...typography.h4,
      color: colors.text,
      marginBottom: spacing.sm,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    modalTime: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    modalDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing.lg,
    },
    modalBody: {
      ...typography.body,
      color: colors.text,
      lineHeight: 24,
      marginBottom: spacing.xl,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    modalButton: {
      marginTop: spacing.md,
    },
  });
}
