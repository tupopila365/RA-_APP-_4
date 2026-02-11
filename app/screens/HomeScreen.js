import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import { SearchInput } from '../components';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import RAIcon from '../assets/icon.png';

const BRAND = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  border: '#E7EDF6',
  heading: '#0B3C78',
  muted: '#94A7C0',
  tagBlue: '#00AEEF',
  heroBg: '#0B4A86',
  heroBorder: '#1762A8',
  heroBody: '#B9D1EB',
  heroText: '#E8F2FF',
  heroPrimary: '#12B8FF',
  heroSecondary: '#35679B',
  heroSecondaryBorder: '#4C7CAA',
  accentYellow: '#FDC010',
  alertRed: '#E11D48',
  successGreen: '#0BAE68',
  waitBlue: '#0B3C78',
};

const CARD_MAP = [
  {
    id: 'road',
    title: 'Live Road Status',
    subtitle: 'MAP & REAL-TIME UPDATES',
    icon: 'map-outline',
    color: '#0AB36D',
    route: 'RoadStatus',
    featured: true,
  },
  {
    id: 'report',
    title: 'Report Damage',
    subtitle: 'HELP US FIX ROADS',
    icon: 'warning-outline',
    color: '#FF2D55',
    route: 'ReportPothole',
  },
  {
    id: 'apply',
    title: 'Apply Online',
    subtitle: 'PERMITS & LICENSES',
    icon: 'document-text-outline',
    color: '#2563FF',
    route: 'Applications',
  },
  {
    id: 'submissions',
    title: 'My Submissions',
    subtitle: 'TRACK YOUR REPORTS',
    icon: 'clipboard-outline',
    color: '#4F46E5',
    route: 'MyReports',
  },
  {
    id: 'forms',
    title: 'Forms & Docs',
    subtitle: 'OFFICIAL DOWNLOADS',
    icon: 'folder-outline',
    color: '#F08A00',
    route: 'Forms',
  },
  {
    id: 'press',
    title: 'Press Center',
    subtitle: 'LATEST RA NEWS',
    icon: 'newspaper-outline',
    color: '#8A94A6',
    route: 'News',
  },
  {
    id: 'offices',
    title: 'RA Offices',
    subtitle: 'FIND NEAREST BRANCH',
    icon: 'location-outline',
    color: '#06B6D4',
    route: 'Offices',
  },
];

const MENU_GROUPS = [
  {
    title: 'ACCOUNT MANAGEMENT',
    items: [
      { icon: 'person-outline', label: 'MY PROFILE', route: 'Settings' },
      { icon: 'notifications-outline', label: 'NOTIFICATIONS', route: 'Notifications' },
      { icon: 'shield-outline', label: 'SECURITY & PRIVACY', route: 'Settings' },
    ],
  },
  {
    title: 'SUPPORT & INFO',
    items: [
      { icon: 'call-outline', label: 'CONTACT SUPPORT', route: 'Settings' },
      { icon: 'open-outline', label: 'OFFICIAL WEBSITE', route: 'RAServices' },
      { icon: 'document-text-outline', label: 'TERMS OF SERVICE', route: 'Settings' },
    ],
  },
];

