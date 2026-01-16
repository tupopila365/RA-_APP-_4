// Mock road status data for development and testing
// This data represents various roadworks and road conditions in Namibia

const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const getDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockRoadStatusData = [
  // Critical Alerts - Closed/Restricted Roads
  {
    _id: generateId(),
    title: 'Emergency Bridge Repairs',
    road: 'B1 Highway',
    section: 'Between Windhoek and Okahandja',
    status: 'Closed',
    area: 'Khomas Region',
    region: 'Khomas',
    description: 'Emergency structural repairs on bridge over Swakop River',
    startDate: getPastDate(2),
    expectedCompletion: getDate(5),
    expectedDelayMinutes: 60,
    trafficControl: 'Full road closure with detour',
    alternativeRoute: 'Use B2 via Karibib, then rejoin B1 at Otjiwarongo',
    coordinates: {
      latitude: -22.0,
      longitude: 17.0,
    },
    published: true,
    priority: 'critical',
    createdAt: getPastDate(2),
    updatedAt: getPastDate(0),
  },
  {
    _id: generateId(),
    title: 'Major Pothole Repairs',
    road: 'C28',
    section: 'Between Rehoboth and Mariental',
    status: 'Restricted',
    area: 'Hardap Region',
    region: 'Hardap',
    description: 'Extensive pothole damage requiring full lane closure',
    startDate: getPastDate(1),
    expectedCompletion: getDate(7),
    expectedDelayMinutes: 45,
    trafficControl: 'Single lane traffic with stop/go system',
    alternativeRoute: 'Use D1268 via Kalkrand as alternative route',
    coordinates: {
      latitude: -23.3,
      longitude: 17.1,
    },
    createdAt: getPastDate(1),
    updatedAt: getPastDate(0),
  },
  {
    _id: generateId(),
    title: 'Road Resurfacing Project',
    road: 'B2',
    section: 'Swakopmund to Walvis Bay',
    status: 'Closed',
    area: 'Erongo Region',
    reason: 'Complete road resurfacing and lane marking',
    startDate: getPastDate(3),
    expectedCompletion: getDate(10),
    expectedDelayMinutes: 90,
    trafficControl: 'Full closure during working hours (6 AM - 6 PM)',
    alternativeRoute: 'Use coastal route via R310 during closure hours',
    coordinates: {
      latitude: -22.7,
      longitude: 14.5,
    },
    createdAt: getPastDate(3),
    updatedAt: getPastDate(0),
  },

  // Ongoing Maintenance
  {
    _id: generateId(),
    title: 'Routine Road Maintenance',
    road: 'B1 Highway',
    section: 'Windhoek to Rehoboth',
    status: 'Ongoing',
    area: 'Khomas Region',
    reason: 'Regular maintenance and pothole patching',
    startDate: getPastDate(5),
    expectedCompletion: getDate(3),
    expectedDelayMinutes: 15,
    trafficControl: 'Lane restrictions with temporary traffic lights',
    coordinates: {
      latitude: -22.5,
      longitude: 17.0,
    },
    createdAt: getPastDate(5),
    updatedAt: getPastDate(1),
  },
  {
    _id: generateId(),
    title: 'Drainage System Upgrade',
    road: 'C26',
    section: 'Gobabis to Buitepos Border',
    status: 'Ongoing Maintenance',
    area: 'Omaheke Region',
    reason: 'Upgrading drainage systems to prevent flooding',
    startDate: getPastDate(10),
    expectedCompletion: getDate(14),
    expectedDelayMinutes: 20,
    trafficControl: 'Single lane operation with flagmen',
    coordinates: {
      latitude: -22.4,
      longitude: 19.7,
    },
    createdAt: getPastDate(10),
    updatedAt: getPastDate(0),
  },
  {
    _id: generateId(),
    title: 'Shoulder Widening Project',
    road: 'B8',
    section: 'Rundu to Katima Mulilo',
    status: 'Ongoing',
    area: 'Zambezi Region',
    reason: 'Widening road shoulders for improved safety',
    startDate: getPastDate(7),
    expectedCompletion: getDate(21),
    expectedDelayMinutes: 10,
    trafficControl: 'Reduced speed limit to 60 km/h',
    coordinates: {
      latitude: -17.9,
      longitude: 19.8,
    },
    createdAt: getPastDate(7),
    updatedAt: getPastDate(0),
  },
  {
    _id: generateId(),
    title: 'Guardrail Installation',
    road: 'C39',
    section: 'Otjiwarongo to Outjo',
    status: 'Ongoing',
    area: 'Otjozondjupa Region',
    reason: 'Installing safety guardrails on dangerous curves',
    startDate: getPastDate(3),
    expectedCompletion: getDate(8),
    expectedDelayMinutes: 5,
    trafficControl: 'Temporary lane closures',
    coordinates: {
      latitude: -20.5,
      longitude: 16.6,
    },
    createdAt: getPastDate(3),
    updatedAt: getPastDate(0),
  },

  // Planned Works
  {
    _id: generateId(),
    title: 'Road Widening Project',
    road: 'B1 Highway',
    section: 'Okahandja to Otjiwarongo',
    status: 'Planned',
    area: 'Otjozondjupa Region',
    reason: 'Expanding from 2 to 4 lanes to accommodate increased traffic',
    startDate: getDate(14),
    expectedCompletion: getDate(90),
    trafficControl: 'To be determined',
    coordinates: {
      latitude: -21.0,
      longitude: 16.9,
    },
    createdAt: getPastDate(30),
    updatedAt: getPastDate(5),
  },
  {
    _id: generateId(),
    title: 'Bridge Rehabilitation',
    road: 'C14',
    section: 'Keetmanshoop to Lüderitz',
    status: 'Planned Works',
    area: 'Karas Region',
    reason: 'Complete bridge rehabilitation and strengthening',
    startDate: getDate(21),
    expectedCompletion: getDate(60),
    trafficControl: 'Single lane traffic during construction',
    coordinates: {
      latitude: -26.5,
      longitude: 15.2,
    },
    createdAt: getPastDate(20),
    updatedAt: getPastDate(3),
  },
  {
    _id: generateId(),
    title: 'Intersection Improvement',
    road: 'B2',
    section: 'Oshakati Main Intersection',
    status: 'Planned',
    area: 'Omusati Region',
    reason: 'Installing traffic lights and improving intersection safety',
    startDate: getDate(7),
    expectedCompletion: getDate(28),
    trafficControl: 'Roundabout construction with detours',
    coordinates: {
      latitude: -17.8,
      longitude: 15.7,
    },
    createdAt: getPastDate(15),
    updatedAt: getPastDate(2),
  },
  {
    _id: generateId(),
    title: 'Road Marking Refresh',
    road: 'C28',
    section: 'Mariental to Keetmanshoop',
    status: 'Planned',
    area: 'Hardap Region',
    reason: 'Refreshing road markings and installing new signage',
    startDate: getDate(10),
    expectedCompletion: getDate(25),
    trafficControl: 'Lane closures during painting',
    coordinates: {
      latitude: -24.6,
      longitude: 17.9,
    },
    createdAt: getPastDate(12),
    updatedAt: getPastDate(1),
  },

  // Open Roads (Normal Operations)
  {
    _id: generateId(),
    title: 'Road Inspection Complete',
    road: 'B1 Highway',
    section: 'Windhoek City Center',
    status: 'Open',
    area: 'Khomas Region',
    reason: 'Routine inspection completed, road in good condition',
    startDate: getPastDate(30),
    expectedCompletion: null,
    trafficControl: 'Normal traffic flow',
    coordinates: {
      latitude: -22.6,
      longitude: 17.1,
    },
    createdAt: getPastDate(30),
    updatedAt: getPastDate(1),
  },
  {
    _id: generateId(),
    title: 'Maintenance Completed',
    road: 'C19',
    section: 'Grootfontein to Tsumeb',
    status: 'Open',
    area: 'Otjozondjupa Region',
    reason: 'Scheduled maintenance completed ahead of schedule',
    startDate: getPastDate(45),
    expectedCompletion: getPastDate(30),
    trafficControl: 'Normal operations',
    coordinates: {
      latitude: -19.6,
      longitude: 18.1,
    },
    createdAt: getPastDate(45),
    updatedAt: getPastDate(30),
  },
  {
    _id: generateId(),
    title: 'Road Clear',
    road: 'B3',
    section: 'Gobabis to Buitepos',
    status: 'Open',
    area: 'Omaheke Region',
    reason: 'No current maintenance or restrictions',
    trafficControl: 'Normal traffic flow',
    coordinates: {
      latitude: -22.4,
      longitude: 19.7,
    },
    createdAt: getPastDate(60),
    updatedAt: getPastDate(7),
  },
  {
    _id: generateId(),
    title: 'Routine Check Complete',
    road: 'C35',
    section: 'Opuwo to Epupa Falls',
    status: 'Open',
    area: 'Kunene Region',
    reason: 'Road condition assessment completed, all clear',
    trafficControl: 'Normal operations',
    coordinates: {
      latitude: -18.1,
      longitude: 13.8,
    },
    createdAt: getPastDate(20),
    updatedAt: getPastDate(5),
  },

  // Completed Works
  {
    _id: generateId(),
    title: 'Pothole Repairs Completed',
    road: 'B1 Highway',
    section: 'Rehoboth to Mariental',
    status: 'Completed',
    area: 'Hardap Region',
    reason: 'Emergency pothole repairs completed successfully',
    startDate: getPastDate(20),
    expectedCompletion: getPastDate(15),
    trafficControl: 'Normal traffic flow restored',
    coordinates: {
      latitude: -23.8,
      longitude: 17.8,
    },
    createdAt: getPastDate(20),
    updatedAt: getPastDate(15),
  },
  {
    _id: generateId(),
    title: 'Road Resurfacing Finished',
    road: 'C26',
    section: 'Gobabis to Witvlei',
    status: 'Completed',
    area: 'Omaheke Region',
    reason: 'Road resurfacing project completed on schedule',
    startDate: getPastDate(40),
    expectedCompletion: getPastDate(25),
    trafficControl: 'All lanes open',
    coordinates: {
      latitude: -22.4,
      longitude: 18.4,
    },
    createdAt: getPastDate(40),
    updatedAt: getPastDate(25),
  },
];

// Helper function to filter mock data based on query
export const filterMockData = (data, query) => {
  if (!query || query.trim() === '') {
    return data;
  }

  const searchTerm = query.toLowerCase().trim();
  return data.filter((roadwork) => {
    return (
      roadwork.title?.toLowerCase().includes(searchTerm) ||
      roadwork.road?.toLowerCase().includes(searchTerm) ||
      roadwork.section?.toLowerCase().includes(searchTerm) ||
      roadwork.area?.toLowerCase().includes(searchTerm) ||
      roadwork.reason?.toLowerCase().includes(searchTerm)
    );
  });
};

// Helper function to filter by status
export const filterByStatus = (data, status) => {
  if (!status) {
    return data;
  }
  return data.filter((roadwork) => {
    const normalizedStatus = roadwork.status?.replace(/\s+/g, ' ');
    return normalizedStatus === status || roadwork.status === status;
  });
};

