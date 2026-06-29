import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { spacing } from '../theme/spacing';
import { CONTENT_BACKGROUND } from '../theme/colors';

export function ScreenContainer({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  keyboardAware = false,
}) {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  const body = <View style={styles.body}>{content}</View>;

  if (keyboardAware) {
    return (
      <KeyboardAvoidingView
        style={[styles.outer, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return <View style={[styles.outer, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  body: {
    flex: 1,
    backgroundColor: CONTENT_BACKGROUND,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
