import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RATheme } from '../theme/colors';
import RAIcon from '../assets/icon.png';

import {
  DetailCard,
  ListScreenSkeleton,
  ErrorState,
  EmptyState,
} from '../components';

import { procurementPlanService } from '../services/procurementService';
import useDocumentDownload from '../hooks/useDocumentDownload';

export default function ProcurementPlanScreen() {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const [annualPlans, setAnnualPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentDownloadId, setCurrentDownloadId] = useState(null);

  const {
    isDownloading,
    progress,
    startDownload,
    resetDownload,
  } = useDocumentDownload();

  /* -------------------- DATA FETCH -------------------- */

  const fetchPlans = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const plans = await procurementPlanService.getPlans();
      setAnnualPlans(plans || []);
    } catch (err) {
      console.error('Error fetching procurement plans:', err);
      setError(err?.message || 'Failed to load procurement plans');

      if (isRefresh) {
        Alert.alert(
          'Refresh failed',
          'Unable to refresh procurement plans. Please try again.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlans(true);
  }, [fetchPlans]);

  /* -------------------- DOWNLOAD -------------------- */

  const handleDownload = async (plan) => {
    if (!plan?.documentUrl) {
      Alert.alert('Unavailable', 'No document available for download.');
      return;
    }

    try {
      setCurrentDownloadId(plan.id);
      resetDownload();

      await startDownload(
        plan.documentUrl,
        plan.documentFileName ||
          `${plan.fiscalYear} Annual Procurement Plan`
      );
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert(
        'Download failed',
        'Unable to download the document. Please try again.'
      );
    } finally {
      setCurrentDownloadId(null);
    }
  };

  /* -------------------- STATES -------------------- */

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ListScreenSkeleton count={3} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={fetchPlans} />
      </View>
    );
  }

  /* -------------------- UI -------------------- */

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
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Image source={RAIcon} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Procurement Plan</Text>
          <Text style={styles.headerSubtitle}>
            Roads Authority Namibia
          </Text>
        </View>

        {/* ---------- SECTION ---------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.headerLine,
                { backgroundColor: colors.primary },
              ]}
            />
            <Text style={styles.sectionTitle}>
              Annual Procurement Plans
            </Text>
          </View>

          {annualPlans.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              message="No procurement plans available"
            />
          ) : (
            annualPlans.map((plan) => {
              const isItemDownloading =
                isDownloading && currentDownloadId === plan.id;

              return (
                <DetailCard
                  key={plan.id}
                  title={`${plan.fiscalYear} Annual Procurement Plan`}
                  titleStyle={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                  downloadButton={!!plan.documentUrl}
                  downloadButtonText="Download PDF"
                  downloadButtonDisabled={isItemDownloading}
                  isDownloading={isItemDownloading}
                  downloadProgress={progress}
                  onDownloadPress={() => handleDownload(plan)}
                  style={{ marginBottom: 12 }}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */

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
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#ffff',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.0,
      shadowRadius: 0,
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

