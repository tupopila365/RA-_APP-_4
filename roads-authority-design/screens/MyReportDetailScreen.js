import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components';
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../data/myReports';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { getReportById } from '../services/potholeReportsService';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const SEVERITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

export function MyReportDetailScreen({ report: initialReport, onBack }) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(!!initialReport?.id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialReport?.id) {
      setReport(initialReport);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getReportById(initialReport.id)
      .then((data) => {
        if (!cancelled && data) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load report');
          setReport(initialReport);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [initialReport?.id]);

  if (!report && !loading) return null;

  const statusLabel = report ? (REPORT_STATUS_LABELS[report.status] || report.status) : '';
  const statusColor = report ? (REPORT_STATUS_COLORS[report.status] || NEUTRAL_COLORS.gray500) : NEUTRAL_COLORS.gray500;

  if (loading && !report) {
    return (
      <ScreenContainer contentContainerStyle={styles.content}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading report…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: report.image }} style={styles.image} resizeMode="cover" />
        <View style={[styles.statusBadge, { backgroundColor: statusColor + 'EE' }]}>
          <Text style={styles.statusBadgeText}>{statusLabel}</Text>
        </View>
      </View>

      {report.referenceCode ? (
        <Text style={styles.reference}>Reference: {report.referenceCode}</Text>
      ) : (
        <Text style={styles.reference}>Report #{report.id}</Text>
      )}
      <Text style={styles.date}>{formatDate(report.submittedAt)}</Text>

      {report.severity ? (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="alert-circle-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
            <Text style={styles.sectionLabel}>Severity</Text>
          </View>
          <Text style={styles.sectionValue}>{SEVERITY_LABELS[report.severity] || report.severity}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Ionicons name="location-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Location</Text>
        </View>
        <Text style={styles.sectionValue}>{report.location}</Text>
      </View>

      {report.description ? (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="document-text-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
            <Text style={styles.sectionLabel}>Description</Text>
          </View>
          <Text style={styles.sectionValue}>{report.description}</Text>
        </View>
      ) : null}

      {report.assignedTo ? (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="person-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
            <Text style={styles.sectionLabel}>Assigned to</Text>
          </View>
          <Text style={styles.sectionValue}>{report.assignedTo}</Text>
        </View>
      ) : null}

      {report.adminNotes ? (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
            <Text style={styles.sectionLabel}>Admin notes</Text>
          </View>
          <Text style={styles.sectionValue}>{report.adminNotes}</Text>
        </View>
      ) : null}

      {report.fixedAt ? (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={PRIMARY} style={styles.sectionIcon} />
            <Text style={styles.sectionLabel}>Fixed on</Text>
          </View>
          <Text style={styles.sectionValue}>{formatDate(report.fixedAt)}</Text>
        </View>
      ) : null}

      {report.repairPhotoUrl ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Repair photo</Text>
          <Image source={{ uri: report.repairPhotoUrl }} style={styles.repairImage} resizeMode="cover" />
        </View>
      ) : null}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: '#DC2626',
    marginTop: spacing.sm,
  },
  imageWrap: {
    width: '100%',
    height: 220,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: NEUTRAL_COLORS.gray200,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 0,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
  },
  reference: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: NEUTRAL_COLORS.gray700,
  },
  sectionValue: {
    ...typography.body,
    color: NEUTRAL_COLORS.gray900,
    lineHeight: 24,
    marginLeft: 28,
  },
  repairImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: NEUTRAL_COLORS.gray200,
    marginTop: spacing.sm,
  },
});
