import React, { useRef, useState } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { triggerMachinePressFeedback } from '../utils/machinePressFeedback';

const CONTAINER_STYLE_KEYS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'width',
  'minWidth',
  'maxWidth',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
]);

function splitPressableStyles(style) {
  const flat = StyleSheet.flatten(style) || {};
  const container = {};
  const content = { ...flat };

  CONTAINER_STYLE_KEYS.forEach((key) => {
    if (flat[key] != null) {
      container[key] = flat[key];
      delete content[key];
    }
  });

  return { container, content };
}

export function MachinePressable({
  style,
  onPress,
  onPressIn,
  onPressOut,
  disabled = false,
  heavy = false,
  children,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const handlePressIn = (event) => {
    if (!disabled) {
      triggerMachinePressFeedback();
      setPressed(true);
      Animated.spring(scale, {
        toValue: heavy ? 0.94 : 0.96,
        useNativeDriver: true,
        speed: 60,
        bounciness: 0,
      }).start();
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event) => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: heavy ? 2 : 4,
    }).start();
    onPressOut?.(event);
  };

  const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
  const { container, content } = splitPressableStyles(resolvedStyle);
  const fillsContainer = container.flex != null || container.flexGrow != null || container.alignSelf === 'stretch';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={container}
      {...rest}
    >
      <Animated.View
        style={[
          content,
          fillsContainer && styles.fill,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
