import React from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { NEUTRAL_COLORS } from '../theme/colors';

export function RaLogoRing({ size = 72, logoSize = 58 }) {
  const radius = size / 2;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
      ]}
    >
      <Image
        source={require('../assets/ra logo.png')}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
        accessibilityLabel="Roads Authority logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#003D52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
});
