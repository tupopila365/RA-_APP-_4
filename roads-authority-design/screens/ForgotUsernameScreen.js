import React from 'react';
import { View, Text, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BoldMainHeader, FormDropdown, FormInput, FormCancelButton, FormNextButton } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';

const CAPACITY_OPTIONS = [
  { value: 'individual', label: 'INDIVIDUAL' },
  { value: 'company', label: 'COMPANY' },
];

const IDENTIFICATION_TYPE_OPTIONS = [
  { value: 'traffic-register-number', label: 'TRAFFIC REGISTER NUMBER' },
  { value: 'namibian-id-document', label: 'NAMIBIAN ID DOCUMENT' },
];

export function ForgotUsernameScreen({ onCancel }) {
  const [capacity, setCapacity] = React.useState('individual');
  const [initials, setInitials] = React.useState('');
  const [surname, setSurname] = React.useState('');
  const [identificationType, setIdentificationType] = React.useState('traffic-register-number');
  const [identificationNumber, setIdentificationNumber] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const canContinue =
    !!initials.trim() &&
    !!surname.trim() &&
    !!identificationType &&
    !!identificationNumber.trim();

  const handleContinue = async () => {
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 400);
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
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BoldMainHeader title="Forgot Username" />
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
              onChangeText={setInitials}
              placeholder="Enter initials"
              autoCapitalize="characters"
              onFocusWithRef={onFocusWithRef}
            />
            <FormInput
              label="Surname"
              required
              value={surname}
              onChangeText={setSurname}
              placeholder="Enter surname"
              autoCapitalize="words"
              onFocusWithRef={onFocusWithRef}
            />
            <FormDropdown
              label="Identification Type"
              required
              options={IDENTIFICATION_TYPE_OPTIONS}
              value={identificationType}
              onSelect={setIdentificationType}
            />
            <FormInput
              label="Identification Number"
              required
              value={identificationNumber}
              onChangeText={setIdentificationNumber}
              placeholder="Enter identification number"
              autoCapitalize="characters"
              onFocusWithRef={onFocusWithRef}
            />

            <View style={styles.actionRow}>
              <FormCancelButton onPress={onCancel} />
              <FormNextButton
                label="Continue"
                onPress={handleContinue}
                enabled={canContinue}
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
  content: {
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
