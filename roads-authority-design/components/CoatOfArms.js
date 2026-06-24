import React from 'react';
import { View } from 'react-native';
import CoatOfArmsSvg from './CoatOfArmsOfNamibia';

const ASPECT_RATIO = 193.14583 / 185.20832;

export function CoatOfArms({ size = 40, style }) {
  const height = size * ASPECT_RATIO;

  return (
    <View style={[{ width: size, height }, style]} accessibilityLabel="Coat of arms of Namibia">
      <CoatOfArmsSvg width={size} height={height} />
    </View>
  );
}
