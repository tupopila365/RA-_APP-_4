import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RATheme } from '../theme/colors';
import SkeletonLoader from './SkeletonLoader';
import {
  NewsListSkeleton,
  DashboardSkeleton,
  ProfileScreenSkeleton,
  FormSkeleton,
  ListScreenSkeleton,
  TableSkeleton,
  CardGridSkeleton,
  ChatSkeleton,
  SearchResultsSkeleton,
  NavigationSkeleton,
  SettingsSkeleton,
  TransactionListSkeleton,
  AccountSummarySkeleton,
  DocumentListSkeleton,
} from './SkeletonPresets';

/**
 * Demo component showcasing all skeleton loading states
 * Used for development and testing purposes
 */
export default function SkeletonDemo() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [selectedDemo, setSelectedDemo] = useState('basic');

  const demoSections = [
    {
      id: 'basic',
      title: 'Basic Types',
      component: <BasicSkeletonDemo />,
    },
    {
      id: 'presets',
      title: 'Preset Components',
      component: <PresetSkeletonDemo />,
    },
    {
      id: 'banking',
      title: 'Banking Specific',
      component: <BankingSkeletonDemo />,
    },
    {
      id: 'interactive',
      title: 'Interactive Examples',
      component: <InteractiveSkeletonDemo />,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Skeleton Loading Demo</Text>
        <Text style={styles.subtitle}>Modern Banking App Style</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {demoSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.tab,
              selectedDemo === section.id && styles.tabActive,
            ]}
            onPress={() => setSelectedDemo(section.id)}
          >
            <Text
              style={[
                styles.tabText,
                selectedDemo === section.id && styles.tabTextActive,
              ]}
            >
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {demoSections.find((s) => s.id === selectedDemo)?.component}
      </ScrollView>
    </SafeAreaView>
  );
}

// Basic skeleton types demo
const BasicSkeletonDemo = () => (
  <View style={styles.section}>
    <DemoSection title="Card Skeleton">
      <SkeletonLoader type="card" />
    </DemoSection>

    <DemoSection title="List Item Skeleton">
      <SkeletonLoader type="list-item" count={3} />
    </DemoSection>

    <DemoSection title="News Skeleton">
      <SkeletonLoader type="news" />
    </DemoSection>

    <DemoSection title="Profile Skeleton">
      <SkeletonLoader type="profile" />
    </DemoSection>

    <DemoSection title="Table Row Skeleton">
      <SkeletonLoader type="table-row" count={4} />
    </DemoSection>

    <DemoSection title="Form Skeleton">
      <SkeletonLoader type="form" />
    </DemoSection>

    <DemoSection title="Dashboard Skeleton">
      <SkeletonLoader type="dashboard" />
    </DemoSection>

    <DemoSection title="Basic Elements">
      <View style={styles.elementRow}>
        <SkeletonLoader type="button" width={100} height={40} />
        <SkeletonLoader type="circle" width={40} height={40} />
        <SkeletonLoader type="text" width={120} height={16} />
      </View>
    </DemoSection>
  </View>
);

// Preset components demo
const PresetSkeletonDemo = () => (
  <View style={styles.section}>
    <DemoSection title="News List Skeleton">
      <NewsListSkeleton count={2} />
    </DemoSection>

    <DemoSection title="List Screen Skeleton">
      <ListScreenSkeleton count={3} />
    </DemoSection>

    <DemoSection title="Table Skeleton">
      <TableSkeleton rows={4} />
    </DemoSection>

    <DemoSection title="Card Grid Skeleton">
      <CardGridSkeleton count={4} />
    </DemoSection>

    <DemoSection title="Chat Skeleton">
      <ChatSkeleton messageCount={3} />
    </DemoSection>

    <DemoSection title="Search Results Skeleton">
      <SearchResultsSkeleton count={3} />
    </DemoSection>

    <DemoSection title="Navigation Skeleton">
      <NavigationSkeleton />
    </DemoSection>

    <DemoSection title="Settings Skeleton">
      <SettingsSkeleton />
    </DemoSection>
  </View>
);

// Banking specific skeletons
const BankingSkeletonDemo = () => (
  <View style={styles.section}>
    <DemoSection title="Transaction List">
      <TransactionListSkeleton count={4} />
    </DemoSection>

    <DemoSection title="Account Summary">
      <AccountSummarySkeleton />
    </DemoSection>

    <DemoSection title="Document List">
      <DocumentListSkeleton count={3} />
    </DemoSection>

    <DemoSection title="Dashboard Widget">
      <DashboardSkeleton />
    </DemoSection>

    <DemoSection title="Profile Screen">
      <ProfileScreenSkeleton />
    </DemoSection>

    <DemoSection title="Form Screen">
      <FormSkeleton />
    </DemoSection>
  </View>
);

// Interactive examples
const InteractiveSkeletonDemo = () => {
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(3);

  return (
    <View style={styles.section}>
      <DemoSection title="Animation Control">
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, animationEnabled && styles.controlButtonActive]}
            onPress={() => setAnimationEnabled(!animationEnabled)}
          >
            <Text style={styles.controlButtonText}>
              Animation: {animationEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        <SkeletonLoader type="card" animated={animationEnabled} />
      </DemoSection>

      <DemoSection title="Count Control">
        <View style={styles.controlRow}>
          {[1, 2, 3, 4, 5].map((count) => (
            <TouchableOpacity
              key={count}
              style={[styles.countButton, skeletonCount === count && styles.countButtonActive]}
              onPress={() => setSkeletonCount(count)}
            >
              <Text style={styles.countButtonText}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SkeletonLoader type="list-item" count={skeletonCount} />
      </DemoSection>

      <DemoSection title="Custom Dimensions">
        <View style={styles.customRow}>
          <SkeletonLoader type="text" width="100%" height={20} />
          <SkeletonLoader type="text" width="80%" height={16} />
          <SkeletonLoader type="text" width="60%" height={14} />
        </View>
      </DemoSection>
    </View>
  );
};

// Demo section wrapper
const DemoSection = ({ title, children }) => {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  return (
    <View style={styles.demoSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    tabContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
    },
    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    content: {
      flex: 1,
    },
    section: {
      padding: 20,
    },
    demoSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
    },
    elementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    controlRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    controlButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    controlButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    countButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    countButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    countButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    customRow: {
      gap: 8,
    },
  });