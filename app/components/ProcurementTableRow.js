import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { Badge } from './Badge';

/**
 * ProcurementTableRow - A table row component for individual procurement items
 * @param {object} item - Procurement item object
 * @param {function} onDownload - Callback when notice is downloaded
 */
export function ProcurementTableRow({ item, onDownload }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusVariant = (status) => {
    return status === 'Open' ? 'success' : 'default';
  };

  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <Text style={styles.cellText} numberOfLines={2}>
          {item.reference}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>
          {formatDate(item.bidOpeningDate)}
        </Text>
      </View>
      <View style={styles.cell}>
        <Badge
          label={item.status}
          variant={getStatusVariant(item.status)}
          size="small"
        />
      </View>
      <View style={styles.cell}>
        {item.noticeUrl ? (
          <TouchableOpacity
            style={styles.noticeLink}
            onPress={() => onDownload && onDownload(item)}
            activeOpacity={0.7}
            accessibilityLabel={`Download notice for ${item.reference}`}
            accessibilityRole="button"
          >
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text style={styles.noticeLinkText} numberOfLines={1}>
              {item.noticeFileName || 'Download PDF'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noNoticeText}>N/A</Text>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 80,
      minWidth: 800,
    },
    cell: {
      width: 160,
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    cellText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    noticeLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    noticeLinkText: {
      fontSize: 14,
      color: colors.primary,
      flex: 1,
    },
    noNoticeText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });

