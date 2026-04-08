import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS, PRIMARY, RA_YELLOW } from '../theme/colors';

/** Green for PLN "Start application" button (slightly brighter) */
const PLN_START_BUTTON_GREEN = '#3CB371';

export function PLNApplicationInfoScreen({ onBack, onStartApplication, isLoggedIn, onSignInRequired }) {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  const handlePrimaryAction = () => {
    if (isLoggedIn) {
      onStartApplication?.();
    } else {
      onSignInRequired?.();
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Apply for a Public Road Transport Permit (PLN) with the Roads Authority.
      </Text>

      {/* PLN Sample Preview */}
      <Text style={styles.sectionTitle}>Sample PLN Permit</Text>
      <TouchableOpacity
        style={styles.imageCard}
        activeOpacity={0.85}
        onPress={() => setImagePreviewVisible(true)}
      >
        <Image
          source={require('../assets/PLN.png')}
          style={styles.previewImage}
          resizeMode="contain"
        />
        <View style={styles.imageTapHint}>
          <Ionicons name="expand-outline" size={14} color={NEUTRAL_COLORS.gray600} />
          <Text style={styles.imageTapHintText}>Tap to enlarge</Text>
        </View>
      </TouchableOpacity>

      {/* Full-screen image preview modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setImagePreviewVisible(false)}
          >
            <Ionicons name="close-circle" size={34} color={NEUTRAL_COLORS.white} />
          </TouchableOpacity>
          <Image
            source={require('../assets/PLN.png')}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {!isLoggedIn && (
        <View style={styles.signInBanner}>
          <Ionicons name="lock-closed-outline" size={20} color={NEUTRAL_COLORS.gray700} />
          <Text style={styles.signInBannerText}>You must be signed in to submit a PLN application.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>What you need</Text>
      <View style={styles.bulletList}>
        <BulletItem text="Completed application form" />
        <BulletItem text="Vehicle type and seating capacity details" />
        <BulletItem text="Route description or taxi rank information" />
        <BulletItem text="Motivation letter" />
        <BulletItem text="Certified ID and certificate of conduct" />
        <BulletItem text="Application fee payment" />
      </View>

      <Text style={styles.sectionTitle}>Permit types</Text>
      <Text style={styles.body}>
        Domestic road transport, cross-border transport, and abnormal load permits. Applications are processed via a gazette process; objections may be submitted within 21 days of publication.
      </Text>

      <Text style={styles.note}>
        You can submit at any NaTIS regional office or the Windhoek permits office. For enquiries: 061 444 450 or permits@ra.org.na
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={handlePrimaryAction}
      >
        <Text style={styles.primaryButtonText}>
          {isLoggedIn ? 'Start application' : 'Sign in to start application'}
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

function BulletItem({ text }) {
  return (
    <View style={styles.bulletRow}>
      <Ionicons name="ellipse" size={6} color={RA_YELLOW} style={styles.bulletIcon} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
    textAlign: 'left',
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  body: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    lineHeight: 22,
  },
  bulletList: {
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bulletIcon: {
    marginRight: spacing.sm,
  },
  bulletText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
  },
  note: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.gray100,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  signInBannerText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray700,
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PLN_START_BUTTON_GREEN,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.xxl,
  },
  primaryButtonText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
  imageCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  imageTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.gray100,
    backgroundColor: NEUTRAL_COLORS.gray50,
  },
  imageTapHintText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '95%',
    height: '80%',
  },
});
