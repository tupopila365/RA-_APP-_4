import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import RAIcon from '../assets/icon.png';

export default function ProcurementScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  const menuItems = [
    {
      id: 'legislation',
      title: 'Legislation',
      icon: 'document-text-outline',
      onPress: () => navigation?.navigate('ProcurementLegislation'),
    },
    {
      id: 'procurement-plan',
      title: 'Procurement Plan',
      icon: 'calendar-outline',
      onPress: () => navigation?.navigate('ProcurementPlan'),
    },
    {
      id: 'opening-register',
      title: 'Opening Register',
      icon: 'list-outline',
      onPress: () => navigation?.navigate('OpeningRegister'),
    },
    {
      id: 'bids-rfqs',
      title: 'Bids/RFQs',
      icon: 'file-tray-full-outline',
      onPress: () => navigation?.navigate('BidsRFQs'),
    },
  ];

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Image source={RAIcon} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Procurement</Text>
          <Text style={styles.headerSubtitle}>Roads Authority Namibia</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={item.icon} size={32} color={colors.primary} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
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
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      paddingVertical: 24,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    menuContainer: {
      gap: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });
}



