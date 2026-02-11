import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { UnifiedCard } from '../components/UnifiedCard';
import { UnifiedButton } from '../components/UnifiedButton';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function ReportConfirmationScreen({ route }) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { referenceCode } = route.params || {};
  const [copied, setCopied] = useState(false);

  const styles = getStyles(colors);

  const handleCopyReference = async () => {
    if (!referenceCode) return;
    try {
      await Clipboard.setStringAsync(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard not available
    }
  };

  const handleViewReports = () => {
    navigation.navigate('MyReports');
  };

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen: 'Home' },
      })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.success + '18' }]}>
            <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Report Submitted
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Thank you for helping improve road safety in Namibia.
          </Text>
        </View>

        {/* Reference Code Card */}
        {referenceCode ? (
          <UnifiedCard variant="elevated" padding="large" style={styles.referenceCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              YOUR REFERENCE CODE
            </Text>
            <View style={[styles.referenceBox, { backgroundColor: colors.primary }]}>
              <Text
                style={styles.referenceCode}
                selectable
                selectionColor={colors.primaryLight}
              >
                {referenceCode}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyReference}
              style={styles.copyRow}
              activeOpacity={0.7}
              accessibilityLabel={copied ? 'Copied' : 'Copy reference code'}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.copyText, { color: colors.primary }]}>
                {copied ? 'Copied to clipboard' : 'Copy code'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.referenceHint, { color: colors.textSecondary }]}>
              Save this code to track your report in My Reports.
            </Text>
          </UnifiedCard>
        ) : (
          <UnifiedCard variant="elevated" padding="large" style={styles.referenceCard}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              REFERENCE CODE
            </Text>
            <Text style={[styles.referenceHint, { color: colors.textSecondary }]}>
              View your reference code in My Reports.
            </Text>
          </UnifiedCard>
        )}

        {/* What happens next */}
        <UnifiedCard variant="outlined" padding="medium" style={styles.nextStepsCard}>
          <View style={styles.nextStepsHeader}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.nextStepsTitle, { color: colors.text }]}>
              What happens next
            </Text>
          </View>
          <Text style={[styles.nextStepsBody, { color: colors.textSecondary }]}>
            Your report has been received and will be reviewed by our team. You can track its status at any time in My Reports.
          </Text>
        </UnifiedCard>

        {/* Actions */}
        <View style={styles.actions}>
          <UnifiedButton
            label="View My Reports"
            onPress={handleViewReports}
            variant="primary"
            size="large"
            fullWidth
            iconName="document-text-outline"
            style={styles.actionButton}
          />
          <UnifiedButton
            label="Done"
            onPress={handleDone}
            variant="outline"
            size="large"
            fullWidth
            style={styles.actionButton}
          />
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
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xxxl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h3,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...typography.body,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: spacing.md,
    },
    referenceCard: {
      marginBottom: spacing.lg,
    },
    cardLabel: {
      ...typography.label,
      letterSpacing: 0.5,
      marginBottom: spacing.md,
    },
    referenceBox: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    referenceCode: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 2,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    copyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    copyText: {
      fontSize: 14,
      fontWeight: '600',
    },
    referenceHint: {
      ...typography.caption,
      textAlign: 'center',
      lineHeight: 18,
    },
    nextStepsCard: {
      marginBottom: spacing.xxl,
    },
    nextStepsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    nextStepsTitle: {
      ...typography.h5,
    },
    nextStepsBody: {
      ...typography.bodyMedium,
      lineHeight: 22,
    },
    actions: {
      gap: spacing.md,
    },
    actionButton: {
      minHeight: 48,
    },
  });
}
