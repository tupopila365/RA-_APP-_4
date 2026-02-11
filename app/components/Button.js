import React from 'react';
import { View } from 'react-native';
import { UnifiedButton } from './UnifiedButton';

export function Button({
  onPress,
  label,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconName,
  iconPosition = 'left',
  size = 'medium',
  fullWidth = false,
  style,
  testID,
  accessible = true,
  accessibilityLabel,
}) {
  const mappedVariant = variant === 'text' ? 'ghost' : variant;

  return (
    <UnifiedButton
      label={label}
      onPress={onPress}
      variant={mappedVariant}
      size={size}
      iconName={iconName}
      iconPosition={iconPosition}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      style={style}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
    >
      {icon ? <View>{icon}</View> : null}
    </UnifiedButton>
  );
}
