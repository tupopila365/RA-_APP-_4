import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { DESIGN_V2_HEADER } from '../designTokens';

const MIN_HEIGHT = 44;
const PRIMARY = DESIGN_V2_HEADER.primary;

export function FormInput({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  showPasswordToggle = false,
  multiline,
  numberOfLines,
  error,
  editable = true,
  onFocus,
  onBlur,
  onFocusWithRef,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(!!secureTextEntry);
  const wrapRef = useRef(null);
  const labelText = `${label}${required ? '*' : ''}`;
  const hasValue = typeof value === 'string' ? value.trim().length > 0 : !!value;
  const isFloating = focused || hasValue;
  const resolvedSecureTextEntry = showPasswordToggle ? hidePassword : secureTextEntry;

  const handleFocus = (e) => {
    setFocused(true);
    onFocusWithRef?.(wrapRef.current);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View ref={wrapRef} style={styles.wrap} collapsable={false}>
      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          focused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {isFloating ? (
          <Text
            style={[
              styles.floatingLabel,
              focused && styles.floatingLabelFocused,
              error && styles.floatingLabelError,
            ]}
          >
            {labelText}
          </Text>
        ) : null}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isFloating && styles.inputWithFloatingLabel,
            showPasswordToggle && styles.inputWithRightIcon,
          ]}
          placeholder={isFloating ? placeholder : labelText}
          placeholderTextColor={NEUTRAL_COLORS.gray500}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={resolvedSecureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          {...rest}
        />
        {showPasswordToggle ? (
          <Pressable
            onPress={() => setHidePassword((prev) => !prev)}
            style={styles.iconButton}
            hitSlop={8}
          >
            <Ionicons
              name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={NEUTRAL_COLORS.gray700}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  inputContainer: {
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray400,
    borderRadius: 8,
    backgroundColor: NEUTRAL_COLORS.white,
    minHeight: MIN_HEIGHT + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  inputContainerMultiline: {
    minHeight: 100,
  },
  inputContainerFocused: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  floatingLabel: {
    ...typography.label,
    position: 'absolute',
    top: -10,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    color: NEUTRAL_COLORS.gray500,
    zIndex: 2,
  },
  floatingLabelFocused: {
    color: PRIMARY,
  },
  floatingLabelError: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: NEUTRAL_COLORS.gray900,
    minHeight: MIN_HEIGHT,
    backgroundColor: 'transparent',
  },
  inputWithFloatingLabel: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  iconButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.caption,
    color: '#DC2626',
    marginTop: spacing.xs,
  },
});
