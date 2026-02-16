/**
 * Fake data for Roads Authority services
 */

export const SERVICES = [
  {
    id: '1',
    name: 'Overload Permits',
    description: 'Apply for permits to carry loads exceeding the legal limit on designated routes. Required for heavy haulage and abnormal loads.',
    iconName: 'car-outline',
    category: 'Permits & Licences',
  },
  {
    id: '2',
    name: 'Road Damage Reporting',
    description: 'Report potholes, surface damage, or hazards. Submit a photo and location for the maintenance team to prioritise repairs.',
    iconName: 'warning-outline',
    category: 'Reporting',
  },
  {
    id: '3',
    name: 'Road Status & Closures',
    description: 'View active roadworks, closures, and traffic advisories by region. Check expected completion dates and alternative routes.',
    iconName: 'trail-sign-outline',
    category: 'Information',
  },
  {
    id: '4',
    name: 'Weighbridge Services',
    description: 'Find weighbridge locations and operating hours. Check axle load limits and get weighbridge certificates for compliance.',
    iconName: 'scale-outline',
    category: 'Compliance',
  },
  {
    id: '5',
    name: 'Special Vehicle Permits',
    description: 'Apply for permits for oversize or special vehicles. Includes route approval and escort requirements where applicable.',
    iconName: 'bus-outline',
    category: 'Permits & Licences',
  },
  {
    id: '6',
    name: 'Contractor Registration',
    description: 'Register as a road works contractor. Access tender documents and submit bids for road construction and maintenance projects.',
    iconName: 'briefcase-outline',
    category: 'Business',
  },
  {
    id: '7',
    name: 'Access Road Applications',
    description: 'Apply for access to or across road reserves. For driveways, farm access, and development connections.',
    iconName: 'git-merge-outline',
    category: 'Permits & Licences',
  },
  {
    id: '8',
    name: 'Road Maintenance Enquiries',
    description: 'Enquire about scheduled maintenance, resurfacing, or drainage work on a specific road or section.',
    iconName: 'construct-outline',
    category: 'Information',
  },
  {
    id: '9',
    name: 'Traffic Management Plans',
    description: 'Submit and track traffic management plans for works on or near roads. Required for lane closures and diversions.',
    iconName: 'navigate-outline',
    category: 'Compliance',
  },
];

/** Unique categories for filtering or grouping */
export const SERVICE_CATEGORIES = [
  'Permits & Licences',
  'Reporting',
  'Information',
  'Compliance',
  'Business',
];
