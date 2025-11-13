import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function MoreMenuScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  const menuItems = [
    {
      id: 1,
      title: 'RA Chatbot',
      icon: 'chatbubbles',
      color: '#9B59B6',
      screen: 'Chatbot',
    },
    {
      id: 2,
      title: 'FAQs',
      icon: 'help-circle',
      color: '#E67E22',
      screen: 'FAQs',
    },
    {
      id: 3,
      title: 'Find Offices',
      icon: 'location',
      color: '#3498DB',
      screen: 'FindOffices',
    },
    {
      id: 4,
      title: 'Settings',
      icon: 'settings',
      color: '#95A5A6',
      screen: 'Settings',
    },
  ];

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSubtitle}>Additional features and settings</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={32} color={item.color} />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
    header: {
      marginBottom: 30,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    menuItem: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    menuIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    menuItemText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
  });
}

