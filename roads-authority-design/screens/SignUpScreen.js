import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import { FormInput, BoldMainHeader, FormDropdown, FormCancelButton, FormNextButton } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

const CAPACITY_OPTIONS = [
  { value: 'individual', label: 'INDIVIDUAL' },
  { value: 'company', label: 'COMPANY' },
];

const IDENTIFICATION_TYPE_OPTIONS = [
  { value: 'traffic-register-number', label: 'TRAFFIC REGISTER NUMBER' },
  { value: 'namibian-id-document', label: 'NAMIBIAN ID DOCUMENT' },
];

export function SignUpScreen({ onGoToSignIn }) {
  const [capacity, setCapacity] = useState('individual');
  const [initials, setInitials] = useState('');
  const [surname, setSurname] = useState('');
  const [identificationType, setIdentificationType] = useState('traffic-register-number');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const validate = () => {
    const next = {};
    if (!initials.trim()) next.initials = 'Initials are required';
    if (!surname.trim()) next.surname = 'Surname is required';
    if (!identificationType) next.identificationType = 'Identification type is required';
    if (!identificationNumber.trim()) next.identificationNumber = 'Identification number is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canSubmit =
    !!initials.trim() &&
    !!surname.trim() &&
    !!identificationType &&
    !!identificationNumber.trim();

  const handleSignUp = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      Alert.alert('Details captured', 'Personal details captured successfully.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onGoToSignIn?.();
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BoldMainHeader title="Identify Applicant" />
          <View style={styles.card} ref={contentRef} collapsable={false}>
            <FormDropdown
              label="In which capacity are you?"
              required
              options={CAPACITY_OPTIONS}
              value={capacity}
              onSelect={setCapacity}
            />
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <FormInput
              label="Initials"
              required
              value={initials}
              onChangeText={(v) => { setInitials(v); setErrors((e) => ({ ...e, initials: undefined })); }}
              placeholder="Enter initials"
              autoCapitalize="characters"
              error={errors.initials}
              onFocusWithRef={onFocusWithRef}
            />
            <FormInput
              label="Surname"
              required
              value={surname}
              onChangeText={(v) => { setSurname(v); setErrors((e) => ({ ...e, surname: undefined })); }}
              placeholder="Enter surname"
              autoCapitalize="words"
              error={errors.surname}
              onFocusWithRef={onFocusWithRef}
            />
            <FormDropdown
              label="Identification Type"
              required
              options={IDENTIFICATION_TYPE_OPTIONS}
              value={identificationType}
              onSelect={(v) => { setIdentificationType(v); setErrors((e) => ({ ...e, identificationType: undefined })); }}
              error={errors.identificationType}
            />
            <FormInput
              label="Identification Number"
              required
              value={identificationNumber}
              onChangeText={(v) => { setIdentificationNumber(v); setErrors((e) => ({ ...e, identificationNumber: undefined })); }}
              placeholder="Enter identification number"
              autoCapitalize="characters"
              error={errors.identificationNumber}
              onFocusWithRef={onFocusWithRef}
            />
            <View style={styles.actionRow}>
              <FormCancelButton onPress={handleCancel} />
              <FormNextButton
                label="Next"
                onPress={handleSignUp}
                enabled={canSubmit}
                loading={submitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.xxxl,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeading: {
    ...typography.h4,
    color: PRIMARY,
    marginBottom: spacing.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
