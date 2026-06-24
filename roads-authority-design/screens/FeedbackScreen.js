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
import {
  FormInput,
  BoldMainHeader,
  FormCancelButton,
  FormNextButton,
} from '../components';
import { FormDropdown } from '../components/FormDropdown';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';

const FEEDBACK_TYPE_OPTIONS = [
  { value: 'natis', label: 'NATIS SERVICES' },
  { value: 'mobile-app', label: 'MOBILE APPLICATION' },
  { value: 'roads-authority', label: 'ROADS AUTHORITY SERVICE' },
  { value: 'other', label: 'OTHER' },
];

export function FeedbackScreen({ onBack, onSubmit }) {
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const canSubmit = !!feedbackType && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!feedbackType) {
      Alert.alert('Feedback', 'Please select a category.');
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Feedback', 'Please enter your message.');
      return;
    }

    setSubmitting(true);
    try {
      // Backend integration is paused for now; submit locally only.
      onSubmit?.({ category: feedbackType, message: trimmed });
      setFeedbackType('');
      setMessage('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <BoldMainHeader title="Feedback" />
          <View style={styles.card} ref={contentRef} collapsable={false}>
            <Text style={styles.sectionTitle}>Share your feedback</Text>

            <FormDropdown
              label="Feedback Category"
              required
              options={FEEDBACK_TYPE_OPTIONS}
              value={feedbackType}
              onSelect={setFeedbackType}
            />

            <FormInput
              label="Message"
              required
              value={message}
              onChangeText={setMessage}
              placeholder="Type your feedback here..."
              multiline
              numberOfLines={5}
              maxLength={800}
              onFocusWithRef={onFocusWithRef}
            />

            <Text style={styles.helperText}>{message.length}/800</Text>

            <View style={styles.actionRow}>
              <FormCancelButton label="Cancel" onPress={onBack} />
              <FormNextButton
                label="Send"
                onPress={handleSubmit}
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
  sectionTitle: {
    ...typography.sectionTitle,
    color: NEUTRAL_COLORS.gray700,
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    textAlign: 'right',
    marginTop: -spacing.sm,
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
