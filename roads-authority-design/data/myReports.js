/**
 * Fake road damage reports for My Reports screen.
 * Images: Picsum placeholders (replace with real report photo URLs in production).
 */

const IMG = (id) => `https://picsum.photos/400/260?random=${id}`;

export const MY_REPORTS = [
  {
    id: '1',
    submittedAt: '2025-02-15T09:30:00',
    location: 'B1, 12 km north of Okahandja',
    description: 'Large pothole in left lane',
    status: 'under_review',
    image: IMG(101),
  },
  {
    id: '2',
    submittedAt: '2025-02-14T14:20:00',
    location: 'C28 near Khomas Hochland turnoff',
    description: 'Washed-out shoulder after rain',
    status: 'submitted',
    image: IMG(102),
  },
  {
    id: '3',
    submittedAt: '2025-02-12T08:00:00',
    location: 'Independence Ave, Windhoek (near Parliament)',
    description: 'Cracked pavement, trip hazard',
    status: 'resolved',
    image: IMG(103),
  },
  {
    id: '4',
    submittedAt: '2025-02-10T16:45:00',
    location: 'B2, between Swakopmund and Walvis Bay',
    description: 'Multiple potholes in both lanes',
    status: 'under_review',
    image: IMG(104),
  },
  {
    id: '5',
    submittedAt: '2025-02-08T11:15:00',
    location: 'MR44, Keetmanshoop–Lüderitz road',
    description: 'Gravel section erosion',
    status: 'submitted',
    image: IMG(105),
  },
];

export const REPORT_STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under review',
  resolved: 'Resolved',
};

export const REPORT_STATUS_COLORS = {
  submitted: '#2563EB',
  under_review: '#CA8A04',
  resolved: '#16A34A',
};
