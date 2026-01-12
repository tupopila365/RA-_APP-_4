import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from './SkeletonLoader';

export const BankStyleButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left', // left, right
  style,
  textStyle,
  fullWidth = false,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  // Dynamic styles based on theme
  const dynamicStyles = createDynamicStyles(colors, isDark);

  const getButtonStyle = () => {
    const baseStyle = [dynamicStyles.button, dynamicStyles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`]];
    
    if (fullWidth) {
      baseStyle.push(dynamicStyles.buttonFullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyle.push(dynamicStyles.buttonPrimary);
        if (disabled) baseStyle.push(dynamicStyles.buttonPrimaryDisabled);
        break;
      case 'secondary':
        baseStyle.push(dynamicStyles.buttonSecondary);
        if (disabled) baseStyle.push(dynamicStyles.buttonSecondaryDisabled);
        break;
      case 'outline':
        baseStyle.push(dynamicStyles.buttonOutline);
        if (disabled) baseStyle.push(dynamicStyles.buttonOutlineDisabled);
        break;
      case 'text':
        baseStyle.push(dynamicStyles.buttonText);
        if (disabled) baseStyle.push(dynamicStyles.buttonTextDisabled);
        break;
      default:
        baseStyle.push(dynamicStyles.buttonPrimary);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [dynamicStyles.buttonText, dynamicStyles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}`]];

    switch (variant) {
      case 'primary':
        baseStyle.push(dynamicStyles.buttonTextPrimary);
        if (disabled) baseStyle.push(dynamicStyles.buttonTextPrimaryDisabled);
        break;
      case 'secondary':
        baseStyle.push(dynamicStyles.buttonTextSecondary);
        if (disabled) baseStyle.push(dynamicStyles.buttonTextSecondaryDisabled);
        break;
      case 'outline':
        baseStyle.push(dynamicStyles.buttonTextOutline);
        if (disabled) baseStyle.push(dynamicStyles.buttonTextOutlineDisabled);
        break;
      case 'text':
        baseStyle.push(dynamicStyles.buttonTextText);
        if (disabled) baseStyle.push(dynamicStyles.buttonTextTextDisabled);
        break;
      default:
        baseStyle.push(dynamicStyles.buttonTextPrimary);
    }

    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <SkeletonLoader
          type="circle"
          width={size === 'small' ? 16 : 20}
          height={size === 'small' ? 16 : 20}
        />
      );
    }

    const iconColor = variant === 'primary' ? '#fff' : colors.primary;
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

    return (
      <View style={dynamicStyles.buttonContent}>
        {icon && iconPosition === 'left' && (
          <MaterialIcons
            name={icon}
            size={iconSize}
            color={disabled ? colors.textSecondary : iconColor}
            style={dynamicStyles.iconLeft}
          />
        )}
        
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
        
        {icon && iconPosition === 'right' && (
          <MaterialIcons
            name={icon}
            size={iconSize}
            color={disabled ? colors.textSecondary : iconColor}
            style={dynamicStyles.iconRight}
          />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Dynamic styles function for dark mode support
const createDynamicStyles = (colors, isDark) => StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.25,
    shadowRadius: 3.84,
  },
  buttonPrimaryDisabled: {
    backgroundColor: isDark ? '#444' : '#BDBDBD',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonSecondary: {
    backgroundColor: isDark ? '#2A2A2A' : '#E3F2FD',
    elevation: isDark ? 0 : 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.22,
    shadowRadius: 2.22,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  buttonSecondaryDisabled: {
    backgroundColor: isDark ? '#333' : '#F5F5F5',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonOutlineDisabled: {
    borderColor: colors.textSecondary,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonTextDisabled: {
    backgroundColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextMedium: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextPrimaryDisabled: {
    color: '#fff',
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextSecondaryDisabled: {
    color: colors.textSecondary,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  buttonTextOutlineDisabled: {
    color: colors.textSecondary,
  },
  buttonTextText: {
    color: colors.primary,
  },
  buttonTextTextDisabled: {
    color: colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#1976D2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonSecondary: {
    backgroundColor: '#E3F2FD',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  buttonSecondaryDisabled: {
    backgroundColor: '#F5F5F5',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  buttonOutlineDisabled: {
    borderColor: '#BDBDBD',
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonTextDisabled: {
    backgroundColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  buttonTextSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextMedium: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextPrimaryDisabled: {
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#1976D2',
  },
  buttonTextSecondaryDisabled: {
    color: '#999',
  },
  buttonTextOutline: {
    color: '#1976D2',
  },
  buttonTextOutlineDisabled: {
    color: '#BDBDBD',
  },
  buttonTextText: {
    color: '#1976D2',
  },
  buttonTextTextDisabled: {
    color: '#BDBDBD',
  },
});