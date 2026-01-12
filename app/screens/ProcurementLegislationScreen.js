import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import RAIcon from '../assets/icon.png';
import { DetailCard, ListScreenSkeleton, ErrorState, EmptyState } from '../components';
import { procurementLegislationService } from '../services/procurementService';
import { documentDownloadService } from '../services/documentDownloadService';
import useDocumentDownload from '../hooks/useDocumentDownload';

export default function ProcurementLegislationScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [legislationData, setLegislationData] = useState({
    act: [],
    regulations: [],
    guidelines: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);

  // Use the document download hook
  const {
    isDownloading,
    progress,
    error: downloadError,
    downloadedUri,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  const fetchLegislation = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      // Fetch all sections
      const [actItems, regulationsItems, guidelinesItems] = await Promise.all([
        procurementLegislationService.getLegislationBySection('act'),
        procurementLegislationService.getLegislationBySection('regulations'),
        procurementLegislationService.getLegislationBySection('guidelines'),
      ]);

      setLegislationData({
        act: actItems || [],
        regulations: regulationsItems || [],
        guidelines: guidelinesItems || [],
      });
    } catch (err) {
      console.error('Error fetching legislation:', err);
      setError(err.message || 'Failed to load legislation documents');
      if (isRefresh) {
        Alert.alert('Error', 'Failed to refresh legislation. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLegislation();
  }, [fetchLegislation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLegislation(true);
  }, [fetchLegislation]);

  const handleDownload = async (document) => {
    if (!document.documentUrl) {
      Alert.alert('Error', 'No document available for download');
      return;
    }

    try {
      setCurrentDownloadId(document.id);
      resetDownload();
      await startDownload(document.documentUrl, document.documentFileName || document.title);
      setCurrentDownloadId(null);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download document. Please try again.');
      setCurrentDownloadId(null);
    }
  };

  const legislationSections = [
    {
      id: 'act',
      title: 'Act',
      documents: legislationData.act,
    },
    {
      id: 'regulations',
      title: 'Regulations',
      documents: legislationData.regulations,
    },
    {
      id: 'guidelines',
      title: 'Guidelines',
      documents: legislationData.guidelines,
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ListScreenSkeleton count={4} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error}
          onRetry={() => fetchLegislation()}
        />
      </View>
    );
  }

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
        <View style={styles.header}>
          <Image source={RAIcon} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Procurement Legislation</Text>
          <Text style={styles.headerSubtitle}>Roads Authority Namibia</Text>
        </View>

        {legislationSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.headerLine, { backgroundColor: colors.primary }]} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.documents.length === 0 ? (
              <EmptyState
                icon="document-text-outline"
                message={`No ${section.title.toLowerCase()} documents available`}
              />
            ) : (
              section.documents.map((document) => {
                const isItemDownloading = isDownloading && currentDownloadId === document.id;
                return (
                  <DetailCard
                    key={document.id}
                    title={document.title}
                    titleStyle={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}
                    downloadButton={!!document.documentUrl}
                    downloadButtonText="Download PDF"
                    downloadButtonDisabled={isItemDownloading}
                    isDownloading={isItemDownloading}
                    downloadProgress={progress}
                    onDownloadPress={() => handleDownload(document)}
                    style={{ marginBottom: 12 }}
                  />
                );
              })
            )}
          </View>
        ))}
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
      padding: 15,
      paddingBottom: 25,
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
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerLine: {
      width: 4,
      height: 24,
      borderRadius: 2,
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
  });
}
