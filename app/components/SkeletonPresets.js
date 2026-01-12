import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

/**
 * Pre-configured skeleton loading presets for common UI patterns
 * Used by banking and financial apps for consistent loading states
 */

// News Feed Loading
export const NewsListSkeleton = ({ count = 3, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="news" count={count} />
  </View>
);

// Dashboard Loading
export const DashboardSkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="dashboard" />
  </View>
);

// Profile Screen Loading
export const ProfileScreenSkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="profile" />
    <View style={styles.spacer} />
    <SkeletonLoader type="list-item" count={4} />
  </View>
);

// Form Loading
export const FormSkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="form" />
  </View>
);

// List Screen Loading
export const ListScreenSkeleton = ({ count = 5, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="list-item" count={count} />
  </View>
);

// Table Loading
export const TableSkeleton = ({ rows = 5, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <SkeletonLoader type="table-row" count={rows} />
  </View>
);

// Card Grid Loading
export const CardGridSkeleton = ({ count = 4, style, testID }) => (
  <View style={[styles.gridContainer, style]} testID={testID}>
    {Array.from({ length: count }, (_, index) => (
      <View key={`card-${index}`} style={styles.gridItem}>
        <SkeletonLoader type="card" />
      </View>
    ))}
  </View>
);

// Chat Loading
export const ChatSkeleton = ({ messageCount = 3, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    {Array.from({ length: messageCount }, (_, index) => (
      <View key={`message-${index}`} style={[
        styles.messageContainer,
        index % 2 === 0 ? styles.messageLeft : styles.messageRight
      ]}>
        <SkeletonLoader 
          type="text" 
          width={index % 2 === 0 ? '70%' : '60%'} 
          height={40} 
        />
      </View>
    ))}
  </View>
);

// Search Results Loading
export const SearchResultsSkeleton = ({ count = 4, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <View style={styles.searchHeader}>
      <SkeletonLoader type="text" width="40%" height={16} />
      <SkeletonLoader type="text" width="20%" height={14} />
    </View>
    <SkeletonLoader type="list-item" count={count} />
  </View>
);

// Navigation Menu Loading
export const NavigationSkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <View style={styles.navHeader}>
      <SkeletonLoader type="circle" width={60} height={60} />
      <View style={styles.navHeaderText}>
        <SkeletonLoader type="text" width="80%" height={18} />
        <SkeletonLoader type="text" width="60%" height={14} />
      </View>
    </View>
    <SkeletonLoader type="list-item" count={6} />
  </View>
);

// Settings Screen Loading
export const SettingsSkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    {/* Settings sections */}
    {Array.from({ length: 3 }, (_, sectionIndex) => (
      <View key={`section-${sectionIndex}`} style={styles.settingsSection}>
        <SkeletonLoader type="text" width="30%" height={16} />
        <View style={styles.spacerSmall} />
        <SkeletonLoader type="list-item" count={3} />
      </View>
    ))}
  </View>
);

// Transaction List Loading (Banking specific)
export const TransactionListSkeleton = ({ count = 8, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    {Array.from({ length: count }, (_, index) => (
      <View key={`transaction-${index}`} style={styles.transactionItem}>
        <SkeletonLoader type="circle" width={40} height={40} />
        <View style={styles.transactionContent}>
          <SkeletonLoader type="text" width="70%" height={16} />
          <SkeletonLoader type="text" width="50%" height={12} />
        </View>
        <View style={styles.transactionAmount}>
          <SkeletonLoader type="text" width={60} height={16} />
          <SkeletonLoader type="text" width={40} height={12} />
        </View>
      </View>
    ))}
  </View>
);

// Account Summary Loading (Banking specific)
export const AccountSummarySkeleton = ({ style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    <View style={styles.accountHeader}>
      <SkeletonLoader type="text" width="60%" height={20} />
      <SkeletonLoader type="text" width="40%" height={32} />
    </View>
    <View style={styles.accountActions}>
      <SkeletonLoader type="button" width={80} height={36} />
      <SkeletonLoader type="button" width={80} height={36} />
      <SkeletonLoader type="button" width={80} height={36} />
    </View>
  </View>
);

// Document List Loading
export const DocumentListSkeleton = ({ count = 5, style, testID }) => (
  <View style={[styles.container, style]} testID={testID}>
    {Array.from({ length: count }, (_, index) => (
      <View key={`document-${index}`} style={styles.documentItem}>
        <SkeletonLoader type="circle" width={32} height={32} />
        <View style={styles.documentContent}>
          <SkeletonLoader type="text" width="80%" height={16} />
          <SkeletonLoader type="text" width="40%" height={12} />
        </View>
        <SkeletonLoader type="circle" width={24} height={24} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  spacer: {
    height: 24,
  },
  spacerSmall: {
    height: 12,
  },
  messageContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  navHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  settingsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  transactionContent: {
    flex: 1,
    marginLeft: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  accountHeader: {
    padding: 20,
    alignItems: 'center',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  documentContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default {
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
};