/**
 * Fake news data — Roads Authority (with images and body for detail page)
 * Images: Picsum placeholder (replace with real URLs in production)
 */

const IMG = (id) => `https://picsum.photos/400/220?random=${id}`;

export const NEWS = [
  {
    id: '1',
    title: 'B1 Resurfacing Project Completed Ahead of Schedule',
    date: '2025-02-14',
    category: 'Projects',
    image: IMG(1),
    summary: 'The B1 highway resurfacing between Okahandja and Otjiwarongo has been completed two weeks ahead of schedule.',
    body: 'The B1 highway resurfacing between Okahandja and Otjiwarongo has been completed two weeks ahead of schedule. Motorists can now use the full stretch without detours.\n\nThe project included new lane markings and improved drainage along the 140 km section. The Roads Authority thanks contractors and the public for their patience during the works. Regular maintenance will continue as part of the national road network programme.',
  },
  {
    id: '2',
    title: 'New Weighbridge Opens at Walvis Bay',
    date: '2025-02-12',
    category: 'Infrastructure',
    image: IMG(2),
    summary: 'A new weighbridge facility at Walvis Bay is now operational to support port-related heavy vehicle compliance.',
    body: 'A new weighbridge facility at Walvis Bay is now operational to support port-related heavy vehicle compliance. Operating hours are 06:00–22:00 daily.\n\nOverload permit applications can be processed on-site. Drivers are reminded to ensure loads are within legal limits before travelling. The facility includes rest area and ablutions for drivers.',
  },
  {
    id: '3',
    title: 'Road Safety Campaign: Slow Down in Work Zones',
    date: '2025-02-10',
    category: 'Safety',
    image: IMG(3),
    summary: 'The Roads Authority has launched a campaign urging drivers to reduce speed and obey signs in road work zones.',
    body: 'The Roads Authority has launched a campaign urging drivers to reduce speed and obey signs in road work zones. Fines for speeding in work zones have been increased with effect from 1 February 2025.\n\nSeveral incidents were reported last month involving vehicles ignoring temporary signs. The safety of road workers and motorists remains a priority. Please slow down and follow directional signs when approaching roadworks.',
  },
  {
    id: '4',
    title: 'Tender: Maintenance of MR44 (Windhoek–Gobabis)',
    date: '2025-02-08',
    category: 'Tenders',
    image: IMG(4),
    summary: 'The RA invites qualified contractors to submit tenders for routine maintenance of the MR44 from Windhoek to Gobabis.',
    body: 'The Roads Authority invites qualified contractors to submit tenders for routine maintenance of the MR44 from Windhoek to Gobabis. The contract covers grading, pothole repair, and drainage maintenance.\n\nClosing date for submissions: 28 February 2025. Tender documents are available on the RA portal. A compulsory site meeting will be held on 18 February. Enquiries: tenders@ra.org.na',
  },
  {
    id: '5',
    title: 'Weekend Closure: C28 Section for Bridge Repair',
    date: '2025-02-07',
    category: 'Closures',
    image: IMG(5),
    summary: 'A section of the C28 will be closed from Friday 21 Feb 18:00 to Monday 24 Feb 06:00 for urgent bridge repair.',
    body: 'A section of the C28 will be closed from Friday 21 February 18:00 to Monday 24 February 06:00 for urgent bridge repair. The affected section is between the D1262 junction and kilometre marker 45.\n\nA signed diversion will be in place via D1262. Motorists should allow extra journey time. Emergency services will have access at all times. We apologise for any inconvenience.',
  },
  {
    id: '6',
    title: 'Report Road Damage via the RA App',
    date: '2025-02-05',
    category: 'Announcements',
    image: IMG(6),
    summary: 'You can now report potholes and road damage directly through the Roads Authority app.',
    body: 'You can now report potholes and road damage directly through the Roads Authority app. Open the app, go to Report Road Damage, take a photo of the damage, and allow the app to use your location.\n\nReports are triaged by severity and location. Your report helps us prioritise repairs and plan maintenance. You can track the status of your report under My Reports.',
  },
  {
    id: '7',
    title: 'Overload Permit Fees Revised from 1 March',
    date: '2025-02-03',
    category: 'Permits',
    image: IMG(7),
    summary: 'Revised fees for overload and special vehicle permits take effect on 1 March 2025.',
    body: 'Revised fees for overload and special vehicle permits take effect on 1 March 2025. Applications submitted and paid before that date will be charged at current rates.\n\nThe new fee schedule is available in the Permits section of the app and on the RA website. For questions, contact the Permits office or your nearest RA office.',
  },
  {
    id: '8',
    title: 'RA and City of Windhoek Sign MoU on Urban Roads',
    date: '2025-01-30',
    category: 'Partnerships',
    image: IMG(8),
    summary: 'The Roads Authority and the City of Windhoek have signed a memorandum of understanding to coordinate planning and maintenance of urban arterial roads.',
    body: 'The Roads Authority and the City of Windhoek have signed a memorandum of understanding to coordinate planning and maintenance of urban arterial roads. The agreement aims to improve alignment on design standards, maintenance cycles, and shared corridors.\n\nJoint projects will be announced in the coming months. Both parties will work together on traffic management and road safety initiatives in the capital.',
  },
];
