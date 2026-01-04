import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { RATheme } from '../theme/colors';
import { ProcurementTableRow } from './ProcurementTableRow';

/**
 * ProcurementTable - A table component for displaying procurement items
 * @param {Array} items - Array of procurement items
 * @param {function} onDownload - Callback when a notice is downloaded
 * @param {object} style - Additional styles
 */
export function ProcurementTable({ items = [], onDownload, style }) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View style={[styles.tableContainer, style]}>
      {/* Table Header */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>PROCUREMENT REFERENCE</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>DESCRIPTION</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>BID OPENING DATE</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>STATUS</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>NOTICE</Text>
          </View>
        </View>
      </ScrollView>

      {/* Table Rows */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {items.map((item) => (
            <ProcurementTableRow
              key={item.id}
              item={item}
              onDownload={onDownload}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    tableContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.border + '40',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      minWidth: 800,
    },
    headerCell: {
      width: 160,
      paddingHorizontal: 8,
    },
    headerText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

