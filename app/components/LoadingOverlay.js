import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
} from 'react-native';
import { RATheme } from '../theme/colors';

/**
 * LoadingOverlay - Full-screen blocking loading overlay
 * 
 * Displays a semi-transparent dark backdrop (scrim) with a centered spinner,
 * similar to modern banking apps (e.g., FNB). Blocks all user interaction
 * while keeping the current screen visible underneath.
 * 
 * @param {Object} props
 * @param {boolean} props.loading - Controls visibility of the overlay
 * @param {string} [props.message] - Optional message to display below spinner
 * @param {string|number} [props.size='large'] - Size of the spinner ('small' | 'large' | number)
 * @param {string} [props.color] - Custom color for spinner (defaults to primary theme color)
 * @param {string} [props.testID] - Test identifier for testing
 * 
 * @example
 * <LoadingOverlay loading={isLoading} message="Processing..." />
 * <LoadingOverlay loading={isSubmitting} />
 */
export function LoadingOverlay({
  loading = false,
  message,
  size = 'large',
  color,
  testID,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);
  const spinnerColor = color || colors.primary;
  
  // Animation value for fade in/out
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Track modal visibility to allow fade-out animation to complete
  const [modalVisible, setModalVisible] = useState(loading);

  useEffect(() => {
    if (loading) {
      // Show modal and fade in
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out, then hide modal
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Hide modal after fade-out completes
        setModalVisible(false);
      });
    }
  }, [loading, fadeAnim]);

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={modalVisible}
      onRequestClose={() => {}} // Prevent dismissal
      statusBarTranslucent={true}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
        pointerEvents={loading ? 'auto' : 'none'}
      >
        <View style={styles.container}>
          <View style={styles.spinnerContainer} pointerEvents="none">
            <ActivityIndicator
              size={size}
              color={spinnerColor}
              testID={testID}
              accessible={true}
              accessibilityLabel="Loading content"
              accessibilityRole="progressbar"
            />
            {message && (
              <Text style={styles.message} testID={testID ? `${testID}-message` : undefined}>
                {message}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark scrim
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    spinnerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    message: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500',
      color: colors.textInverse || '#FFFFFF',
      textAlign: 'center',
      maxWidth: 280,
    },
  });

export default LoadingOverlay;
