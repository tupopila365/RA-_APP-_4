import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RATheme } from '../theme/colors';
import { EmptyState, LoadingSpinner, TabBar, ProcurementTable } from '../components';
import RAIcon from '../assets/icon.png';

export default function OpeningRegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('opportunities');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with actual API calls
  const procurementOpportunities = [
    {
      id: '1',
      reference: 'NCS/ONB/RA-01/2025',
      description: 'Provision of Cash-in-Transit Services at different Roads Authority NaTIS Offices',
      bidOpeningDate: '2025-11-20',
      status: 'Closed',
      noticeUrl: 'https://example.com/Bid Opening - Cash-in-Transit.20.11.2025_rotated.pdf',
      noticeFileName: 'Bid Opening - Cash-in-Transit.20.11.2025_rotated.pdf',
    },
    {
      id: '2',
      reference: 'W/ONB/RA-03/2025',
      description: 'Mowing of Grass in the Road Reserves in the Windhoek /Otjiwarongo / Rundu Regions',
      bidOpeningDate: '2025-09-04',
      status: 'Closed',
      noticeUrl: 'https://example.com/Mowing of Grass in Whk-Ott-Run.pdf',
      noticeFileName: 'Mowing of Grass in Whk-Ott-Run.pdf',
    },
    {
      id: '3',
      reference: 'W/ONB/RA-04/2025',
      description: 'Painting of Road Traffic Markings on Surface Roads in the Oshakati Region',
      bidOpeningDate: '2025-08-28',
      status: 'Closed',
      noticeUrl: 'https://example.com/Bid Opening - Painting of Road Markings. 28.08.2025_rotated.pdf',
      noticeFileName: 'Bid Opening - Painting of Road Markings. 28.08.2025_rotated.pdf',
    },
  ];

  const rfqs = [
    {
      id: 'rfq1',
      reference: 'W/RFQ/RA-07/2025',
      description: 'Minor repairs at NaTIS Valley Office',
      bidOpeningDate: '2025-12-09',
      status: 'Closed',
      noticeUrl: 'https://example.com/doc00161320251209103346_rotated.pdf',
      noticeFileName: 'doc00161320251209103346_rotated.pdf',
    },
    {
      id: 'rfq2',
      reference: 'W/RFQ/RA-06/2025',
      description: 'Minor repairs at the Western NaTIS Offices',
      bidOpeningDate: '2025-12-08',
      status: 'Closed',
      noticeUrl: 'https://example.com/doc00181520251211074124_rotated.pdf',
      noticeFileName: 'doc00181520251211074124_rotated.pdf',
    },
    {
      id: 'rfq3',
      reference: 'NCS/RFQ/RA-21/2025',
      description: 'Provision of Leasing Photocopier Machines Services',
      bidOpeningDate: '2025-12-08',
      status: 'Closed',
      noticeUrl: 'https://example.com/doc00181320251211073956_rotated.pdf',
      noticeFileName: 'doc00181320251211073956_rotated.pdf',
    },
    {
      id: 'rfq4',
      reference: 'G/RFQ/RA-45/2025',
      description: 'Supply and Delivery of Office Furniture',
      bidOpeningDate: '2025-12-04',
      status: 'Closed',
      noticeUrl: 'https://example.com/doc00135620251208091357_rotated.pdf',
      noticeFileName: 'doc00135620251208091357_rotated.pdf',
    },
    {
      id: 'rfq5',
      reference: 'G/RFQ/RA-44/2025',
      description: 'Supply and Delivery of Office Furniture',
      bidOpeningDate: '2025-11-25',
      status: 'Closed',
      noticeUrl: 'https://example.com/1937_001_rotated.pdf',
      noticeFileName: '1937_001_rotated.pdf',
    },
  ];

  const tabs = [
    {
      id: 'opportunities',
      label: 'Open Procurement Opportunities',
      count: procurementOpportunities.length,
    },
    {
      id: 'rfqs',
      label: 'RFQS',
      count: rfqs.length,
    },
  ];

  const currentData = activeTab === 'opportunities' ? procurementOpportunities : rfqs;

  const handleDownload = (item) => {
    // TODO: Implement download functionality using documentDownloadService
    console.log('Download notice:', item.noticeUrl);
    // Example: documentDownloadService.download(item.noticeUrl, item.noticeFileName);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch fresh data from API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={RAIcon} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Opening Register</Text>
          <Text style={styles.headerSubtitle}>Roads Authority Namibia</Text>
        </View>

        {/* Tabs */}
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          testID="opening-register-tabs"
        />

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : currentData.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            message={`No ${activeTab === 'opportunities' ? 'procurement opportunities' : 'RFQS'} available`}
            accessibilityLabel="No data available"
          />
        ) : (
          <ProcurementTable items={currentData} onDownload={handleDownload} />
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
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
      paddingVertical: 24,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
