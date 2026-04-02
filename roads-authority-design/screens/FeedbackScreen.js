import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, DropdownSelector } from '../components';
import { useKeyboardScroll } from '../hooks/useKeyboardScroll';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { submitFeedback } from '../services/feedbackService';

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
          <View style={styles.card} ref={contentRef} collapsable={false}>
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
            <Pressable
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Sending…' : 'Send feedback'}</Text>
            </Pressable>
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
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    textAlign: 'left',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    ...typography.button,
    color: NEUTRAL_COLORS.white,
  },
});
