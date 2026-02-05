import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { vehicleService } from '../services/vehicleService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';
import {
  UnifiedCard,
  UnifiedButton,
  RATheme,
  typography,
  spacing,
} from '../components/UnifiedDesignSystem';

export default function VehicleRegistrationInfoScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const applicationType = route?.params?.type || 'new';
  const isNewVehicle = applicationType === 'new';
  const [isDownloadingForm, setIsDownloadingForm] = useState(false);

  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadedUri,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  const handleApply = () => {
    navigation.navigate('VehicleRegistrationWizard', { type: applicationType });
  };

  const handleDownloadForm = async () => {
    try {
      setIsDownloadingForm(true);
      const formUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/vehicle-reg/form`;
      
      const result = await startDownload(formUrl, 'Vehicle-Registration-Form');

      if (result.success) {
        Alert.alert(
          'Download Complete',
          'The vehicle registration form has been downloaded successfully.',
          [
            {
              text: 'Open',
              onPress: async () => {
                const openResult = await documentDownloadService.openFile(result.uri);
                if (!openResult.success) {
                  Alert.alert('Error', openResult.error || 'Failed to open file');
                }
                resetDownload();
                setIsDownloadingForm(false);
              },
            },
            {
              text: 'Done',
              style: 'cancel',
              onPress: () => {
                resetDownload();
                setIsDownloadingForm(false);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Download Failed', result.error || 'Failed to download the form. Please try again.');
        setIsDownloadingForm(false);
      }
    } catch (error) {
      console.error('Error downloading form:', error);
      Alert.alert('Error', error.message || 'Failed to download the form. Please try again.');
      setIsDownloadingForm(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="car-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginBottom: spacing.sm }]}>
            Vehicle Registration
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }]}>
            {isNewVehicle ? 'Register a new vehicle' : 'Register an existing vehicle'}
          </Text>
        </View>

        {/* Information Section */}
        <UnifiedCard variant="default" padding="large">
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
              About Vehicle Registration
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
            {isNewVehicle
              ? 'Register your new vehicle with the Roads Authority. You will need to provide vehicle details, owner information, and supporting documents.'
              : 'Register an existing vehicle that has been transferred to you or needs re-registration. Please ensure you have all required documents.'}
          </Text>
        </UnifiedCard>

        {/* Requirements Section */}
        <UnifiedCard variant="default" padding="large">
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
              Required Documents
            </Text>
          </View>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <View style={styles.ruleIcon}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
                Certified copy of ID document
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleIcon}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
                Vehicle ownership documents
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleIcon}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
                Roadworthiness certificate (if applicable)
              </Text>
            </View>
          </View>
        </UnifiedCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <UnifiedButton
            variant="primary"
            size="large"
            onPress={handleApply}
            style={styles.applyButton}
          >
            <Text style={[typography.button, { color: '#FFFFFF' }]}>Start Application</Text>
          </UnifiedButton>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownloadForm}
            disabled={isDownloadingForm}
          >
            <Ionicons name="download-outline" size={20} color={colors.primary} />
            <Text style={[typography.button, { color: colors.primary, marginLeft: spacing.xs }]}>
              {isDownloadingForm ? 'Downloading...' : 'Download Form'}
            </Text>
          </TouchableOpacity>
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
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    rulesList: {
      marginTop: spacing.sm,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    ruleIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
      marginTop: 2,
    },
    actionButtons: {
      marginTop: spacing.xl,
      gap: spacing.md,
    },
    applyButton: {
      width: '100%',
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
  });
}


