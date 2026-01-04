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

export default function ProcurementPlanScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  // Annual Procurement Plans - Add your documents here
  // Each plan should have: fiscalYear (e.g., "2022 - 2023") and downloadUrl
  const annualPlans = [
    {
      id: 'plan-1',
      fiscalYear: '2022 - 2023',
      downloadUrl: '', // Add download URL here
    },
    {
      id: 'plan-2',
      fiscalYear: '2021 - 2022',
      downloadUrl: '', // Add download URL here
    },
    {
      id: 'plan-3',
      fiscalYear: '2020 - 2021',
      downloadUrl: '', // Add download URL here
    },
    {
      id: 'plan-4',
      fiscalYear: '2024 - 2025',
      downloadUrl: '', // Add download URL here
    },
    {
      id: 'plan-5',
      fiscalYear: '2023 - 2024',
      downloadUrl: '', // Add download URL here
    },
    {
      id: 'plan-6',
      fiscalYear: '2025 - 2026',
      downloadUrl: '', // Add download URL here
    },
    // Add more annual plans here
  ];

  const handleDownload = (plan) => {
    if (!plan.downloadUrl) {
      // TODO: Implement download functionality
      console.log('Download:', plan.fiscalYear);
      return;
    }
    // TODO: Implement actual download using documentDownloadService
    console.log('Download:', plan.fiscalYear, plan.downloadUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={RAIcon} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Procurement Plan</Text>
          <Text style={styles.headerSubtitle}>Roads Authority Namibia</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.headerLine, { backgroundColor: colors.primary }]} />
            <Text style={styles.sectionTitle}>Annual Procurement Plans</Text>
          </View>

          {annualPlans.map((plan) => (
            <View key={plan.id} style={styles.documentItem}>
              <Text style={styles.documentTitle}>{plan.fiscalYear} Annual Procurement Plan</Text>
              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                onPress={() => handleDownload(plan)}
                activeOpacity={0.8}
                accessibilityLabel={`Download ${plan.fiscalYear} Annual Procurement Plan`}
                accessibilityRole="button"
              >
                <Ionicons name="download-outline" size={18} color="#FFFFFF" style={styles.downloadIcon} />
                <Text style={styles.downloadButtonText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
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
    section: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerLine: {
      width: 4,
      height: 24,
      borderRadius: 2,
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    documentItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    documentTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
      marginBottom: 12,
      lineHeight: 22,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    downloadIcon: {
      marginRight: 8,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
