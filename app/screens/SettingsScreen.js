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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by App.js based on auth state
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    ...(user ? [
      {
        title: 'Account',
        items: [
          {
            id: 0,
            title: user.fullName || 'User',
            subtitle: user.email,
            icon: 'person-circle-outline',
            type: 'info',
          },
        ],
      },
    ] : []),
    {
      title: 'Appearance',
      items: [
        {
          id: 1,
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark theme',
          icon: 'moon-outline',
          type: 'toggle',
          value: darkModeEnabled,
          onToggle: handleDarkModeToggle,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 2,
          title: 'Push Notifications',
          subtitle: 'Receive updates and announcements',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: handleNotificationToggle,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 3,
          title: 'App Version',
          subtitle: '1.0.0',
          icon: 'information-circle-outline',
          type: 'info',
        },
        {
          id: 4,
          title: 'Terms & Conditions',
          subtitle: 'View terms and conditions',
          icon: 'document-text-outline',
          type: 'action',
          onPress: () => Alert.alert('Terms & Conditions', 'Terms and conditions content...'),
        },
        {
          id: 5,
          title: 'Privacy Policy',
          subtitle: 'View privacy policy',
          icon: 'shield-checkmark-outline',
          type: 'action',
          onPress: () => Alert.alert('Privacy Policy', 'Privacy policy content...'),
        },
      ],
    },
  ];

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <SectionTitle title={section.title} />
            <View style={styles.sectionContent}>
              {section.items.map((item) => (
                <ListItem
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  iconName={item.icon}
                  type={item.type}
                  toggleValue={item.value}
                  onToggle={item.onToggle}
                  onPress={item.onPress}
                  showChevron={item.type === 'action'}
                />
              ))}
            </View>
          </View>
        ))}

        {user && (
          <View style={styles.logoutSection}>
            <Button
              label="Logout"
              onPress={handleLogout}
              style={styles.logoutButton}
              size="large"
              fullWidth
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Roads Authority Namibia</Text>
          <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.xl,
      paddingTop: spacing.xxl,
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
      marginBottom: spacing.xxxl + spacing.md,
      paddingTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border + '40',
    },
    footerText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    footerSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    logoutSection: {
      marginTop: spacing.xxl,
      marginBottom: spacing.lg,
    },
    logoutButton: {
      backgroundColor: colors.error,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
  });
}

