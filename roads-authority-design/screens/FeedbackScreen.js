import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, FormInput } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';

export function FeedbackScreen({ onBack }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Feedback', 'Please enter your message.');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      Alert.alert('Thank you', 'Your feedback has been received. We will review it shortly.', [{ text: 'OK', onPress: onBack }]);
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color={PRIMARY} />
        </View>
        <Text style={styles.title}>Send feedback</Text>
        <Text style={styles.subtitle}>
          Help us improve the Roads Authority app. Share your suggestions or report an issue.
        </Text>
        <FormInput
          label="Your message"
          value={message}
          onChangeText={setMessage}
          placeholder="Type your feedback here..."
          multiline
          numberOfLines={4}
        />
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
  title: {
    ...typography.h5,
    color: NEUTRAL_COLORS.gray900,
    marginBottom: spacing.sm,
    textAlign: 'center',
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
