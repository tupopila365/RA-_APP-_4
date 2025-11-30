import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

/**
 * DownloadButton Component
 * 
 * A reusable button component for downloading documents with progress indication.
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
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const isDisabled = disabled || isDownloading;

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.downloadButton,
          { backgroundColor: colors.primary },
          isDisabled && styles.downloadButtonDisabled,
          style,
        ]}
        testID={testID}
        accessible={true}
        accessibilityLabel={isDownloading ? `Downloading ${progress}%` : label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {isDownloading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" testID={`${testID}-activity-indicator`} />
            <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">
              Downloading {progress}%
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
      {isDownloading && (
        <View style={styles.progressBarContainer} testID={`${testID}-progress-container`}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: colors.primary },
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
    },
    downloadButtonDisabled: {
      opacity: 0.7,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
    },
  });
