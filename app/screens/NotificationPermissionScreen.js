import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { requestNotificationPermission } from '../utils/onboarding';
import RAIcon from '../assets/icon.png';

// Import Unified Design System Components
import {
  UnifiedButton,
} from '../components/UnifiedDesignSystem';

export default function NotificationPermissionScreen({ navigation, onComplete }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Trigger the native system permission dialog
      await requestNotificationPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setLoading(false);
      // Navigate to next screen regardless of permission result
      navigation.replace('LocationPermission', { onComplete });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00B4E6', '#0090C0', '#0078A3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.overlay} />
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Image source={RAIcon} style={styles.logo} />
              </View>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="notifications-outline" size={60} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.description}>
            Enable notifications to receive important updates about:
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Latest news and announcements</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>New job vacancies and tenders</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Traffic alerts and road closures</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Service updates and reminders</Text>
            </View>
          </View>

          <Text style={styles.note}>
            You can change this setting anytime in your device settings.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <UnifiedButton
            label="Continue"
            onPress={handleContinue}
            variant="primary"
            size="large"
            loading={loading}
            disabled={loading}
            fullWidth
            iconName="arrow-forward"
            iconPosition="right"
            style={styles.continueButton}
          />
          
          <Text style={styles.helperText}>
            Your device will ask for notification permission
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.xxl + 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    position: 'relative',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    padding: 12,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  iconContainer: {
    marginTop: spacing.md,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 120, // Extra padding to ensure buttons are visible
  },
  content: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h3,
    fontSize: 28,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyLarge,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  benefitsList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  benefitText: {
    ...typography.bodyMedium,
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  note: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  continueButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  helperText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingTop: spacing.xs,
  },
});