const STAT_CARDS = [
  { id: 'alerts', label: 'ACTIVE\nALERTS', value: '03', valueColor: BRAND.alertRed },
  { id: 'offices', label: 'OFFICES\nOPEN', value: '12', valueColor: BRAND.successGreen },
  { id: 'wait', label: 'WAIT TIME', value: '15m', valueColor: BRAND.waitBlue },
];

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAppContext();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const styles = useMemo(() => getStyles(colors, width), [colors, width]);

  const visibleCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CARD_MAP;
    return CARD_MAP.filter((card) =>
      `${card.title} ${card.subtitle}`.toLowerCase().includes(q)
    );
  }, [query]);

  const openRoute = (route) => {
    if (route) navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']} style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brandTitle}>ROADS AUTHORITY</Text>
              <Text style={styles.brandTagline}>SAFE ROADS TO PROSPERITY</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => navigation.navigate('Notifications')}
                accessibilityLabel="Open notifications"
              >
                <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => setMenuVisible(true)}
                accessibilityLabel="Open navigation menu"
              >
                <Ionicons name="menu-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <SearchInput
            placeholder="How can we help you today?"
            value={query}
            onSearch={setQuery}
            onChangeTextImmediate={setQuery}
            onClear={() => setQuery('')}
            accessibilityLabel="Search services"
          />
        </SafeAreaView>

        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroBadgeRow}>
              <Ionicons name="information-circle" size={18} color={BRAND.accentYellow} />
              <Text style={styles.heroBadgeText}>NATIONAL INFRASTRUCTURE</Text>
            </View>
            <Text style={styles.heroHeading}>Safe Roads to Prosperity</Text>
            <Text style={styles.heroBody}>
              Namibia's official portal for national road services and infrastructure updates.
            </Text>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity style={styles.heroPrimaryButton} onPress={() => openRoute('News')}>
                <Text style={styles.heroPrimaryText}>LATEST NEWS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroSecondaryButton} onPress={() => openRoute('RAServices')}>
                <Text style={styles.heroSecondaryText}>ABOUT RA</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            {STAT_CARDS.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={[styles.statValue, { color: stat.valueColor }]}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>GOVERNMENT SERVICES</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>

          {visibleCards.map((card) => {
            if (card.featured) {
              return (
                <TouchableOpacity
                  key={card.id}
                  style={styles.featureCard}
                  activeOpacity={0.8}
                  onPress={() => openRoute(card.route)}
                >
                  <View
                    style={[
                      styles.serviceIconWrap,
                      { backgroundColor: `${card.color}1A`, borderColor: `${card.color}40` },
                    ]}
                  >
                    <Ionicons name={card.icon} size={22} color={card.color} />
                  </View>
                  <Text style={styles.featureTitle}>{card.title}</Text>
                  <Text style={styles.serviceSubtitle}>{card.subtitle}</Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={card.id}
                style={styles.gridCard}
                activeOpacity={0.8}
                onPress={() => openRoute(card.route)}
              >
                <View
                  style={[
                    styles.serviceIconWrap,
                    { backgroundColor: `${card.color}14`, borderColor: `${card.color}30` },
                  ]}
                >
                  <Ionicons name={card.icon} size={22} color={card.color} />
                </View>
                <Text style={styles.gridTitle}>{card.title}</Text>
                <Text style={styles.serviceSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerBackdrop} onPress={() => setMenuVisible(false)} />

          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <View style={styles.avatarWrap}>
                <Ionicons name="person-outline" size={20} color={BRAND.accentYellow} />
              </View>
              <View style={styles.drawerHeaderText}>
                <Text style={styles.drawerName}>{user?.fullName || 'JOHN DOE'}</Text>
                <Text style={styles.drawerTier}>PREMIUM ROAD USER</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerBody}>
              {MENU_GROUPS.map((group, index) => (
                <View key={group.title} style={index > 0 ? styles.drawerGroupSpacing : undefined}>
                  <Text style={styles.drawerSection}>{group.title}</Text>
                  {group.items.map((item) => (
                    <DrawerItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      onPress={() => {
                        setMenuVisible(false);
                        openRoute(item.route);
                      }}
                    />
                  ))}
                </View>
              ))}

              <TouchableOpacity
                style={styles.logoutRow}
                onPress={() => {
                  setMenuVisible(false);
                  openRoute('Settings');
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#F43F5E" />
                <Text style={styles.logoutText}>LOG OUT OF PORTAL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterHeading}>ROADS AUTHORITY • 2026</Text>
              <Text style={styles.drawerFooterText}>VERSION 4.2.0-NAM (STABLE)</Text>
              <Text style={styles.drawerFooterText}>DIGITAL INFRASTRUCTURE UNIT</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DrawerItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={drawerStyles.item} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={19} color="#C6D2E2" />
      <Text style={drawerStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

DrawerItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

const drawerStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#123C73',
  },
});

function getStyles(colors, width) {
  const sidePadding = spacing.xl;
  const gridGap = spacing.md;
  const gridCardWidth = (width - sidePadding * 2 - gridGap) / 2;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BRAND.background,
    },
    scrollContent: {
      paddingBottom: 144,
    },
    headerContainer: {
      backgroundColor: BRAND.background,
      borderBottomWidth: 1,
      borderBottomColor: BRAND.border,
      paddingHorizontal: sidePadding,
      paddingBottom: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    brandTitle: {
      color: BRAND.heading,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    brandTagline: {
      color: BRAND.tagBlue,
      fontSize: 12,
      letterSpacing: 2.4,
      fontWeight: '700',
      marginTop: spacing.xs,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerIconButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    notificationDot: {
      position: 'absolute',
      top: 7,
      right: 5,
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: BRAND.heroPrimary,
      borderWidth: 1,
      borderColor: BRAND.background,
    },
    content: {
      paddingHorizontal: sidePadding,
      paddingTop: spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    heroCard: {
      width: '100%',
      backgroundColor: BRAND.heroBg,
      borderRadius: 32,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: BRAND.heroBorder,
      shadowColor: BRAND.heroBg,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    heroBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    heroBadgeText: {
      color: BRAND.accentYellow,
      letterSpacing: 1.8,
      fontWeight: '700',
      fontSize: 10,
    },
    heroHeading: {
      color: BRAND.heroText,
      fontSize: 40,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    heroBody: {
      ...typography.bodySmall,
      color: BRAND.heroBody,
      lineHeight: 20,
      marginBottom: spacing.lg,
      maxWidth: '88%',
    },
    heroActionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    heroPrimaryButton: {
      backgroundColor: BRAND.heroPrimary,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md - 2,
    },
    heroPrimaryText: {
      color: '#F3FCFF',
      fontSize: 11,
      letterSpacing: 1.2,
      fontWeight: '700',
    },
    heroSecondaryButton: {
      backgroundColor: BRAND.heroSecondary,
      borderRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md - 2,
      borderWidth: 1,
      borderColor: BRAND.heroSecondaryBorder,
    },
    heroSecondaryText: {
      color: '#DBE8F6',
      fontSize: 11,
      letterSpacing: 1,
      fontWeight: '700',
    },
    statsRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
      backgroundColor: BRAND.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: BRAND.border,
      minHeight: 84,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      shadowColor: '#123C73',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    statLabel: {
      color: BRAND.muted,
      fontSize: 10.5,
      letterSpacing: 1.2,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '800',
    },
    sectionHeaderRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: BRAND.heading,
      fontWeight: '800',
      letterSpacing: 1.6,
      fontSize: 14,
    },
    featureCard: {
      width: '100%',
      backgroundColor: BRAND.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: BRAND.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
      minHeight: 120,
    },
    gridCard: {
      width: gridCardWidth,
      backgroundColor: BRAND.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: BRAND.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
      minHeight: 152,
    },
    serviceIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    featureTitle: {
      color: '#0C3F79',
      fontSize: 30,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    gridTitle: {
      color: '#0C3F79',
      fontSize: 30,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    serviceSubtitle: {
      color: BRAND.muted,
      fontSize: 11,
      letterSpacing: 0.45,
      fontWeight: '700',
      lineHeight: 14,
    },
    drawerOverlay: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(9, 24, 47, 0.44)',
    },
    drawerBackdrop: {
      flex: 1,
    },
    drawerPanel: {
      width: '82%',
      backgroundColor: BRAND.surface,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      overflow: 'hidden',
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: '#EFF3F8',
    },
    avatarWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: BRAND.heroBg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: BRAND.heroBg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    drawerHeaderText: {
      flex: 1,
    },
    drawerName: {
      color: BRAND.heading,
      fontWeight: '700',
      fontSize: 14,
    },
    drawerTier: {
      color: '#9EB0C8',
      fontWeight: '700',
      fontSize: 10,
      letterSpacing: 1,
      marginTop: 2,
    },
    drawerBody: {
      paddingHorizontal: spacing.xl + 2,
      paddingTop: spacing.lg,
    },
    drawerGroupSpacing: {
      marginTop: spacing.xl,
    },
    drawerSection: {
      color: '#C1CDDD',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2,
      marginBottom: spacing.sm,
    },
    logoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xl,
      paddingVertical: spacing.sm,
    },
    logoutText: {
      color: '#F43F5E',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    drawerFooter: {
      marginTop: 'auto',
      borderTopWidth: 1,
      borderTopColor: '#F0F4FA',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    drawerFooterHeading: {
      color: '#D1DBE8',
      fontWeight: '700',
      letterSpacing: 2,
      fontSize: 10,
      marginBottom: spacing.xs,
    },
    drawerFooterText: {
      color: '#E0E8F2',
      fontWeight: '700',
      letterSpacing: 1.2,
      fontSize: 8,
    },
  });
}

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

