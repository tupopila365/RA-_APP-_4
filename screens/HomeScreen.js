import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../hooks/useTheme';
import { SearchInput } from '../components/SearchInput';
import RAIcon from '../assets/icon.png';
import Poster1 from '../assets/poster-1.png';
import Poster2 from '../assets/poster-2.png';
import Poster3 from '../assets/poster-3.png';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, showMenuOnly = false }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMessageOption, setShowMessageOption] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleNatisOnline = async () => {
    await WebBrowser.openBrowserAsync('https://online.ra.org.na/#/');
  };

  const handleERecruitment = async () => {
    await WebBrowser.openBrowserAsync('https://erec.ra.org.na/');
  };

  const posterBanners = [
    {
      id: 'poster-1',
      source: Poster1,
      title: 'Roads Authority Namibia',
      subtitle: 'Safe Roads to Prosperity',
    },
    {
      id: 'poster-2',
      source: Poster2,
      title: 'Contact the NaTIS Office in Your Town',
      subtitle: '#WeBuildTheJourney',
    },
    {
      id: 'poster-3',
      source: Poster3,
      title: 'Serving Namibia with Purpose',
      subtitle: '#WeBuildTheJourney',
    },
  ];

  const menuItems = [
    {
      id: 1,
      title: 'NATIS Online',
      icon: 'car-outline',
      color: '#00B4E6',
      onPress: handleNatisOnline,
    },
    {
      id: 2,
      title: 'E-Recruitment',
      icon: 'person-add-outline',
      color: '#27AE60',
      onPress: handleERecruitment,
    },
    {
      id: 3,
      title: 'News',
      icon: 'newspaper-outline',
      color: '#FF6B6B',
      onPress: () => navigation?.navigate('News'),
    },
    {
      id: 4,
      title: 'Vacancies',
      icon: 'briefcase-outline',
      color: '#4ECDC4',
      onPress: () => navigation?.navigate('Vacancies'),
    },
    {
      id: 5,
      title: 'Tenders',
      icon: 'document-text-outline',
      color: '#FFD700',
      onPress: () => navigation?.navigate('Tenders'),
    },
    {
      id: 6,
      title: 'RA Chatbot',
      icon: 'chatbubbles-outline',
      color: '#9B59B6',
      onPress: () => navigation?.navigate('More', { screen: 'Chatbot' }),
    },
    {
      id: 7,
      title: 'FAQs',
      icon: 'help-circle-outline',
      color: '#E67E22',
      onPress: () => navigation?.navigate('More', { screen: 'FAQs' }),
    },
    {
      id: 8,
      title: 'Find Offices',
      icon: 'location-outline',
      color: '#3498DB',
      onPress: () => navigation?.navigate('More', { screen: 'FindOffices' }),
    },
    {
      id: 9,
      title: 'Settings',
      icon: 'settings-outline',
      color: '#95A5A6',
      onPress: () => navigation?.navigate('More', { screen: 'Settings' }),
    },
  ];

  const styles = getStyles(colors);

  const handleMessageToggle = () => {
    setShowMessageOption((prev) => !prev);
  };

  const handleMessageNavigation = () => {
    setShowMessageOption(false);
    navigation?.navigate('More', { screen: 'Chatbot' });
  };

  if (showMenuOnly) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={32} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.fabContainer}>
          {showMessageOption && (
            <TouchableOpacity
              style={styles.messageFABMini}
              activeOpacity={0.8}
              onPress={handleMessageNavigation}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.messageFAB} activeOpacity={0.85} onPress={handleMessageToggle}>
            <Ionicons name="chatbubbles-outline" size={22} color="#FFFFFF" />
            <Text style={styles.messageFABText}>Message RA</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary + 'DD']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <View style={styles.brandContainer}>
            <Image source={RAIcon} style={styles.brandLogo} />
            <View style={styles.brandTextContainer}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.titleText}>Roads Authority</Text>
              <Text style={styles.subtitleText}>Namibia</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <SearchInput
          placeholder="Search..."
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
          accessibilityLabel="Search menu items"
          accessibilityHint="Type to filter available menu options"
        />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {/* Poster Banner Section */}
        <View style={styles.bannerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled
            contentContainerStyle={styles.bannerScrollContent}
            onScroll={(event) => {
              const scrollPosition = event.nativeEvent.contentOffset.x;
              const index = Math.round(scrollPosition / (width - 60 + 15));
              setActiveBannerIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {posterBanners.map((banner) => (
              <ImageBackground
                key={banner.id}
                source={banner.source}
                style={styles.banner}
                imageStyle={styles.bannerImage}
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerText}>{banner.title}</Text>
                  <Text style={styles.bannerSubtext}>{banner.subtitle}</Text>
                </View>
              </ImageBackground>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {posterBanners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeBannerIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.menuGrid}>
            {menuItems
              .filter((item) => {
                if (!searchQuery.trim()) return true;
                return item.title.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={32} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
          </View>
          {searchQuery.trim() && menuItems.filter((item) => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.fabContainer}>
        {showMessageOption && (
          <TouchableOpacity
            style={styles.messageFABMini}
            activeOpacity={0.8}
            onPress={handleMessageNavigation}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.messageFAB} activeOpacity={0.85} onPress={handleMessageToggle}>
          <Ionicons name="chatbubbles-outline" size={22} color="#FFFFFF" />
          <Text style={styles.messageFABText}>Message RA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandTextContainer: {
      marginLeft: 12,
    },
    brandLogo: {
      width: 70,
      height: 70,
      resizeMode: 'contain',
    },
    welcomeText: {
      color: '#FFFFFF',
      fontSize: 16,
      opacity: 0.9,
    },
    titleText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
      marginTop: 4,
    },
    subtitleText: {
      color: '#FFFFFF',
      fontSize: 18,
      opacity: 0.9,
      marginTop: 2,
    },

    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    bannerContainer: {
      marginBottom: 30,
      position: 'relative',
    },
    bannerScrollContent: {
      paddingRight: 20,
    },
    banner: {
      width: width - 60,
      height: 180,
      borderRadius: 20,
      overflow: 'hidden',
      marginRight: 15,
      justifyContent: 'flex-end',
    },
    bannerImage: {
      borderRadius: 20,
      resizeMode: 'cover',
    },
    bannerOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      padding: 16,
    },
    bannerText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    bannerSubtext: {
      color: '#FFFFFF',
      fontSize: 14,
      marginTop: 6,
      opacity: 0.9,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.textSecondary,
      opacity: 0.3,
    },
    paginationDotActive: {
      backgroundColor: '#FFD700',
      opacity: 1,
      width: 24,
    },
    menuSection: {
      marginTop: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    menuItem: {
      width: (width - 60) / 2,
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    menuIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    menuItemText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    noResultsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
    fabContainer: {
      position: 'absolute',
      right: 20,
      bottom: 30,
      alignItems: 'flex-end',
      gap: 12,
    },
    messageFAB: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 18,
      height: 56,
      borderRadius: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
      gap: 10,
    },
    messageFABText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    messageFABMini: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    },
  });
}

