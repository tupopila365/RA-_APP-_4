import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, SearchBar } from '../components';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../data/myApplications';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { NEUTRAL_COLORS } from '../theme/colors';
import { PRIMARY } from '../theme/colors';
import { getMyApplications } from '../services/plnService';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function mapAppFromApi(api) {
  const status = (api.status || '').toLowerCase().replace(/\s+/g, '_');
  const nextStepsByStatus = {
    submitted: 'We have received your application. Review usually takes 5–7 working days.',
    under_review: 'Your documents are being verified. We will notify you once the review is complete.',
    approved: 'Your plates are ready. Bring your ID to the nearest RA office to collect.',
    declined: 'Your application was declined. Contact us for more information.',
    payment_pending: 'Payment is required. Please complete payment by the deadline.',
    paid: 'Payment received. Your application is being processed.',
    plates_ordered: 'Plates have been ordered. We will notify you when ready for collection.',
    ready_for_collection: 'Your plates are ready for collection at the office.',
    expired: 'This application has expired.',
  };
  return {
    id: String(api.id),
    referenceNumber: api.referenceId || api.referenceNumber || '',
    type: 'PLN Application',
    submittedAt: api.createdAt || api.submittedAt,
    status,
    statusHistory: Array.isArray(api.statusHistory) ? api.statusHistory : null,
    nextSteps: api.adminComments || nextStepsByStatus[status] || '',
    trackingPin: api.trackingPin,
    plateChoices: api.plateChoices,
    paymentDeadline: api.paymentDeadline,
    paymentReceivedAt: api.paymentReceivedAt,
    adminComments: api.adminComments,
  };
}

function filterApplications(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.trim().toLowerCase();
  return items.filter(
    (a) =>
      (a.referenceNumber && a.referenceNumber.toLowerCase().includes(q)) ||
      (a.type && a.type.toLowerCase().includes(q)) ||
      (APPLICATION_STATUS_LABELS[a.status] || '').toLowerCase().includes(q)
  );
}

function StatusBadge({ status }) {
  const label = APPLICATION_STATUS_LABELS[status] || status;
  const color = APPLICATION_STATUS_COLORS[status] || NEUTRAL_COLORS.gray500;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function MyApplicationsScreen({ onBack, onSelectApplication }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const list = await getMyApplications();
        if (!cancelled) setApplications((list || []).map(mapAppFromApi));
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setApplications([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => filterApplications(applications, searchQuery), [applications, searchQuery]);

  if (loading) {
    return (
      <ScreenContainer contentContainerStyle={styles.content}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading your applications…</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        View your submitted PLN applications by reference number.
      </Text>
      <SearchBar
        placeholder="Search by reference or status"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {error ? (
        <View style={styles.empty}>
          <Ionicons name="warning-outline" size={48} color={NEUTRAL_COLORS.gray500} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={NEUTRAL_COLORS.gray400} />
            <Text style={styles.emptyText}>
              {applications.length === 0 ? 'No applications yet. Submit one from Services → PLN Application.' : 'No applications match your search.'}
            </Text>
          </View>
        ) : (
          filtered.map((app) => (
            <Pressable
              key={app.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onSelectApplication?.(app)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name="document-text-outline" size={24} color={PRIMARY} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.referenceNumber}>{app.referenceNumber}</Text>
                  <Text style={styles.type}>{app.type}</Text>
                  <StatusBadge status={app.status} />
                </View>
              </View>
              <Text style={styles.date}>Submitted {formatDate(app.submittedAt)}</Text>
            </Pressable>
          ))
        )}
      </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
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
  subtitle: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray600,
    marginBottom: spacing.lg,
  },
  list: {
    marginTop: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.bodySmall,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.gray200,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: PRIMARY + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  referenceNumber: {
    ...typography.body,
    fontWeight: '700',
    color: NEUTRAL_COLORS.gray900,
    letterSpacing: 0.5,
  },
  type: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray600,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 0,
    marginTop: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  date: {
    ...typography.caption,
    color: NEUTRAL_COLORS.gray500,
    marginTop: spacing.sm,
    marginLeft: 48,
  },
});
