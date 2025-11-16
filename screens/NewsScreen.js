import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import { newsService } from '../services/newsService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { SearchInput } from '../components/SearchInput';

const { width } = Dimensions.get('window');

const mockNewsData = [
    {
      id: 1,
      title: 'Road Safety Campaign Launched Nationwide',
      date: '2024-01-15',
      category: 'Safety',
      excerpt: 'Roads Authority launches comprehensive road safety campaign across Namibia targeting pedestrian and driver awareness...',
      content: 'The Roads Authority of Namibia has officially launched a nationwide road safety campaign aimed at reducing traffic accidents and promoting safer driving practices. The campaign, which will run for six months, includes educational programs in schools, community workshops, and increased enforcement of traffic regulations.\n\nThe initiative comes in response to rising accident rates on Namibian roads, particularly during holiday seasons. Key focus areas include speeding, drunk driving, and pedestrian safety. The campaign will utilize radio, television, and social media platforms to reach a wider audience.\n\n"We are committed to making our roads safer for all users," said the CEO of Roads Authority. "This campaign represents a collaborative effort between government, law enforcement, and communities to create lasting change in road safety culture."',
      author: 'RA Communications',
      readTime: 5,
      tags: ['safety', 'campaign', 'awareness'],
    },
    {
      id: 2,
      title: 'New Highway Project Connecting Major Cities',
      date: '2024-01-10',
      category: 'Infrastructure',
      excerpt: 'Major highway expansion project to connect Windhoek and Swakopmund announced with N$2 billion investment...',
      content: 'The Roads Authority has announced a major infrastructure project that will see the construction of a new four-lane highway connecting Windhoek and Swakopmund. The N$2 billion project is expected to reduce travel time between the two cities by 30 minutes and significantly improve road safety.\n\nConstruction is scheduled to begin in the second quarter of 2024 and is expected to be completed within three years. The project will create approximately 500 jobs during the construction phase and will include modern rest stops, improved lighting, and emergency lanes.\n\nThe new highway will feature state-of-the-art road design, including improved drainage systems, wildlife crossings, and dedicated lanes for heavy vehicles. Environmental impact assessments have been completed, and measures will be implemented to minimize ecological disruption.',
      author: 'Infrastructure Team',
      readTime: 7,
      tags: ['infrastructure', 'development', 'highways'],
    },
    {
      id: 3,
      title: 'Maintenance Schedule Update for National Roads',
      date: '2024-01-05',
      category: 'Maintenance',
      excerpt: 'Updated maintenance schedule for national roads released, affecting major routes across the country...',
      content: 'The Roads Authority has released an updated maintenance schedule for national roads across Namibia. The comprehensive maintenance program will address road surface repairs, pothole filling, and infrastructure upgrades on major routes.\n\nMotorists are advised to plan their journeys accordingly as some routes will experience temporary lane closures during peak maintenance periods. The maintenance work is scheduled to minimize disruption to traffic flow, with most activities taking place during off-peak hours.\n\nKey routes affected include the B1, B2, and C28 highways. Detailed schedules and alternative routes are available on the Roads Authority website and mobile app. The maintenance program represents a N$500 million investment in road infrastructure.',
      author: 'Maintenance Division',
      readTime: 4,
      tags: ['maintenance', 'roads', 'updates'],
    },
    {
      id: 4,
      title: 'Partnership with International Road Safety Organizations',
      date: '2023-12-28',
      category: 'Partnerships',
      excerpt: 'Roads Authority partners with international road safety organizations to implement best practices...',
      content: 'The Roads Authority of Namibia has entered into strategic partnerships with leading international road safety organizations to enhance road safety standards and implement global best practices.\n\nThe partnerships will facilitate knowledge exchange, technical training for staff, and access to cutting-edge road safety technologies. International experts will work alongside local teams to develop innovative solutions tailored to Namibian road conditions.\n\nThese collaborations align with Namibia\'s commitment to the United Nations Decade of Action for Road Safety and will contribute to achieving national road safety targets. The partnerships will also support research initiatives and data-driven policy development.',
      author: 'International Relations',
      readTime: 6,
      tags: ['partnerships', 'international', 'collaboration'],
    },
    {
      id: 5,
      title: 'Digital Transformation: New Mobile App Features',
      date: '2023-12-20',
      category: 'Technology',
      excerpt: 'Roads Authority introduces new mobile app features for improved citizen engagement and service delivery...',
      content: 'The Roads Authority has unveiled significant updates to its mobile application, introducing new features designed to enhance user experience and improve service delivery to Namibian citizens.\n\nNew features include real-time traffic updates, road condition reports, emergency assistance requests, and digital payment options for various services. Users can now report road hazards directly through the app, with geo-location capabilities ensuring accurate incident reporting.\n\nThe app also includes an AI-powered chatbot for instant responses to common queries, integration with NATIS services, and personalized notifications for road closures and maintenance activities in users\' preferred routes.',
      author: 'Digital Innovation Team',
      readTime: 5,
      tags: ['technology', 'digital', 'innovation'],
    },
    {
      id: 6,
      title: 'Youth Employment Program in Road Construction',
      date: '2023-12-15',
      category: 'Employment',
      excerpt: 'New initiative creates opportunities for young Namibians in road construction and maintenance sectors...',
      content: 'The Roads Authority has launched a comprehensive youth employment program aimed at creating opportunities for young Namibians in the road construction and maintenance sectors. The program will provide training and employment for 200 young people annually.\n\nParticipants will receive hands-on training in various aspects of road construction, including surveying, quality control, equipment operation, and project management. The program includes both theoretical classroom instruction and practical field experience.\n\nSuccessful graduates will be offered employment opportunities with Roads Authority contractors or within the organization itself. The initiative is part of the government\'s broader strategy to address youth unemployment and develop critical skills in the infrastructure sector.',
      author: 'HR Department',
      readTime: 6,
      tags: ['employment', 'youth', 'training'],
    },
];

