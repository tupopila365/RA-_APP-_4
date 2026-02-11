import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import { plnService } from '../services/plnService';

import { EmptyState } from '../components/EmptyState';
import { LoadingOverlay, UnifiedButton, UnifiedCard } from '../components';
import { PasswordVerificationModal } from '../components/PasswordVerificationModal';

const getStatusColor = (status, colors) => {
  const s = (status || '').toLowerCase();
  if (s.includes('approv') || s.includes('paid') || s.includes('ready') || s.includes('complet')) return colors.success;
  if (s.includes('review') || s.includes('pending') || s.includes('submitted')) return colors.secondary;
  if (s.includes('payment')) return colors.primary;
  if (s.includes('reject') || s.includes('declin') || s.includes('expired')) return colors.error;
  return colors.textSecondary;
};

const getStatusLabel = (status) => {
  if (!status) return 'In Progress';
  const s = status.toString().trim();
  const map = {
    pending: 'Submitted',
    submitted: 'Submitted',
    pending_review: 'Under Review',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Declined',
    declined: 'Declined',
    payment_required: 'Payment Pending',
    payment_pending: 'Payment Pending',
    payment_received: 'Payment Received',
    paid: 'Payment Received',
    plates_ordered: 'Plates Ordered',
    ready_for_collection: 'Ready for Collection',
    completed: 'Ready for Collection',
    expired: 'Expired',
  };
  return map[s.toLowerCase().replace(/[\s-]+/g, '_')] || s;
};

export default function MyApplicationsScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVerified, setPasswordVerified] = useState(false);

  const loadApplications = async () => {
    try {
      setError(null);
      if (!user) {
        setApplications([]);
        return;
      }
      const data = await plnService.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading PLN applications:', err);
      const msg = err.message || 'Failed to load applications';
      setError(msg);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    if (user && passwordVerified) {
      loadApplications();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, passwordVerified]);

  const onRefresh = () => {
    if (passwordVerified) {
      setRefreshing(true);
      loadApplications();
    }
  };

  const handlePasswordVerified = () => {
    setPasswordVerified(true);
  };

  const handlePasswordCancel = () => {
    navigation?.goBack();
  };

  const handleApplicationPress = (app) => {
    navigation?.navigate('PLNTracking', {
      referenceId: app?.referenceId ?? '',
      pin: app?.trackingPin ?? '',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const styles = getStyles(colors, insets);

  // Password verification modal (when logged in but not yet verified)
  if (user && !passwordVerified) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <PasswordVerificationModal
          visible={true}
          title="Verify Your Identity"
          message="Enter your password to view your applications."
          userEmail={user?.email}
          onVerified={handlePasswordVerified}
          onCancel={handlePasswordCancel}
        />
      </SafeAreaView>
    );
  }

  // Not logged in
  if (!user && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          overScrollMode="always"
        >
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="person-outline"
              title="Log in required"
              message="Sign in to view your PLN applications."
              primaryActionLabel="Log In"
              onPrimaryAction={() => navigation?.navigate('Auth', { screen: 'Login' })}
              secondaryActionLabel="Create Account"
              onSecondaryAction={() => navigation?.navigate('Auth', { screen: 'Register' })}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && applications.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>{error}</Text>
          <UnifiedButton
            label="Retry"
            onPress={loadApplications}
            variant="primary"
            size="medium"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
      >
        {applications.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <EmptyState
              icon="document-text-outline"
              title="No applications yet"
              message="You haven't submitted any PLN applications. Apply for personalized number plates to get started."
              primaryActionLabel="Apply for PLN"
              onPrimaryAction={() => navigation?.navigate('PLNApplication')}
            />
          </View>
        ) : (
          <View style={styles.content}>
            {applications.map((app, index) => (
              <UnifiedCard
                key={app?.id ?? index}
                style={styles.card}
                onPress={() => handleApplicationPress(app)}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="card-outline" size={28} color={colors.primary} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.referenceId} numberOfLines={1}>
                      {app.referenceId || 'Unknown reference'}
                    </Text>
                    <Text style={styles.fullName} numberOfLines={1}>
                      {app.fullName || app.surname || 'Applicant'}
                    </Text>
                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(app.status, colors) + '15' },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(app.status, colors) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(app.status, colors) },
                          ]}
                        >
                          {getStatusLabel(app.status)}
                        </Text>
                      </View>
                      <Text style={styles.dateText}>
                        {formatDate(app.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </UnifiedCard>
            ))}
          </View>
        )}
      </ScrollView>
      <LoadingOverlay loading={loading} message="Loading applications..." />
    </SafeAreaView>
  );
}

function getStyles(colors, insets = { bottom: 0 }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: Math.max(20, insets.bottom + 24),
    },
    emptyStateContainer: {
      flex: 1,
      minHeight: 300,
      justifyContent: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 24,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textInverse || '#FFFFFF',
    },
    content: {
      paddingBottom: 12,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.cardBackground || colors.card || colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    cardContent: {
      flex: 1,
    },
    referenceId: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    fullName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 10,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
  });
}
