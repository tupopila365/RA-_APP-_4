import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

export default function VacanciesScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedVacancy, setExpandedVacancy] = useState(null);

  const filters = ['All', 'Full-time', 'Part-time', 'Bursaries', 'Internships'];

  const [vacancies] = useState([
    {
      id: 1,
      title: 'Senior Civil Engineer',
      type: 'Full-time',
      department: 'Engineering',
      location: 'Windhoek',
      closingDate: '2024-02-15',
      salary: 'N$45,000 - N$60,000 per month',
      description: 'We are seeking an experienced Senior Civil Engineer to lead major road infrastructure projects. The ideal candidate will have extensive experience in highway design, project management, and team leadership.',
      requirements: [
        'Bachelor\'s degree in Civil Engineering',
        'Minimum 8 years of experience',
        'Professional Engineer registration',
        'Project management certification',
        'Strong leadership skills',
      ],
      responsibilities: [
        'Lead design and implementation of road projects',
        'Manage engineering teams',
        'Ensure compliance with safety standards',
        'Coordinate with stakeholders',
        'Review technical drawings and specifications',
      ],
    },
    {
      id: 2,
      title: 'Road Maintenance Technician',
      type: 'Part-time',
      department: 'Maintenance',
      location: 'Swakopmund',
      closingDate: '2024-02-20',
      salary: 'N$8,000 - N$12,000 per month',
      description: 'Join our maintenance team to ensure the quality and safety of road infrastructure in the Swakopmund region. This part-time position offers flexible working hours.',
      requirements: [
        'Diploma in Civil Engineering or related field',
        'Valid driver\'s license',
        '2+ years maintenance experience',
        'Knowledge of road safety standards',
      ],
      responsibilities: [
        'Conduct routine road inspections',
        'Perform minor repairs and maintenance',
        'Report major defects',
        'Maintain equipment and tools',
      ],
    },
    {
      id: 3,
      title: 'Engineering Bursary Program',
      type: 'Bursaries',
      department: 'Education',
      location: 'Nationwide',
      closingDate: '2024-03-01',
      salary: 'Full tuition + N$3,000 monthly allowance',
      description: 'Roads Authority is offering bursaries to talented Namibian students pursuing engineering degrees. Recipients will receive full financial support and guaranteed employment upon graduation.',
      requirements: [
        'Namibian citizen',
        'Grade 12 with Mathematics and Physical Science',
        'Accepted into accredited engineering program',
        'Minimum average of 65%',
        'Demonstrate financial need',
      ],
      responsibilities: [
        'Maintain academic performance (minimum 60%)',
        'Complete vacation work at Roads Authority',
        'Submit progress reports each semester',
        'Commit to work for RA after graduation',
      ],
    },
    {
      id: 4,
      title: 'IT Intern',
      type: 'Internships',
      department: 'IT',
      location: 'Windhoek',
      closingDate: '2024-02-25',
      salary: 'N$4,500 per month',
      description: 'Gain practical experience in IT systems management and software development. This 12-month internship provides hands-on training in a professional environment.',
      requirements: [
        'Currently studying IT, Computer Science, or related field',
        'Basic programming knowledge',
        'Good communication skills',
        'Eager to learn',
      ],
      responsibilities: [
        'Assist with system maintenance',
        'Support software development projects',
        'Help with user support',
        'Document IT processes',
        'Participate in team meetings',
      ],
    },
    {
      id: 5,
      title: 'Project Manager',
      type: 'Full-time',
      department: 'Projects',
      location: 'Windhoek',
      closingDate: '2024-02-18',
      salary: 'N$35,000 - N$50,000 per month',
      description: 'Lead and coordinate major infrastructure projects from inception to completion. The successful candidate will manage budgets, timelines, and stakeholder relationships.',
      requirements: [
        'Bachelor\'s degree in Engineering or Project Management',
        '5+ years project management experience',
        'PMP certification preferred',
        'Strong analytical skills',
        'Excellent communication abilities',
      ],
      responsibilities: [
        'Plan and execute project strategies',
        'Manage project budgets and resources',
        'Coordinate with contractors and consultants',
        'Monitor project progress and quality',
        'Prepare reports for senior management',
      ],
    },
  ]);

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch = vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vacancy.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || vacancy.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleExpand = (id) => {
    setExpandedVacancy(expandedVacancy === id ? null : id);
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
      </View>

      {/* Vacancies List */}
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.content}>
        {filteredVacancies.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No vacancies found</Text>
          </View>
        ) : (
          filteredVacancies.map((vacancy) => {
            const isExpanded = expandedVacancy === vacancy.id;
            return (
              <TouchableOpacity 
                key={vacancy.id} 
                style={styles.vacancyCard} 
                activeOpacity={0.7}
                onPress={() => toggleExpand(vacancy.id)}
              >
                <View style={styles.vacancyHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.typeText, { color: colors.secondary }]}>
                      {vacancy.type}
                    </Text>
                  </View>
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <Text style={styles.vacancyTitle} numberOfLines={2} ellipsizeMode="tail">{vacancy.title}</Text>
                <View style={styles.vacancyDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{vacancy.department}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{vacancy.location}</Text>
                  </View>
                </View>
                <View style={styles.closingDate}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.closingDateText, { color: colors.primary }]} numberOfLines={1} ellipsizeMode="tail">
                    Closes: {vacancy.closingDate}
                  </Text>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Salary</Text>
                      <Text style={styles.sectionText} numberOfLines={2} ellipsizeMode="tail">{vacancy.salary}</Text>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.sectionText} numberOfLines={4} ellipsizeMode="tail">{vacancy.description}</Text>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Requirements</Text>
                      {vacancy.requirements.map((req, index) => (
                        <View key={`${vacancy.id}-req-${index}`} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listText} numberOfLines={2} ellipsizeMode="tail">{req}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Responsibilities</Text>
                      {vacancy.responsibilities.map((resp, index) => (
                        <View key={`${vacancy.id}-resp-${index}`} style={styles.listItem}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.listText} numberOfLines={2} ellipsizeMode="tail">{resp}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
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
      paddingTop: 15,
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
      maxHeight:50,
      marginBottom: 5,
    },
    filtersContent: {
      paddingHorizontal: 15,
      paddingVertical: 5,
    },
    filterChip: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
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
      minHeight: 140,
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
    expandedContent: {
      marginTop: 15,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 15,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingRight: 10,
    },
    bullet: {
      fontSize: 14,
      color: colors.primary,
      marginRight: 8,
      fontWeight: 'bold',
    },
    listText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}

