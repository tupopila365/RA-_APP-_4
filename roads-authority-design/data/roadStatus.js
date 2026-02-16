/**
 * Road status data for list and map views.
 * Coordinates are approximate (Namibia).
 */

export const ROAD_STATUS = [
  { id: '1', name: 'B1 Windhoek–Okahandja', region: 'Khomas / Otjozondjupa', status: 'open', lat: -22.5609, lng: 17.0658, notes: 'Clear' },
  { id: '2', name: 'B2 Windhoek–Swakopmund', region: 'Khomas / Erongo', status: 'maintenance', lat: -22.4833, lng: 17.0833, notes: 'Resurfacing 20–40 km' },
  { id: '3', name: 'B1 Windhoek–Rehoboth', region: 'Khomas / Hardap', status: 'open', lat: -23.3167, lng: 17.0833, notes: 'Clear' },
  { id: '4', name: 'C28 Windhoek–Walvis Bay', region: 'Erongo', status: 'open', lat: -22.9576, lng: 14.5053, notes: 'Clear' },
  { id: '5', name: 'B8 Rundu–Katima Mulilo', region: 'Kavango East / Zambezi', status: 'caution', lat: -17.9167, lng: 19.7667, notes: 'Seasonal flooding possible' },
  { id: '6', name: 'B1 Otjiwarongo–Otavi', region: 'Otjozondjupa', status: 'open', lat: -20.4667, lng: 16.6500, notes: 'Clear' },
  { id: '7', name: 'B6 Gobabis–Windhoek', region: 'Omaheke / Khomas', status: 'open', lat: -22.4500, lng: 18.9667, notes: 'Clear' },
  { id: '8', name: 'MR44 Keetmanshoop–Lüderitz', region: 'ǁKaras', status: 'maintenance', lat: -26.5833, lng: 15.1500, notes: 'Pothole repairs' },
  { id: '9', name: 'B1 North Tsumeb–Ondangwa', region: 'Oshikoto / Oshana', status: 'open', lat: -17.9167, lng: 15.9500, notes: 'Clear' },
  { id: '10', name: 'D2515 Oshakati–Ruacana', region: 'Oshana / Kunene', status: 'caution', lat: -17.4333, lng: 14.9833, notes: 'Gravel – drive to conditions' },
];

export const STATUS_LABELS = {
  open: 'Open',
  caution: 'Caution',
  maintenance: 'Under maintenance',
  closed: 'Closed',
};

export const STATUS_COLORS = {
  open: '#16A34A',
  caution: '#CA8A04',
  maintenance: '#EA580C',
  closed: '#DC2626',
};
