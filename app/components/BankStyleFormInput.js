import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export const BankStyleFormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  helperText,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const animatedValue = new Animated.Value(value ? 1 : 0);

  // Dynamic styles based on theme
  const dynamicStyles = createDynamicStyles(colors, isDark);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute',
    left: leftIcon ? 48 : 16,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 8],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.textSecondary, isFocused ? colors.primary : colors.textSecondary],
    }),
  };

  return (
    <View style={[dynamicStyles.container, style]}>
      <View style={[
        dynamicStyles.inputContainer,
        isFocused && dynamicStyles.inputContainerFocused,
        error && dynamicStyles.inputContainerError,
        !editable && dynamicStyles.inputContainerDisabled,
      ]}>
        {leftIcon && (
          <View style={dynamicStyles.leftIconContainer}>
            <MaterialIcons name={leftIcon} size={20} color={colors.textSecondary} />
          </View>
        )}
        
        <View style={dynamicStyles.inputWrapper}>
          <Animated.Text style={labelStyle}>
            {label}{required && ' *'}
          </Animated.Text>
          
          <TextInput
            style={[
              dynamicStyles.textInput,
              leftIcon && dynamicStyles.textInputWithLeftIcon,
              rightIcon && dynamicStyles.textInputWithRightIcon,
              multiline && dynamicStyles.textInputMultiline,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={isFocused ? '' : placeholder}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={isSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>

        {secureTextEntry && (
          <TouchableOpacity
            style={dynamicStyles.rightIconContainer}
            onPress={() => setIsSecure(!isSecure)}
          >
            <MaterialIcons
              name={isSecure ? 'visibility-off' : 'visibility'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={dynamicStyles.rightIconContainer}
            onPress={onRightIconPress}
          >
            <MaterialIcons name={rightIcon} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {helperText && !error && (
        <Text style={dynamicStyles.helperText}>{helperText}</Text>
      )}

      {error && (
        <View style={dynamicStyles.errorContainer}>
          <MaterialIcons name="error" size={16} color={colors.error} />
          <Text style={dynamicStyles.errorText}>{error}</Text>
        </View>
      )}

      {maxLength && (
        <Text style={dynamicStyles.characterCount}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// Dynamic styles function for dark mode support
const createDynamicStyles = (colors, isDark) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
    borderColor: colors.border,
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 16,
    margin: 0,
  },
  textInputWithLeftIcon: {
    paddingLeft: 0,
  },
  textInputWithRightIcon: {
    paddingRight: 0,
  },
  textInputMultiline: {
    paddingTop: 28,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputContainerFocused: {
    borderColor: '#1976D2',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#F44336',
  },
  inputContainerDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 16,
    margin: 0,
  },
  textInputWithLeftIcon: {
    paddingLeft: 0,
  },
  textInputWithRightIcon: {
    paddingRight: 0,
  },
  textInputMultiline: {
    paddingTop: 28,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 16,
  },
});