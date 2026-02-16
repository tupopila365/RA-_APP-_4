/**
 * Fake applications list for My Applications screen.
 * Reference numbers and status for display on cards.
 * PLN apps include statusHistory for the tracking screen.
 */

const PLN_STAGES = ['submitted', 'under_review', 'approved'];
const PLN_STAGE_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function plnStatusHistory(submittedAt, status) {
  const isRejected = status === 'rejected';
  const stages = isRejected ? ['submitted', 'under_review', 'rejected'] : PLN_STAGES;
  const d = (days) => {
    const t = new Date(submittedAt);
    t.setDate(t.getDate() + days);
    return t.toISOString();
  };
  return stages.map((s, i) => ({
    status: s,
    timestamp: i === 0 ? submittedAt : d(i),
    comment: s === 'submitted' ? 'Application received' : s === 'under_review' ? 'Documents being verified' : s === 'approved' ? 'Approved – collect at office' : 'Application declined',
  }));
}

export const MY_APPLICATIONS = [
  { id: '1', referenceNumber: 'PLN-2025-08472', type: 'PLN Application', submittedAt: '2025-02-14T10:30:00', status: 'under_review', statusHistory: null, nextSteps: 'Your documents are being verified. We will notify you once the review is complete.' },
  { id: '2', referenceNumber: 'PLN-2025-08103', type: 'PLN Application', submittedAt: '2025-02-01T14:15:00', status: 'approved', statusHistory: null, nextSteps: 'Your plates are ready. Bring your ID to the nearest RA office to collect.' },
  { id: '3', referenceNumber: 'PLN-2024-99234', type: 'PLN Application', submittedAt: '2024-12-18T09:00:00', status: 'approved', statusHistory: null, nextSteps: 'Collected.' },
  { id: '4', referenceNumber: 'PLN-2025-08601', type: 'PLN Application', submittedAt: '2025-02-16T08:45:00', status: 'submitted', statusHistory: null, nextSteps: 'We have received your application. Review usually takes 5–7 working days.' },
];
// Inject statusHistory for PLN (computed so we don't duplicate dates)
MY_APPLICATIONS.forEach((a) => {
  if (a.type && a.type.toLowerCase().includes('pln') && !a.statusHistory) {
    a.statusHistory = plnStatusHistory(a.submittedAt, a.status);
  }
});

export const PLN_TRACKING_STAGES = PLN_STAGES;
export const PLN_TRACKING_STAGE_LABELS = PLN_STAGE_LABELS;

export const APPLICATION_STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const APPLICATION_STATUS_COLORS = {
  submitted: '#2563EB',
  under_review: '#CA8A04',
  approved: '#16A34A',
  rejected: '#DC2626',
};
