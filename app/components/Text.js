import React from 'react';
import { Text as RNText } from 'react-native';

// Enhanced Text component with consistent rendering props
export function Text({ children, style, allowFontScaling = true, maxFontSizeMultiplier = 1.3, ...props }) {
  return (
    <RNText
      style={style}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Text variants for consistent typography
export function HeadingText({ children, style, ...props }) {
  return (
    <Text
      style={[{ fontSize: 24, fontWeight: 'bold' }, style]}
      maxFontSizeMultiplier={1.2}
      {...props}
    >
      {children}
    </Text>
  );
}

export function BodyText({ children, style, ...props }) {
  return (
    <Text
      style={[{ fontSize: 16, lineHeight: 24 }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CaptionText({ children, style, ...props }) {
  return (
    <Text
      style={[{ fontSize: 12, opacity: 0.7 }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
