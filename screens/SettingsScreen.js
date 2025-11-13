import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useColorScheme,
  Appearance,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { RATheme } from '../theme/colors';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');

  useEffect(() => {
    // Check notification permissions
    checkNotificationPermissions();
  }, []);

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

  const settingsSections = [
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.settingItem}
                  onPress={item.onPress}
                  activeOpacity={item.type === 'action' ? 0.7 : 1}
                  disabled={item.type === 'info' || item.type === 'toggle'}
                >
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name={item.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={item.value ? colors.secondary : colors.textSecondary}
                    />
                  )}
                  {item.type === 'action' && (
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Roads Authority Namibia</Text>
          <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderRadius: 15,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    footer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    footerText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    footerSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}

