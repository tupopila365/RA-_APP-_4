import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard, UnifiedButton } from '../components';
import { plnService } from '../services/plnService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';

export default function PLNInfoScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [isDownloadingForm, setIsDownloadingForm] = useState(false);
  const bg = colors.backgroundSecondary || colors.background;

  // Use the document download hook
  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadedUri,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  const handleApply = () => {
    navigation.navigate('PLNWizard');
  };

  const handleApplyAdvanced = () => {
    navigation.navigate('PLNApplicationEnhanced');
  };

  const handleTrackApplication = () => {
    navigation.navigate('MyApplications');
  };

  const handleDownloadForm = async () => {
    try {
      setIsDownloadingForm(true);
      const formUrl = plnService.getFormDownloadUrl();
      
      const result = await startDownload(formUrl, 'PLN-FORM');

      if (result.success) {
        Alert.alert(
          'Download Complete',
          'The PLN form has been downloaded successfully.',
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
              text: 'Share',
              onPress: async () => {
                const shareResult = await documentDownloadService.shareFile(result.uri, 'PLN-FORM.pdf');
                if (!shareResult.success) {
                  Alert.alert('Error', shareResult.error || 'Failed to share file');
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
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View style={[styles.welcomeIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="car-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Personalized Number Plates</Text>
            <Text style={styles.welcomeSubtitle}>
              Apply for your custom vehicle registration plate
            </Text>
          </View>
        </View>

        {/* What is PLN Section */}
        <UnifiedCard variant="default" padding="large" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
              What is a PLN?
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
            A Personalized Number Plate (PLN) is a license number of your choice for your vehicle.
            You can select a custom combination of letters and numbers to personalize your vehicle's
            registration plate.
          </Text>
        </UnifiedCard>

        {/* Requirements Section */}
        <UnifiedCard variant="default" padding="large" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
              Requirements
            </Text>
          </View>
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <View style={styles.ruleIcon}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
                Maximum 7 alphanumeric characters
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleIcon}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
                Followed by Namibian flag + NA
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleIcon}>
                <Ionicons name="checkmark" size={16} color={colors.success} />
              </View>
              <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
                Must not be obscene, indecent, or offensive
              </Text>
            </View>
          </View>
        </UnifiedCard>

        {/* Application Process Section */}
        <UnifiedCard variant="default" padding="large" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={colors.primary} />
            <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
              Application Process
            </Text>
          </View>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={[typography.body, { color: '#FFFFFF', fontWeight: '700' }]}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Complete Application
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
                  Fill out the application form with your details
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={[typography.body, { color: '#FFFFFF', fontWeight: '700' }]}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Provide Plate Choices
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
                  Submit 3 plate choices with meanings
                </Text>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={[typography.body, { color: '#FFFFFF', fontWeight: '700' }]}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Submit Application
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, lineHeight: 20 }]}>
                  Submit at NaTIS or Registering Authority office
                </Text>
              </View>
            </View>
          </View>
        </UnifiedCard>

        {/* Fees & Processing Times Section */}
        <UnifiedCard variant="default" padding="large" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={[typography.h4, { color: colors.text, marginLeft: spacing.sm }]}>
              Fees & Processing Times
            </Text>
          </View>
          <View style={styles.feesList}>
            <View style={styles.feeItem}>
              <View style={styles.feeIcon}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.feeContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Application Fee
                </Text>
                <Text style={[typography.h4, { color: colors.primary, marginBottom: 2 }]}>
                  N$2,000
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  Pay offline at NaTIS
                </Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <View style={styles.feeIcon}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.feeContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Payment Deadline
                </Text>
                <Text style={[typography.h4, { color: colors.primary }]}>
                  21 days after approval
                </Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <View style={styles.feeIcon}>
                <Ionicons name="construct-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.feeContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Plate Manufacturing
                </Text>
                <Text style={[typography.h4, { color: colors.primary }]}>
                  Max 5 working days
                </Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <View style={styles.feeIcon}>
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.feeContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Annual Renewal
                </Text>
                <Text style={[typography.h4, { color: colors.primary }]}>
                  N$280
                </Text>
              </View>
            </View>
            <View style={styles.feeItem}>
              <View style={styles.feeIcon}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.feeContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: '600', marginBottom: spacing.xs }]}>
                  Duplicate Plate
                </Text>
                <Text style={[typography.h4, { color: colors.primary }]}>
                  N$240
                </Text>
              </View>
            </View>
          </View>
        </UnifiedCard>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.actionSectionTitle}>Get Started</Text>
          <View style={styles.buttonContainer}>
            <UnifiedButton
              label="Start Application"
              onPress={handleApplyAdvanced}
              variant="primary"
              size="large"
              iconName="arrow-forward"
              iconPosition="right"
              fullWidth
            />
            <UnifiedButton
              label="Track Existing Application"
              onPress={handleTrackApplication}
              variant="outline"
              size="large"
              iconName="search-outline"
              iconPosition="left"
              fullWidth
            />
            <TouchableOpacity
              style={[styles.downloadFormButton, { borderColor: colors.border }]}
              onPress={handleDownloadForm}
              disabled={isDownloadingForm}
            >
              {isDownloadingForm ? (
                <Text style={[styles.downloadFormText, { color: colors.textSecondary }]}>
                  Downloading...
                </Text>
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  <Text style={[styles.downloadFormText, { color: colors.primary }]}>
                    Download Blank Form
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
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
      paddingBottom: spacing.xxxl,
    },
    welcomeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
      gap: spacing.md,
    },
    welcomeIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeText: {
      flex: 1,
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
      lineHeight: 20,
    },
    sectionCard: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rulesList: {
      gap: spacing.lg,
    },
    ruleItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    ruleIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
      borderWidth: 1,
      borderColor: colors.success,
    },
    stepsList: {
      gap: spacing.xl,
    },
    stepItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.lg,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },
    stepContent: {
      flex: 1,
      paddingTop: 2,
    },
    feesList: {
      gap: spacing.lg,
    },
    feeItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.card || colors.backgroundSecondary,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    feeIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    feeContent: {
      flex: 1,
    },
    actionSection: {
      marginTop: spacing.xl,
    },
    actionSectionTitle: {
      ...typography.h4,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    buttonContainer: {
      gap: spacing.md,
    },
    downloadFormButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      borderWidth: 1,
      gap: spacing.sm,
    },
    downloadFormText: {
      ...typography.body,
      fontWeight: '600',
    },
  });
}



