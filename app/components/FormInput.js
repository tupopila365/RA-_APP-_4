import React from 'react';
import { TextInput, StyleSheet, useColorScheme, View, Text } from 'react-native';
import { RATheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function FormInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  style,
  textArea = false,
  ...props
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          textArea && styles.textArea,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline || textArea}
        numberOfLines={textArea ? 4 : numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        textAlignVertical={textArea ? 'top' : 'center'}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    textArea: {
      height: 100,
      paddingTop: spacing.md,
      textAlignVertical: 'top',
    },
    inputError: {
      borderColor: colors.error,
    },
    inputDisabled: {
      opacity: 0.6,
      backgroundColor: colors.surface,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing.xs,
    },
  });



