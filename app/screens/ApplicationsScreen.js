import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import { useDrawer } from '../context/DrawerContext';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { UnifiedCard } from '../components';
import { SearchInput } from '../components/SearchInput';

const RALogo = require('../assets/icon.png');

export default function ApplicationsScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.fullName?.split(' ')[0] || 'Guest';

  const applicationMenuItems = [
    {
      id: 1,
      title: 'Personalized Number Plates',
      meta: 'Apply for custom vehicle plates',
      icon: 'card-outline',
      onPress: () => navigation?.navigate('PLNInfo'),
    },
    {
      id: 2,
      title: 'My Applications',
      meta: 'Track your PLN applications',
      icon: 'document-text-outline',
      onPress: () => navigation?.navigate('MyApplications'),
    },
    {
      id: 3,
      title: 'My Reports',
      meta: 'Road damage reports you submitted',
      icon: 'list-outline',
      onPress: () => navigation?.navigate('MyReports'),
    },
    {
      id: 4,
      title: 'Forms',
      meta: 'Download and access forms',
      icon: 'document-text-outline',
      onPress: () => navigation?.navigate('Forms'),
    },
  ];

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return applicationMenuItems;
    const q = searchQuery.toLowerCase();
    return applicationMenuItems.filter((item) =>
      item.title.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const displayItems = searchQuery.trim() ? filteredItems : applicationMenuItems;
  const hasNoResults = searchQuery.trim() && filteredItems.length === 0;

  const styles = getStyles(colors, insets);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerBrand}>
            <Image
              source={RALogo}
              style={styles.headerLogo}
              resizeMode="contain"
              {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
            />
            <Text style={styles.userName} numberOfLines={1}>
              Applications
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={openDrawer}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>Hello, {userName}</Text>
            <Text style={styles.subtitle}>Applications & Digital Services</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Search applications..."
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery('')}
            style={styles.searchInput}
            accessibilityLabel="Search applications"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? 'Search Results' : 'Services'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {searchQuery.trim()
              ? `${filteredItems.length} ${filteredItems.length === 1 ? 'result' : 'results'} found`
              : 'PLN, reports, forms & more'}
          </Text>

          {hasNoResults ? (
            <Text style={styles.noResultsText}>
              No results found for "{searchQuery}"
            </Text>
          ) : (
            displayItems.map((item) => (
              <UnifiedCard
                key={item.id}
                variant="elevated"
                padding="large"
                onPress={item.onPress}
                accessible
                accessibilityLabel={item.title}
                style={styles.serviceCard}
              >
                <View style={styles.serviceRow}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name={item.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceTitle}>{item.title}</Text>
                    <Text style={styles.serviceMeta}>{item.meta}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </UnifiedCard>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Image
            source={RALogo}
            style={styles.footerLogo}
            resizeMode="contain"
            {...(Platform.OS === 'android' && { renderToHardwareTextureAndroid: true })}
          />
          <Text style={styles.footerText}>Roads Authority Namibia</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getStyles(colors, insets) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: Math.max(insets?.top ?? 0, 16) + spacing.md,
      paddingBottom: spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      gap: spacing.sm,
    },
    headerLogo: {
      width: 28,
      height: 28,
    },
    userName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      flexShrink: 1,
    },
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.xxl,
      paddingBottom: 160,
    },
    welcomeRow: {
      marginBottom: spacing.lg,
    },
    welcomeText: {
      flex: 1,
    },
    greeting: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
    },
    searchContainer: {
      marginBottom: spacing.lg,
    },
    searchInput: {
      margin: 0,
    },
    section: {
      marginBottom: spacing.xxl,
    },
    sectionTitle: {
      ...typography.h5,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.lg,
    },
    serviceCard: {
      marginBottom: spacing.lg,
    },
    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceText: {
      flex: 1,
    },
    serviceTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    serviceMeta: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    noResultsText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xl,
    },
    footerLogo: {
      width: 24,
      height: 24,
    },
    footerText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
}
