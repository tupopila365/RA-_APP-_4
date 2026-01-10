import React from 'react';
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
import { Button } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import RAIcon from '../assets/icon.png';

export default function WelcomeScreen({ navigation, onComplete }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleContinue = () => {
    navigation.replace('NotificationPermission', { onComplete });
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
              <Text style={styles.appName}>Roads Authority</Text>
              <Text style={styles.appTagline}>Namibia</Text>
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
          <Text style={styles.title}>Welcome to RA</Text>
          <Text style={styles.description}>
            Your all-in-one digital gateway to safer roads and essential road services in Namibia
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="construct" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Report Road Issues</Text>
                <Text style={styles.featureDescription}>
                  Snap a photo, pin the location, and track progress until it's fixed
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="card" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Personalized Plates</Text>
                <Text style={styles.featureDescription}>
                  Apply for custom number plates online with ease
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="document-text" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Procurement & Tenders</Text>
                <Text style={styles.featureDescription}>
                  Access procurement plans, awards, and tender opportunities
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: '#9C27B0' }]}>
                <Ionicons name="newspaper" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>News & Updates</Text>
                <Text style={styles.featureDescription}>
                  Stay informed about road works, traffic, and RA announcements
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: '#E91E63' }]}>
                <Ionicons name="information-circle" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Road Status</Text>
                <Text style={styles.featureDescription}>
                  Check road conditions, closures, and ongoing maintenance works
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: '#00BCD4' }]}>
                <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI Assistant</Text>
                <Text style={styles.featureDescription}>
                  Get instant answers to your questions about RA services
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconContainer, { backgroundColor: '#F44336' }]}>
                <Ionicons name="location" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Find RA Offices</Text>
                <Text style={styles.featureDescription}>
                  Locate the nearest Roads Authority and NATIS offices
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.note}>
            In the next step, we'll ask for location permission to help you get the most out of the app.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            label="Get Started"
            onPress={handleContinue}
            size="large"
            fullWidth
            iconName="arrow-forward"
            style={styles.continueButton}
          />
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
    marginTop: spacing.xl,
  },
  logoWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    padding: 12,
    marginBottom: spacing.lg,
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
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 2,
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
    marginBottom: spacing.xl,
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
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  featuresList: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    ...typography.bodyLarge,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
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
    marginTop: spacing.lg,
  },
  continueButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

