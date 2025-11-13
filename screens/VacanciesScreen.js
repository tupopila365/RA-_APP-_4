import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function VacanciesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Full-time', 'Part-time', 'Bursaries', 'Internships'];

  const [vacancies] = useState([
    {
      id: 1,
      title: 'Senior Civil Engineer',
      type: 'Full-time',
      department: 'Engineering',
      location: 'Windhoek',
      closingDate: '2024-02-15',
    },
    {
      id: 2,
      title: 'Road Maintenance Technician',
      type: 'Part-time',
      department: 'Maintenance',
      location: 'Swakopmund',
      closingDate: '2024-02-20',
    },
    {
      id: 3,
      title: 'Engineering Bursary Program',
      type: 'Bursaries',
      department: 'Education',
      location: 'Nationwide',
      closingDate: '2024-03-01',
    },
    {
      id: 4,
      title: 'IT Intern',
      type: 'Internships',
      department: 'IT',
      location: 'Windhoek',
      closingDate: '2024-02-25',
    },
    {
      id: 5,
      title: 'Project Manager',
      type: 'Full-time',
      department: 'Projects',
      location: 'Windhoek',
      closingDate: '2024-02-18',
    },
  ]);

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || vacancy.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vacancies..."
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

      {/* Vacancies List */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredVacancies.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No vacancies found</Text>
          </View>
        ) : (
          filteredVacancies.map((vacancy) => (
            <TouchableOpacity key={vacancy.id} style={styles.vacancyCard} activeOpacity={0.7}>
              <View style={styles.vacancyHeader}>
                <View style={[styles.typeBadge, { backgroundColor: colors.secondary + '20' }]}>
                  <Text style={[styles.typeText, { color: colors.secondary }]}>
                    {vacancy.type}
                  </Text>
                </View>
                <Ionicons name="bookmark-outline" size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.vacancyTitle}>{vacancy.title}</Text>
              <View style={styles.vacancyDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{vacancy.department}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{vacancy.location}</Text>
                </View>
              </View>
              <View style={styles.closingDate}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.closingDateText, { color: colors.primary }]}>
                  Closes: {vacancy.closingDate}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      margin: 15,
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
      maxHeight: 50,
    },
    filtersContent: {
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      padding: 15,
    },
    vacancyCard: {
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    vacancyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    typeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    vacancyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    vacancyDetails: {
      flexDirection: 'row',
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
      marginBottom: 5,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 5,
    },
    closingDate: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    closingDateText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
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

