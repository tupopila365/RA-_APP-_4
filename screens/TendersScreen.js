import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function TendersScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Open', 'Closed', 'Upcoming'];

  const [tenders] = useState([
    {
      id: 1,
      title: 'Road Construction Project - B1 Highway',
      reference: 'RA/TND/2024/001',
      status: 'Open',
      category: 'Construction',
      closingDate: '2024-03-15',
      value: 'N$ 5,000,000',
    },
    {
      id: 2,
      title: 'Road Maintenance Equipment Supply',
      reference: 'RA/TND/2024/002',
      status: 'Open',
      category: 'Supply',
      closingDate: '2024-03-20',
      value: 'N$ 2,500,000',
    },
    {
      id: 3,
      title: 'Bridge Rehabilitation Project',
      reference: 'RA/TND/2024/003',
      status: 'Upcoming',
      category: 'Infrastructure',
      closingDate: '2024-04-01',
      value: 'N$ 8,000,000',
    },
    {
      id: 4,
      title: 'Traffic Signage Installation',
      reference: 'RA/TND/2023/045',
      status: 'Closed',
      category: 'Installation',
      closingDate: '2023-12-15',
      value: 'N$ 1,200,000',
    },
  ]);

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || tender.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (tender) => {
    Alert.alert(
      'Download Tender Document',
      `Download tender document for ${tender.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // Simulate download
            Alert.alert('Success', 'Tender document download started');
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return colors.success;
      case 'Closed':
        return colors.textSecondary;
      case 'Upcoming':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Search and Filters */}
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tenders..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && { color: '#FFFFFF' },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tenders List */}
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.content}>
        {filteredTenders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No tenders found</Text>
          </View>
        ) : (
          filteredTenders.map((tender) => (
            <View key={tender.id} style={styles.tenderCard}>
              <View style={styles.tenderHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tender.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(tender.status) }]}>
                    {tender.status}
                  </Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>
                    {tender.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.tenderTitle} numberOfLines={2} ellipsizeMode="tail">{tender.title}</Text>
              <Text style={styles.tenderReference} numberOfLines={1} ellipsizeMode="tail">Ref: {tender.reference}</Text>
              <View style={styles.tenderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">Closing: {tender.closingDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">Value: {tender.value}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: colors.primary }]}
                onPress={() => handleDownload(tender)}
              >
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.downloadButtonText} numberOfLines={1} ellipsizeMode="tail">Download Document</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.background,
      paddingTop: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: 15,
      marginBottom: 10,
      borderRadius: 25,
      paddingHorizontal: 15,
      height: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    filtersContainer: {
      marginBottom: 5,
    },
    filtersContent: {
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    contentScrollView: {
      flex: 1,
    },
    content: {
      padding: 15,
      paddingBottom: 25,
    },
    tenderCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 180,
    },
    tenderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    categoryBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
    },
    tenderTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    tenderReference: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      fontStyle: 'italic',
    },
    tenderDetails: {
      marginBottom: 15,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 10,
    },
    downloadButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 15,
    },
  });
}

