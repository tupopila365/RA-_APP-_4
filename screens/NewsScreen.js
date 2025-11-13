import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function NewsScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];

  const [news] = useState([
    {
      id: 1,
      title: 'Road Safety Campaign Launched',
      date: '2024-01-15',
      category: 'Safety',
      excerpt: 'Roads Authority launches new road safety campaign across Namibia...',
    },
    {
      id: 2,
      title: 'New Highway Project Announced',
      date: '2024-01-10',
      category: 'Infrastructure',
      excerpt: 'Major highway expansion project to connect Windhoek and Swakopmund...',
    },
    {
      id: 3,
      title: 'Maintenance Schedule Update',
      date: '2024-01-05',
      category: 'Maintenance',
      excerpt: 'Updated maintenance schedule for national roads released...',
    },
    {
      id: 4,
      title: 'Partnership with International Organizations',
      date: '2023-12-28',
      category: 'Partnerships',
      excerpt: 'Roads Authority partners with international road safety organizations...',
    },
  ]);

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {news.map((item) => (
          <TouchableOpacity key={item.id} style={styles.newsCard} activeOpacity={0.7}>
            <View style={styles.newsHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category}
                </Text>
              </View>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsExcerpt}>{item.excerpt}</Text>
            <View style={styles.readMore}>
              <Text style={[styles.readMoreText, { color: colors.primary }]}>Read More</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
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
    content: {
      padding: 20,
    },
    newsCard: {
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
    newsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
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
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    newsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    newsExcerpt: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    readMore: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    readMoreText: {
      fontSize: 14,
      fontWeight: '600',
      marginRight: 5,
    },
  });
}

