import React, { useState } from 'react';
import { Image, View, StyleSheet, useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';
import SkeletonLoader from './SkeletonLoader';

export function LazyImage({
  source,
  style,
  resizeMode = 'contain',
  testID,
  accessible = true,
  accessibilityLabel,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const handleLoadStart = () => setLoading(true);
  const handleLoadEnd = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (error) {
    return (
      <View style={[style, styles.errorContainer]}>
        <SkeletonLoader type="circle" width={20} height={20} />
      </View>
    );
  }

  return (
    <View style={[style, styles.container]}>
      <Image
        source={source}
        style={[style, styles.image]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      />
      {loading && (
        <View style={[style, styles.loadingOverlay]}>
          <SkeletonLoader type="circle" width={20} height={20} />
        </View>
      )}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
    },
    image: {
      backgroundColor: colors.surface,
    },
    loadingOverlay: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
  });
