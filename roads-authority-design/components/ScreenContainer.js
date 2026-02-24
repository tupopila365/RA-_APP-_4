import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';
import { NEUTRAL_COLORS } from '../theme/colors';

export const ScreenContainer = React.forwardRef(function ScreenContainer(
  {
    children,
    style,
    contentContainerStyle,
    scrollable = true,
    roundedTop = false,
    keyboardAware = false,
    keyboardVerticalOffset,
  },
  ref
) {
  const outerStyle = [styles.outer, style];

  const content = scrollable ? (
    <ScrollView
      ref={ref}
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View ref={ref} style={[styles.content, contentContainerStyle]}>
      {children}
    </View>
  );

  const body = (
    <View style={[styles.body, roundedTop && styles.bodyRoundedTop]}>
      {content}
    </View>
  );

  if (keyboardAware) {
    return (
      <KeyboardAvoidingView
        style={outerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset ?? 0}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }
  return <View style={outerStyle}>{body}</View>;
});

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  body: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.gray100,
  },
  bodyRoundedTop: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
