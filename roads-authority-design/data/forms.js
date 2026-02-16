/**
 * Forms and documents from Roads Authority (ra.org.na/downloads).
 * pdfUrl opens the official RA downloads page or document link.
 */

const RA_DOWNLOADS = 'https://www.ra.org.na/downloads';

export const FORMS = [
  {
    id: '1',
    title: 'Abnormal Load Permit Application',
    description: 'Apply for a permit to move abnormal or heavy loads on Namibian roads.',
    category: 'Permits',
    pdfUrl: 'https://www.ra.org.na/downloads',
  },
  {
    id: '2',
    title: 'Key Requirements Document (KRD)',
    description: 'Procurement key requirements and tender documentation.',
    category: 'Procurement',
    pdfUrl: 'https://www.ra.org.na/downloads',
  },
  {
    id: '3',
    title: 'Road Summary Report',
    description: 'Summary reports on road network condition and status.',
    category: 'Reports',
    pdfUrl: 'https://www.ra.org.na/downloads',
  },
  {
    id: '4',
    title: 'Road Maintenance Manual',
    description: 'Guidelines and manuals for road maintenance procedures.',
    category: 'Manuals',
    pdfUrl: 'https://www.ra.org.na/downloads',
  },
  {
    id: '5',
    title: 'RA Approved Business Plan',
    description: 'Roads Authority approved business plans and operational documents.',
    category: 'Plans',
    pdfUrl: 'https://www.ra.org.na/downloads',
  },
  {
    id: '6',
    title: 'RA Strategic Plan',
    description: 'Strategic plan and long-term objectives of the Roads Authority.',
    category: 'Plans',
    pdfUrl: 'https://ra.org.na/annual-reports',
  },
  {
    id: '7',
    title: 'Annual Report',
    description: 'Annual reports including financial and performance information.',
    category: 'Reports',
    pdfUrl: 'https://ra.org.na/annual-reports',
  },
  {
    id: '8',
    title: 'Relevant Legislation',
    description: 'Roads Authority Act and related legislation (PDF).',
    category: 'Legislation',
    pdfUrl: 'https://www.ra.org.na/downloads',
  },
  {
    id: '9',
    title: 'Weighbridge & Axle Load',
    description: 'Information and forms for weighbridge and axle load compliance.',
    category: 'Permits',
    pdfUrl: 'https://www.ra.org.na/weighbridge',
  },
];

export const FORM_CATEGORIES = [...new Set(FORMS.map((f) => f.category))].sort();
