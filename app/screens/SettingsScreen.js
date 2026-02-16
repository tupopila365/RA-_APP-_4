import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { UnifiedCard } from '../components';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { user, logout } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check notification permissions
    checkNotificationPermissions();
  }, []);

  // Handle hardware back button on Android - navigate to Home tab
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Get parent tab navigator
        const tabNavigator = navigation?.getParent('MainTabs');
        if (tabNavigator) {
          tabNavigator.navigate('Home');
          return true; // Prevent default back behavior
        }
        // Fallback: try to navigate through root navigator
        const rootNavigator = navigation?.getParent();
        if (rootNavigator) {
          rootNavigator.navigate('MainTabs', { screen: 'Home' });
          return true;
        }
        return false; // Allow default back behavior if no parent navigator
      };

      // Add event listener for Android back button (modern subscription API)
      let backHandler;
      if (Platform.OS === 'android') {
        backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      }

      return () => {
        // Cleanup using subscription.remove()
        if (backHandler) {
          backHandler.remove();
        }
      };
    }, [navigation])
  );

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Push notifications enabled');
      } else {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings');
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by App.js based on auth state
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(() => getStyles(colors, screenWidth), [colors, screenWidth]);
  const bg = colors.backgroundSecondary || colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeTitle}>Settings</Text>
          <Text style={styles.welcomeSubtitle}>Manage your app preferences</Text>
        </View>

        {/* User Profile Section */}
        {user && (
          <View style={styles.profileSection}>
            <UnifiedCard variant="default" padding="none" style={styles.profileCard}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.fullName || 'User'}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                <Text style={styles.profileStatus}>Verified Account</Text>
              </View>
              <TouchableOpacity style={styles.profileEditButton}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </UnifiedCard>
          </View>
        )}

        {/* Account */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <UnifiedCard variant="default" padding="none" style={styles.settingsCard}>
              <SettingsItem
                icon="key-outline"
                title="Change Password"
                subtitle="Update your account password"
                onPress={() => navigation.navigate('ChangePassword')}
                colors={colors}
              />
            </UnifiedCard>
          </View>
        )}

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <UnifiedCard variant="default" padding="none" style={styles.settingsCard}>
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive updates and alerts"
              type="toggle"
              value={notificationsEnabled}
              onToggle={handleNotificationToggle}
              colors={colors}
            />
          </UnifiedCard>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <UnifiedCard variant="default" padding="none" style={styles.settingsCard}>
            <SettingsItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => Alert.alert('Help', 'Help center coming soon')}
              colors={colors}
            />
            <SettingsItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="View terms and conditions"
              onPress={() => Alert.alert('Terms & Conditions', 'Terms and conditions content...')}
              colors={colors}
              showDivider
            />
            <SettingsItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              subtitle="View privacy policy"
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content...')}
              colors={colors}
              showDivider
            />
            <SettingsItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0"
              colors={colors}
            />
          </UnifiedCard>
        </View>

        {/* Authentication Section */}
        {user ? (
          // Show Sign Out button when user is logged in
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show Log In and Create Account buttons when user is not logged in
          <View style={styles.section}>
            <View style={styles.authButtonsContainer}>
              <TouchableOpacity 
                style={[styles.authButton, styles.loginButton]} 
                onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
              >
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.authButtonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.authButton, styles.createAccountButton]} 
                onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
              >
                <Ionicons name="person-add-outline" size={20} color={colors.primary} />
                <Text style={[styles.authButtonText, { color: colors.primary }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Roads Authority Namibia</Text>
          <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Settings Item Component
function SettingsItem({ icon, title, subtitle, type, value, onToggle, onPress, colors, showDivider = false }) {
  const styles = getStyles(colors, 600); // Use a default width for styles in component
  
  return (
    <>
      <TouchableOpacity 
        style={styles.settingsItem} 
        onPress={type === 'toggle' ? undefined : onPress}
        disabled={type === 'toggle' || !onPress}
      >
        <View style={styles.settingsItemLeft}>
          <View style={[styles.settingsItemIcon, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}>
            <Ionicons name={icon} size={20} color={colors.primary} />
          </View>
          <View style={styles.settingsItemText}>
            <Text style={[styles.settingsItemTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.settingsItemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.settingsItemRight}>
          {type === 'toggle' ? (
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                { backgroundColor: value ? colors.primary : colors.border }
              ]}
              onPress={() => onToggle(!value)}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: '#FFFFFF',
                    transform: [{ translateX: value ? 16 : 2 }]
                  }
                ]}
              />
            </TouchableOpacity>
          ) : onPress ? (
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          ) : null}
        </View>
      </TouchableOpacity>
      {showDivider && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
    </>
  );
}

function getStyles(colors, screenWidth) {
  const isTablet = screenWidth > 600;
  const bg = colors.backgroundSecondary || colors.background;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bg,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    welcomeRow: {
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    welcomeTitle: {
      ...typography.h3,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    welcomeSubtitle: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
    },
    profileSection: {
      marginBottom: spacing.xl,
    },
    profileCard: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      ...typography.h4,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      ...typography.body,
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    profileStatus: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    profileEditButton: {
      padding: 8,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.h4,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    settingsCard: {
      marginBottom: 0,
      overflow: 'hidden',
    },
    
    // Settings Items
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      minHeight: 64,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    settingsItemText: {
      flex: 1,
    },
    settingsItemTitle: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    settingsItemSubtitle: {
      ...typography.caption,
      fontSize: 13,
      lineHeight: 18,
    },
    settingsItemRight: {
      marginLeft: 12,
    },
    
    // Toggle Switch
    toggleSwitch: {
      width: 44,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      position: 'relative',
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      position: 'absolute',
      // Android-safe elevation
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 2, // Reduced from 3 to 2
        },
      }),
    },
    
    // Divider
    divider: {
      height: 1,
      marginLeft: 68,
      opacity: 0.3,
    },
    
    // Sign Out Button
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    signOutText: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
      marginLeft: spacing.sm,
    },
    
    // Authentication Buttons Container
    authButtonsContainer: {
      gap: 12,
    },
    authButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    createAccountButton: {
      backgroundColor: colors.card,
      borderColor: colors.primary,
    },
    authButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    
    // Footer
    footer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      paddingTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    footerSubtext: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}

