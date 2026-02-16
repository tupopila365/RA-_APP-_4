import React, { useRef, useCallback } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  View, 
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/borderRadius';

/**
 * DownloadButton Component
 * 
 * A specialized button for downloading documents with progress indication.
 * Follows Apple HIG with 44pt minimum touch target and modern design.
 * 
 * @param {Function} onPress - Callback function when button is pressed
 * @param {boolean} isDownloading - Whether a download is currently in progress
 * @param {number} progress - Download progress percentage (0-100)
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} label - Button label text (default: "Download Document")
 * @param {object} style - Additional styles to apply to the button
 * @param {string} testID - Test identifier for testing
 */
export function DownloadButton({
  onPress,
  isDownloading = false,
  progress = 0,
  disabled = false,
  label = 'Download Document',
  style,
  testID,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  // Animation for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const isDisabled = disabled || isDownloading;

  return (
    <View>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          style={({ pressed }) => [
            styles.downloadButton,
            isDisabled && styles.downloadButtonDisabled,
            pressed && !isDisabled && { backgroundColor: colors.primaryDark },
            style,
          ]}
          testID={testID}
          accessible={true}
          accessibilityLabel={isDownloading ? `Downloading ${progress}%` : label}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled, busy: isDownloading }}
          accessibilityHint="Downloads the document to your device"
        >
          <View style={styles.buttonContent}>
            {isDownloading ? (
              <>
                <ActivityIndicator 
                  size="small" 
                  color={colors.textInverse} 
                  testID={`${testID}-activity-indicator`}
                />
                <Text 
                  style={styles.downloadButtonText} 
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  Downloading {Math.round(progress)}%
                </Text>
              </>
            ) : (
              <>
                <Ionicons 
                  name="download-outline" 
                  size={20} 
                  color={colors.textInverse} 
                />
                <Text 
                  style={styles.downloadButtonText} 
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {label}
                </Text>
              </>
            )}
          </View>
        </Pressable>
      </Animated.View>
      
      {/* Progress bar shown during download */}
      {isDownloading && (
        <View style={styles.progressBarContainer} testID={`${testID}-progress-container`}>
          <Animated.View
            style={[
              styles.progressBar,
              { width: `${progress}%` },
            ]}
            testID={`${testID}-progress-bar`}
          />
        </View>
      )}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    downloadButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg, // 12pt - consistent with UnifiedButton
      minHeight: 50, // Above 44pt minimum touch target
      paddingHorizontal: spacing.xl, // 20pt
      paddingVertical: spacing.md,   // 12pt
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    downloadButtonDisabled: {
      backgroundColor: colors.disabledBackground,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    downloadButtonText: {
      ...typography.button,
      color: colors.textInverse,
      fontWeight: '600',
      marginLeft: spacing.sm, // 8pt
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.backgroundTertiary,
      borderRadius: borderRadius.sm, // 4pt
      marginTop: spacing.sm, // 8pt
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm, // 4pt
    },
  });