export default function NewsScreen({ navigation }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNews, setFilteredNews] = useState([]);
  
  const { data: news = mockNewsData, loading, error, execute: refetchNews, retry } = useApi(
    () => newsService.getNews().catch(() => mockNewsData),
    { immediate: true, cacheKey: 'news' }
  );

  useEffect(() => {
    const newsToFilter = news && news.length > 0 ? news : mockNewsData;
    if (searchQuery.trim()) {
      const filtered = newsToFilter.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNews(filtered);
    } else {
      setFilteredNews(newsToFilter);
    }
  }, [searchQuery, news]);

  const onRefresh = () => {
    refetchNews();
  };

  const styles = getStyles(colors);

  if (loading && filteredNews.length === 0) {
    return <LoadingSpinner fullScreen message="Loading news..." />;
  }

  if (error && filteredNews.length === 0) {
    return (
      <ErrorState
        message={error.message || 'Failed to load news'}
        onRetry={retry}
        fullScreen
      />
    );
  }

  const newsToDisplay = filteredNews.length > 0 ? filteredNews : mockNewsData;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchInput
        placeholder="Search news..."
        onSearch={setSearchQuery}
        onClear={() => setSearchQuery('')}
        style={styles.searchInput}
        accessibilityLabel="Search news articles"
        accessibilityHint="Type to filter news by title or category"
      />

      {/* News List */}
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {newsToDisplay.length > 0 ? (
          newsToDisplay.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.newsCard} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('NewsDetail', { article: item })}
            >
              <View style={styles.newsHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>
                    {item.category}
                  </Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsExcerpt} numberOfLines={2}>{item.excerpt}</Text>
              <View style={styles.readMore}>
                <Text style={[styles.readMoreText, { color: colors.primary }]}>Read More</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            message="No news articles found"
            icon="newspaper-outline"
            accessibilityLabel="No news available"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

NewsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

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
    searchInput: {
      margin: 15,
      marginTop: 20,
      marginBottom: 10,
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

NewsScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

