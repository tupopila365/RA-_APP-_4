import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import SkeletonLoader from './SkeletonLoader';
import { Badge } from './Badge';

/**
 * Reusable DetailCard component for consistent design across all screens
 * Matches the Vacancies screen card design for unity
 */
export function DetailCard({
  // Header props
  badge,
  badgeLabel,
  badgeColor,
  badgeBackgroundColor,
  headerRight,
  
  // Title
  title,
  titleStyle,
  
  // Metadata items (array of { icon, text, color })
  metadata = [],
  
  // Details section (expandable content)
  children,
  
  // Footer/action section
  footer,
  downloadButton,
  downloadButtonText,
  downloadButtonDisabled,
  isDownloading,
  downloadProgress,
  onDownloadPress,
  onPress,
  expanded = false,
  
  // Style props
  style,
  testID,
  accessible = true,
  accessibilityLabel,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || title}
    >
      {/* Header with Badge */}
      {(badge || badgeLabel || headerRight) && (
        <View style={styles.cardHeader}>
          {badgeLabel && (
            <Badge
              label={badgeLabel}
              backgroundColor={badgeBackgroundColor || badgeColor + '20' || colors.secondary}
              textColor={badgeColor || colors.secondary}
              size="small"
            />
          )}
          {badge && (typeof badge === 'string' ? <Text style={styles.cardTitle}>{badge}</Text> : badge)}
          {headerRight && (typeof headerRight === 'string' ? <Text style={styles.cardTitle}>{headerRight}</Text> : headerRight)}
        </View>
      )}

      {/* Title */}
      {title && (
        <Text style={[styles.cardTitle, titleStyle]} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
      )}

      {/* Metadata Items */}
      {metadata.length > 0 && (
        <View style={styles.metadataContainer}>
          {metadata.map((item, index) => (
            <View key={index} style={styles.metadataItem}>
              {item.icon && (
                <Ionicons 
                  name={item.icon} 
                  size={16} 
                  color={item.iconColor || colors.textSecondary} 
                />
              )}
              <Text 
                style={[
                  styles.metadataText,
                  item.color && { color: item.color },
                  item.bold && styles.metadataTextBold
                ]}
                numberOfLines={item.numberOfLines || 1}
                ellipsizeMode="tail"
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Date/Status Footer with Border */}
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}

      {/* Expandable Content */}
      {expanded && children && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          {children}
        </View>
      )}

      {/* Download Button */}
      {downloadButton && (
        <TouchableOpacity
          style={[
            styles.downloadButton,
            { backgroundColor: colors.primary },
            (downloadButtonDisabled || isDownloading) && styles.downloadButtonDisabled,
          ]}
          onPress={onDownloadPress}
          disabled={downloadButtonDisabled || isDownloading}
          activeOpacity={0.8}
        >
          {isDownloading ? (
            <>
              <SkeletonLoader type="circle" width={16} height={16} />
              <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">
                {downloadProgress > 0 ? `Downloading ${Math.round(downloadProgress)}%` : 'Preparing...'}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">
                {downloadButtonText || 'Download'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Progress Bar for Downloads */}
      {isDownloading && downloadProgress > 0 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${downloadProgress}%`, backgroundColor: colors.primary }]} />
        </View>
      )}
    </CardWrapper>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      gap: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 14,
      lineHeight: 24,
    },
    metadataContainer: {
      marginBottom: 14,
      gap: 8,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    metadataText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    metadataTextBold: {
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 6,
    },
    expandedContent: {
      marginTop: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 16,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 12,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    downloadButtonDisabled: {
      opacity: 0.7,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
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
}

