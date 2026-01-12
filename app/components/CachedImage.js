import React, { useState } from 'react';
import { View, StyleSheet, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from './SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { errorLogger } from '../services/errorLogger';

/**
 * CachedImage component with loading states and placeholder fallback
 * Implements caching for offline viewing and optimized performance
 * 
 * @param {Object} props
 * @param {string} props.uri - Image URL to load
 * @param {Object} props.style - Style object for the image
 * @param {Object} props.placeholder - Placeholder image source (optional)
 * @param {Function} props.onLoad - Callback when image loads successfully
 * @param {Function} props.onError - Callback when image fails to load
 * @param {string} props.resizeMode - Image resize mode (default: 'cover')
 * @param {number} props.transition - Transition duration in ms (default: 200)
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.testID - Test identifier
 */
export function CachedImage({
  uri,
  style,
  placeholder,
  onLoad,
  onError,
  resizeMode = 'cover',
  transition = 200,
  accessibilityLabel,
  testID,
}) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const styles = getStyles(colors);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = (e) => {
    setLoading(false);
    setError(true);
    
    // Log error with comprehensive details
    errorLogger.logImageLoadFailure(
      uri,
      e?.error || 'Failed to load image',
      {
        component: 'CachedImage',
        resizeMode,
        hasPlaceholder: !!placeholder,
        accessibilityLabel,
        testID,
      }
    );
    
    if (onError) {
      onError(e);
    }
  };

  // Show placeholder if error occurred
  if (error) {
    return (
      <View style={[style, styles.placeholderContainer]} testID={`${testID}-error`}>
        {placeholder ? (
          <RNImage
            source={placeholder}
            style={[style, styles.placeholderImage]}
            resizeMode={resizeMode}
          />
        ) : (
          <View style={styles.iconPlaceholder}>
            <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[style, styles.container]} testID={testID}>
      <Image
        source={{ uri }}
        style={[style, styles.image]}
        contentFit={resizeMode}
        transition={transition}
        cachePolicy="memory-disk"
        onLoadStart={handleLoadStart}
        onLoad={handleLoadEnd}
        onError={handleError}
        accessible={true}
        accessibilityLabel={accessibilityLabel || 'Image'}
      />
      {loading && (
        <View style={[style, styles.loadingOverlay]}>
          <SkeletonLoader type="circle" width={24} height={24} testID={`${testID}-loading`} />
        </View>
      )}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    image: {
      backgroundColor: colors.surface,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    placeholderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
    },
    iconPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
