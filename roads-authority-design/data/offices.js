/**
 * Fake data — Roads Authority offices
 */

export const OFFICES = [
  {
    id: '1',
    name: 'Roads Authority Head Office',
    region: 'Khomas',
    address: 'Corner of Independence Ave & Luther Street, Windhoek',
    phone: '+264 61 284 2111',
    hours: 'Mon–Fri 08:00–16:30',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'Complaints', 'General enquiries', 'Document collection'],
  },
  {
    id: '2',
    name: 'Walvis Bay Regional Office',
    region: 'Erongo',
    address: 'Hage Geingob Street, Walvis Bay',
    phone: '+264 64 203 711',
    hours: 'Mon–Fri 08:00–16:00',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'General enquiries'],
  },
  {
    id: '3',
    name: 'Rundu Regional Office',
    region: 'Kavango East',
    address: 'Mandume ya Ndemufayo Ave, Rundu',
    phone: '+264 66 255 311',
    hours: 'Mon–Fri 08:00–16:00',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'General enquiries'],
  },
  {
    id: '4',
    name: 'Oshakati Regional Office',
    region: 'Oshana',
    address: 'Ondangwa Road, Oshakati',
    phone: '+264 65 220 411',
    hours: 'Mon–Fri 08:00–16:00',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'General enquiries'],
  },
  {
    id: '5',
    name: 'Keetmanshoop Regional Office',
    region: 'ǁKaras',
    address: '5th Avenue, Keetmanshoop',
    phone: '+264 63 223 211',
    hours: 'Mon–Fri 08:00–16:00',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'General enquiries'],
  },
  {
    id: '6',
    name: 'Otjiwarongo Regional Office',
    region: 'Otjozondjupa',
    address: 'Hage Geingob Drive, Otjiwarongo',
    phone: '+264 67 302 511',
    hours: 'Mon–Fri 08:00–16:00',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'General enquiries'],
  },
  {
    id: '7',
    name: 'Katima Mulilo Office',
    region: 'Zambezi',
    address: 'Ngoma Road, Katima Mulilo',
    phone: '+264 66 252 411',
    hours: 'Mon–Fri 08:00–16:00',
    services: ['Permit applications', 'Road status enquiries', 'Payments', 'General enquiries'],
  },
  {
    id: '8',
    name: 'Swakopmund Service Point',
    region: 'Erongo',
    address: 'Nathaniel Maxuilili Street, Swakopmund',
    phone: '+264 64 402 611',
    hours: 'Mon–Fri 08:00–13:00',
    services: ['Road status enquiries', 'General enquiries', 'Document collection'],
  },
];

export const OFFICE_REGIONS = [...new Set(OFFICES.map((o) => o.region))].sort();
