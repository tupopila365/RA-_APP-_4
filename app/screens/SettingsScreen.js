import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  BackHandler,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { RATheme } from '../theme/colors';
import { SectionTitle, ListItem, Button } from '../components';
import { spacing } from '../theme/spacing';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import { typography } from '../theme/typography';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { user, logout } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

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

  const handleDarkModeToggle = (value) => {
    setDarkModeEnabled(value);
    // Note: In a real app, you'd save this preference and update the theme
    // For now, this is handled by the system color scheme
    Alert.alert(
      'Theme Changed',
      'Please restart the app to apply the theme change, or use your device settings to change the system theme.'
    );
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

  const styles = getStyles(colors, screenWidth);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Profile Section */}
        {user && (
          <View style={styles.profileSection}>
            <View style={styles.profileCard}>
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
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>My Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B35' + '20' }]}>
                <Ionicons name="notifications-outline" size={24} color="#FF6B35" />
              </View>
              <Text style={styles.quickActionText}>Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#28A745' + '20' }]}>
                <Ionicons name="help-circle-outline" size={24} color="#28A745" />
              </View>
              <Text style={styles.quickActionText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#6F42C1' + '20' }]}>
                <Ionicons name="chatbubble-outline" size={24} color="#6F42C1" />
              </View>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon="shield-checkmark-outline"
              title="Security Settings"
              subtitle="Manage your account security"
              onPress={() => Alert.alert('Security', 'Security settings coming soon')}
              colors={colors}
            />
            <SettingsItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => Alert.alert('Password', 'Change password coming soon')}
              colors={colors}
              showDivider
            />
            <SettingsItem
              icon="finger-print-outline"
              title="Biometric Login"
              subtitle="Use fingerprint or face ID"
              onPress={() => Alert.alert('Biometric', 'Biometric login coming soon')}
              colors={colors}
              showDivider
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive updates and alerts"
              type="toggle"
              value={notificationsEnabled}
              onToggle={handleNotificationToggle}
              colors={colors}
            />
            <SettingsItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Switch between light and dark theme"
              type="toggle"
              value={darkModeEnabled}
              onToggle={handleDarkModeToggle}
              colors={colors}
              showDivider
            />
            <SettingsItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => Alert.alert('Language', 'Language settings coming soon')}
              colors={colors}
              showDivider
            />
          </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.settingsCard}>
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
              showDivider
            />
          </View>
        </View>

        {/* Sign Out */}
        {user && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
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
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 100,
    },
    
    // Profile Section
    profileSection: {
      marginBottom: 24,
      marginTop: 20, // Normal top margin instead of overlap
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
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
    
    // Quick Actions
    quickActionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    quickActionItem: {
      width: (screenWidth - 60) / 4,
      alignItems: 'center',
      marginBottom: 16,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    
    // Sections
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      letterSpacing: -0.3,
    },
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    
    // Settings Items
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
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
      marginRight: 12,
    },
    settingsItemText: {
      flex: 1,
    },
    settingsItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    settingsItemSubtitle: {
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
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
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#FF3B30' + '20',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FF3B30',
      marginLeft: 8,
    },
    
    // Footer
    footer: {
      alignItems: 'center',
      marginTop: 32,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}

