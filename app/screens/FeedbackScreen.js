import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedFormInput, UnifiedButton, FilterDropdownBox } from '../components';
import { ApiClient, API_ENDPOINTS } from '../services/api';

const FEEDBACK_CATEGORIES = ['General', 'Suggestion', 'Bug report', 'Complaint', 'Other'];

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ category: '', message: '' });

  const styles = useMemo(() => getStyles(colors), [colors]);

  const validate = () => {
    const next = { category: '', message: '' };
    if (!category) next.category = 'Please select a category';
    if (!message.trim()) next.message = 'Please enter your feedback';
    setErrors(next);
    return !next.category && !next.message;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({ category: '', message: '' });
    try {
      await ApiClient.post(API_ENDPOINTS.FEEDBACK, {
        category,
        message: message.trim(),
        email: email.trim() || undefined,
      });
      setSubmitting(false);
      setSubmitted(true);
      setCategory(null);
      setMessage('');
      setEmail('');
    } catch (err) {
      setSubmitting(false);
      const errorMessage = err?.message || 'Failed to submit feedback. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.successWrap}>
          <View style={[styles.successIconWrap, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Thank you</Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            Your feedback has been received. We appreciate you helping us improve the Roads Authority app.
          </Text>
          <UnifiedButton
            label="Submit more feedback"
            variant="primary"
            onPress={() => setSubmitted(false)}
            style={styles.successButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={[styles.introTitle, { color: colors.text }]}>Send feedback</Text>
            <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
              Tell us what you think about the app. Your feedback helps us improve our services.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <FilterDropdownBox
              label="Category"
              placeholder="Select category"
              value={category}
              options={FEEDBACK_CATEGORIES}
              onSelect={setCategory}
              onClear={() => setCategory(null)}
              accessibilityLabel="Feedback category"
            />
            {errors.category ? (
              <Text style={styles.errorText}>{errors.category}</Text>
            ) : null}
          </View>

          <UnifiedFormInput
            label="Your feedback"
            placeholder="Describe your feedback, suggestion, or issue..."
            value={message}
            onChangeText={setMessage}
            error={errors.message}
            multiline
            numberOfLines={4}
            required
            leftIcon="chatbubble-ellipses-outline"
            accessibilityLabel="Feedback message"
          />

          <UnifiedFormInput
            label="Email (optional)"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            optional
            leftIcon="mail-outline"
            accessibilityLabel="Email for follow-up"
          />

          <UnifiedButton
            label="Submit feedback"
            variant="primary"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            iconName="send"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboard: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: spacing.xxl,
      paddingBottom: spacing.xxxl * 2,
    },
    intro: {
      marginBottom: spacing.xxl,
    },
    introTitle: {
      ...typography.h4,
      marginBottom: spacing.xs,
    },
    introSubtitle: {
      ...typography.bodySmall,
      lineHeight: 22,
    },
    fieldGroup: {
      marginBottom: spacing.lg,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: spacing.xs,
    },
    submitButton: {
      marginTop: spacing.lg,
    },
    successWrap: {
      flex: 1,
      padding: spacing.xxl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    successIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    successIcon: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.primary,
    },
    successTitle: {
      ...typography.h3,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    successMessage: {
      ...typography.body,
      textAlign: 'center',
      marginBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    successButton: {
      minWidth: 200,
    },
  });
}
