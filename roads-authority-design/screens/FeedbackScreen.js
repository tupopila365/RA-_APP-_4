import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, FormInput, DropdownSelector } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { submitFeedback } from '../services/feedbackService';

const FEEDBACK_BUTTON_GREEN = '#3CB371';

const FEEDBACK_TYPE_OPTIONS = [
  { value: 'natis', label: 'NATIS services' },
  { value: 'mobile-app', label: 'Mobile application' },
  { value: 'roads-authority', label: 'Roads Authority service' },
  { value: 'other', label: 'Other' },
];

export function FeedbackScreen({ onBack }) {
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { scrollViewRef, contentRef, onFocusWithRef } = useKeyboardScroll();

  const handleSubmit = async () => {
    if (!feedbackType) {
      Alert.alert('Feedback', 'Please select a feedback category.');
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Feedback', 'Please enter your message.');
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback({ category: feedbackType, message: trimmed });
      Alert.alert('Thank you', 'Your feedback has been received. We will review it shortly.', [{ text: 'OK', onPress: onBack }]);
      setFeedbackType('');
      setMessage('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer ref={scrollViewRef} contentContainerStyle={styles.content} keyboardAware>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View ref={contentRef} collapsable={false}>
          <View style={styles.iconWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={PRIMARY} />
          </View>
          <Text style={styles.subtitle}>
            Help us improve. Choose a category and share your suggestions or report an issue.
          </Text>
          <DropdownSelector
            label="Feedback about"
            required
            placeholder="Select category"
            options={FEEDBACK_TYPE_OPTIONS}
            value={feedbackType}
            onSelect={setFeedbackType}
          />
          <FormInput
            label="Your message"
            value={message}
            onChangeText={setMessage}
            placeholder="Type your feedback here..."
            multiline
            numberOfLines={4}
            onFocusWithRef={onFocusWithRef}
          />
        </View>
        <Pressable
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Sending…' : 'Send feedback'}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  keyboard: {
    flex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
});
