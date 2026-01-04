import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../hooks/useTheme';
import { SearchInput } from '../components/SearchInput';
import { bannersService } from '../services/bannersService';
import RAIcon from '../assets/icon.png';
import Poster1 from '../assets/poster-1.png';
import Poster2 from '../assets/poster-2.png';
import Poster3 from '../assets/poster-3.png';

const { width } = Dimensions.get('window');

// Default poster banners (fallback)
const defaultPosterBanners = [
  {
    id: 'poster-1',
    source: Poster1,
    title: 'Roads Authority Namibia',
    description: 'Safe Roads to Prosperity',
    isLocal: true,
  },
  {
    id: 'poster-2',
    source: Poster2,
    title: 'Contact the NaTIS Office in Your Town',
    description: '#WeBuildTheJourney',
    isLocal: true,
  },
  {
    id: 'poster-3',
    source: Poster3,
    title: 'Serving Namibia with Purpose',
    description: '#WeBuildTheJourney',
    isLocal: true,
  },
];

export default function HomeScreen({ navigation, showMenuOnly = false }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const bannerScrollRef = useRef(null);
  const autoScrollTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const handleNatisOnline = async () => {
    await WebBrowser.openBrowserAsync('https://online.ra.org.na/#/');
  };

  const handleERecruitment = async () => {
    await WebBrowser.openBrowserAsync('https://erec.ra.org.na/');
  };

  // Fetch banners from API
  useEffect(() => {
    fetchBanners();
    
    // Cleanup timers on unmount
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Banner auto-scroll functionality
  useEffect(() => {
    if (banners.length > 1 && isAutoScrolling) {
      autoScrollTimerRef.current = setInterval(() => {
        setActiveBannerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % banners.length;
          const scrollPosition = nextIndex * (width - 48 + 15);
          
          bannerScrollRef.current?.scrollTo({
            x: scrollPosition,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [banners.length, isAutoScrolling]);

  // Handle banner scroll to pause auto-scroll
  const handleBannerScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 48 + 15));
    setActiveBannerIndex(index);
    
    // Pause auto-scroll on user interaction
    setIsAutoScrolling(false);
    
    // Clear existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Resume after 5 seconds of inactivity
    inactivityTimerRef.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 5000);
  };

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const fetchedBanners = await bannersService.getActiveBanners();
      
      // If we have API banners, use them; otherwise fall back to default posters
      if (fetchedBanners && fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
      } else {
        // Fallback to default posters if no banners from API
        setBanners(defaultPosterBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      // On error, use default posters
      setBanners(defaultPosterBanners);
    } finally {
      setLoadingBanners(false);
    }
  };


  // Handle banner press (open link if available)
  const handleBannerPress = async (banner) => {
    if (banner.linkUrl) {
      try {
        await WebBrowser.openBrowserAsync(banner.linkUrl);
      } catch (error) {
        console.error('Error opening banner link:', error);
      }
    }
  };

  // Navigation helper function
  const navigateToChatbot = () => {
    const tabNavigator = navigation?.getParent('MainTabs');
    if (tabNavigator) {
      tabNavigator.navigate('Chatbot');
    } else {
      navigation?.navigate('MainTabs', { screen: 'Chatbot' });
    }
  };

  // Menu categories with theme-based colors
  const menuCategories = [
    {
      id: 'primary',
      title: 'Primary Services',
      icon: 'star-outline',
      color: colors.primary,
      items: [
        {
          id: 1,
          title: 'NATIS Online',
          icon: 'car-outline',
          onPress: handleNatisOnline,
        },
        {
          id: 2,
          title: 'E-Recruitment',
          icon: 'person-add-outline',
          onPress: handleERecruitment,
        },
        {
          id: 3,
          title: 'Report Road Damage',
          icon: 'warning-outline',
          onPress: () => navigation?.navigate('ReportPothole'),
        },
      ],
    },
    {
      id: 'information',
      title: 'Information',
      icon: 'information-circle-outline',
      color: colors.secondary,
      items: [
        {
          id: 4,
          title: 'News',
          icon: 'newspaper-outline',
          onPress: () => navigation?.navigate('News'),
        },
        {
          id: 5,
          title: 'Vacancies',
          icon: 'briefcase-outline',
          onPress: () => navigation?.navigate('Vacancies'),
        },
        {
          id: 6,
          title: 'Procurement',
          icon: 'document-text-outline',
          onPress: () => navigation?.navigate('Procurement'),
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'help-buoy-outline',
      color: colors.success,
      items: [
        {
          id: 7,
          title: 'RA Chatbot',
          icon: 'chatbubbles-outline',
          onPress: navigateToChatbot,
        },
        {
          id: 8,
          title: 'FAQs',
          icon: 'help-circle-outline',
          onPress: () => navigation?.navigate('FAQs'),
        },
        {
          id: 9,
          title: 'Find Offices',
          icon: 'location-outline',
          onPress: () => navigation?.navigate('Find Offices'),
        },
      ],
    },
    {
      id: 'account',
      title: 'Account',
      icon: 'person-outline',
      color: colors.textSecondary,
      items: [
        {
          id: 10,
          title: 'Personalized Plates',
          icon: 'car-sport-outline',
          onPress: () => navigation?.navigate('PLNInfo'),
        },
        {
          id: 11,
          title: 'Settings',
          icon: 'settings-outline',
          onPress: () => navigation?.navigate('Settings'),
        },
      ],
    },
  ];

  // Flatten all menu items for search
  const allMenuItems = menuCategories.flatMap(category => 
    category.items.map(item => ({ ...item, categoryColor: category.color }))
  );

  const styles = getStyles(colors);

  // Filter menu items based on search query
  const getFilteredMenuItems = () => {
    if (!searchQuery.trim()) return allMenuItems;
    const query = searchQuery.toLowerCase();
    return allMenuItems.filter(item => 
      item.title.toLowerCase().includes(query)
    );
  };

  const filteredItems = getFilteredMenuItems();

  if (showMenuOnly) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {menuCategories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons name={category.icon} size={20} color={category.color} />
                <Text style={[styles.categoryTitle, { color: category.color }]}>
                  {category.title}
                </Text>
              </View>
              <View style={styles.menuGrid}>
                {category.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: category.color + '15' }]}>
                      <Ionicons name={item.icon} size={32} color={category.color} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
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
          placeholder="Search services, news, and more..."
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
          accessibilityLabel="Search services, news, and more"
          accessibilityHint="Type to filter available menu options"
        />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          {loadingBanners ? (
            <View style={styles.bannerLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : banners.length > 0 ? (
            <>
              <ScrollView
                ref={bannerScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                decelerationRate="fast"
                pagingEnabled
                contentContainerStyle={styles.bannerScrollContent}
                onScroll={handleBannerScroll}
                scrollEventThrottle={16}
                onScrollBeginDrag={() => setIsAutoScrolling(false)}
              >
                {banners.map((banner, index) => (
                  <TouchableOpacity
                    key={banner.id}
                    activeOpacity={banner.linkUrl ? 0.8 : 1}
                    onPress={() => handleBannerPress(banner)}
                    disabled={!banner.linkUrl}
                  >
                    <ImageBackground
                      source={banner.isLocal ? banner.source : { uri: banner.imageUrl }}
                      style={styles.banner}
                      imageStyle={styles.bannerImage}
                    >
                      <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerText}>{banner.title}</Text>
                        {banner.description && (
                          <Text style={styles.bannerSubtext}>{banner.description}</Text>
                        )}
                      </View>
                      {/* Banner Counter - only show on active banner */}
                      {banners.length > 1 && index === activeBannerIndex && (
                        <View style={styles.bannerCounter}>
                          <Text style={styles.bannerCounterText}>
                            {activeBannerIndex + 1} / {banners.length}
                          </Text>
                        </View>
                      )}
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Pagination Dots */}
              {banners.length > 1 && (
                <View style={styles.paginationContainer}>
                  {banners.map((banner, index) => (
                    <View
                      key={banner.id}
                      style={[
                        styles.paginationDot,
                        activeBannerIndex === index && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </View>

        {/* Primary Services - Featured Horizontal Scroll */}
        {!searchQuery.trim() && (
          <View style={styles.primaryServicesSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={22} color={colors.primary} />
              <Text style={styles.sectionTitle}>Primary Services</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.primaryServicesScroll}
            >
              {menuCategories[0].items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.primaryServiceCard}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.primaryServiceIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={item.icon} size={36} color={colors.primary} />
                  </View>
                  <Text style={styles.primaryServiceText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Other Menu Categories */}
        {!searchQuery.trim() ? (
          menuCategories.slice(1).map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons name={category.icon} size={20} color={category.color} />
                <Text style={[styles.categoryTitle, { color: category.color }]}>
                  {category.title}
                </Text>
              </View>
              <View style={styles.menuGrid}>
                {category.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: category.color + '15' }]}>
                      <Ionicons name={item.icon} size={32} color={category.color} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        ) : (
          /* Search Results */
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Search Results {filteredItems.length > 0 && `(${filteredItems.length})`}
              </Text>
            </View>
            {filteredItems.length > 0 ? (
              <View style={styles.menuGrid}>
                {filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: item.categoryColor + '15' }]}>
                      <Ionicons name={item.icon} size={32} color={item.categoryColor} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
            )}
          </View>
        )}
      </ScrollView>
      {/* FAB - Report Road Damage */}
      <TouchableOpacity 
        style={styles.reportFAB} 
        activeOpacity={0.85} 
        onPress={() => navigation?.navigate('ReportPothole')}
      >
        <Ionicons name="warning" size={24} color="#FFFFFF" />
        <Text style={styles.reportFABText}>Report Issue</Text>
      </TouchableOpacity>
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
      paddingTop: 16,
      paddingBottom: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
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
      padding: 16,
      paddingBottom: 100,
    },
    bannerContainer: {
      marginBottom: 24,
      position: 'relative',
    },
    bannerLoadingContainer: {
      width: width - 48,
      height: 200,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerScrollContent: {
      paddingRight: 16,
    },
    banner: {
      width: width - 48,
      height: 200,
      borderRadius: 20,
      overflow: 'hidden',
      marginRight: 15,
      justifyContent: 'flex-end',
      position: 'relative',
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
    bannerCounter: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    bannerCounterText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
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
      backgroundColor: colors.secondary,
      opacity: 1,
      width: 28,
      height: 8,
    },
    menuSection: {
      marginTop: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    primaryServicesSection: {
      marginBottom: 24,
    },
    primaryServicesScroll: {
      paddingRight: 16,
    },
    primaryServiceCard: {
      width: width * 0.35,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginRight: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    primaryServiceIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    primaryServiceText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    menuItem: {
      width: (width - 48) / 2,
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    menuIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
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
    reportFAB: {
      position: 'absolute',
      right: 16,
      bottom: 30,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error,
      paddingHorizontal: 18,
      height: 56,
      borderRadius: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      gap: 10,
    },
    reportFABText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  showMenuOnly: PropTypes.bool,
};


