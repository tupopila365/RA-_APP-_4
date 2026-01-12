/**
 * Official Namibian Road Names and Locations
 * Structured for reliable geocoding and search
 */

export interface RoadEntry {
  code: string;          // e.g., "B1", "C28"
  displayName: string;   // Full official name
  type: 'National' | 'Main' | 'District' | 'Urban';
  searchTerms: string[]; // Alternative search terms
}

/**
 * National Roads (B-roads)
 * Primary highways connecting major cities
 */
export const NATIONAL_ROADS: RoadEntry[] = [
  { code: 'B1', displayName: 'B1 National Road', type: 'National', searchTerms: ['B1', 'Trans-Caprivi', 'North-South Corridor'] },
  { code: 'B2', displayName: 'B2 National Road', type: 'National', searchTerms: ['B2', 'Trans-Kalahari Corridor', 'Walvis Bay Road'] },
  { code: 'B3', displayName: 'B3 National Road', type: 'National', searchTerms: ['B3', 'Lüderitz Road'] },
  { code: 'B4', displayName: 'B4 National Road', type: 'National', searchTerms: ['B4', 'Gobabis Road'] },
  { code: 'B6', displayName: 'B6 National Road', type: 'National', searchTerms: ['B6'] },
  { code: 'B8', displayName: 'B8 National Road', type: 'National', searchTerms: ['B8', 'Trans-Oranje Corridor'] },
];

/**
 * Main Roads (C-roads)
 * Regional connectors
 */
export const MAIN_ROADS: RoadEntry[] = [
  { code: 'C23', displayName: 'C23 Main Road', type: 'Main', searchTerms: ['C23'] },
  { code: 'C24', displayName: 'C24 Main Road', type: 'Main', searchTerms: ['C24'] },
  { code: 'C25', displayName: 'C25 Main Road', type: 'Main', searchTerms: ['C25'] },
  { code: 'C26', displayName: 'C26 Main Road', type: 'Main', searchTerms: ['C26'] },
  { code: 'C27', displayName: 'C27 Main Road', type: 'Main', searchTerms: ['C27'] },
  { code: 'C28', displayName: 'C28 Main Road', type: 'Main', searchTerms: ['C28', 'Kalkrand Road'] },
  { code: 'C33', displayName: 'C33 Main Road', type: 'Main', searchTerms: ['C33'] },
  { code: 'C34', displayName: 'C34 Main Road', type: 'Main', searchTerms: ['C34'] },
  { code: 'C35', displayName: 'C35 Main Road', type: 'Main', searchTerms: ['C35'] },
  { code: 'C36', displayName: 'C36 Main Road', type: 'Main', searchTerms: ['C36'] },
  { code: 'C37', displayName: 'C37 Main Road', type: 'Main', searchTerms: ['C37'] },
  { code: 'C38', displayName: 'C38 Main Road', type: 'Main', searchTerms: ['C38'] },
  { code: 'C39', displayName: 'C39 Main Road', type: 'Main', searchTerms: ['C39'] },
  { code: 'C40', displayName: 'C40 Main Road', type: 'Main', searchTerms: ['C40'] },
  { code: 'C41', displayName: 'C41 Main Road', type: 'Main', searchTerms: ['C41'] },
  { code: 'C42', displayName: 'C42 Main Road', type: 'Main', searchTerms: ['C42'] },
  { code: 'C43', displayName: 'C43 Main Road', type: 'Main', searchTerms: ['C43'] },
  { code: 'C44', displayName: 'C44 Main Road', type: 'Main', searchTerms: ['C44'] },
  { code: 'C45', displayName: 'C45 Main Road', type: 'Main', searchTerms: ['C45'] },
  { code: 'C46', displayName: 'C46 Main Road', type: 'Main', searchTerms: ['C46'] },
];

/**
 * District Roads (D-roads) - Common ones
 */
export const DISTRICT_ROADS: RoadEntry[] = [
  { code: 'D1237', displayName: 'D1237 District Road', type: 'District', searchTerms: ['D1237'] },
  { code: 'D1501', displayName: 'D1501 District Road', type: 'District', searchTerms: ['D1501'] },
  { code: 'D1508', displayName: 'D1508 District Road', type: 'District', searchTerms: ['D1508'] },
  { code: 'D1803', displayName: 'D1803 District Road', type: 'District', searchTerms: ['D1803'] },
  { code: 'D2102', displayName: 'D2102 District Road', type: 'District', searchTerms: ['D2102'] },
];

/**
 * Major Urban Roads
 */
export const URBAN_ROADS: RoadEntry[] = [
  { code: 'IND-AVE', displayName: 'Independence Avenue', type: 'Urban', searchTerms: ['Independence Avenue', 'Kaiserstrasse', 'Windhoek CBD'] },
  { code: 'SAM-NUJ', displayName: 'Sam Nujoma Drive', type: 'Urban', searchTerms: ['Sam Nujoma', 'Windhoek'] },
  { code: 'ROB-MUG', displayName: 'Robert Mugabe Avenue', type: 'Urban', searchTerms: ['Robert Mugabe', 'Windhoek'] },
  { code: 'HOS-KUT', displayName: 'Hosea Kutako Drive', type: 'Urban', searchTerms: ['Hosea Kutako', 'Windhoek'] },
  { code: 'PET-MUL', displayName: 'Peter Müller Street', type: 'Urban', searchTerms: ['Peter Müller', 'Windhoek'] },
  { code: 'BAH-STR', displayName: 'Bahnhof Street', type: 'Urban', searchTerms: ['Bahnhof', 'Windhoek'] },
  { code: 'SAM-NUJ-SWK', displayName: 'Sam Nujoma Avenue', type: 'Urban', searchTerms: ['Sam Nujoma', 'Swakopmund'] },
  { code: 'THE-STR', displayName: 'Theo-Ben Gurirab Avenue', type: 'Urban', searchTerms: ['Theo-Ben Gurirab', 'Walvis Bay'] },
];

/**
 * All roads combined for autocomplete
 */
export const ALL_ROADS: RoadEntry[] = [
  ...NATIONAL_ROADS,
  ...MAIN_ROADS,
  ...DISTRICT_ROADS,
  ...URBAN_ROADS,
];

/**
 * Major towns and cities in Namibia
 * Organized by region for better UX
 */
export const TOWNS_BY_REGION: Record<string, string[]> = {
  'Erongo': ['Swakopmund', 'Walvis Bay', 'Henties Bay', 'Arandis', 'Karibib', 'Omaruru', 'Usakos'],
  'Hardap': ['Mariental', 'Rehoboth', 'Aranos', 'Maltahöhe', 'Gochas', 'Kalkrand'],
  'ǁKaras': ['Keetmanshoop', 'Lüderitz', 'Karasburg', 'Aus', 'Bethanie', 'Tses', 'Aroab'],
  'Kavango East': ['Rundu', 'Divundu', 'Nkurenkuru'],
  'Kavango West': ['Nkurenkuru', 'Ncuncuni', 'Mpungu'],
  'Khomas': ['Windhoek', 'Okahandja', 'Hosea Kutako International Airport'],
  'Kunene': ['Opuwo', 'Khorixas', 'Outjo', 'Kamanjab', 'Sesfontein'],
  'Ohangwena': ['Eenhana', 'Helao Nafidi', 'Okongo', 'Endola'],
  'Omaheke': ['Gobabis', 'Witvlei', 'Otjinene', 'Leonardville'],
  'Omusati': ['Outapi', 'Okahao', 'Oshikuku', 'Onesi', 'Ruacana'],
  'Oshana': ['Oshakati', 'Ondangwa', 'Ongwediva', 'Oshakati'],
  'Oshikoto': ['Tsumeb', 'Omuthiya', 'Onayena', 'Oniipa'],
  'Otjozondjupa': ['Otjiwarongo', 'Grootfontein', 'Otavi', 'Okakarara'],
  'Zambezi': ['Katima Mulilo', 'Ngoma', 'Kongola', 'Bukalo'],
};

/**
 * All unique towns (flattened)
 */
export const ALL_TOWNS: string[] = Array.from(
  new Set(Object.values(TOWNS_BY_REGION).flat())
).sort();

/**
 * Get road entry by code or display name
 */
export function getRoadByCodeOrName(codeOrName: string): RoadEntry | undefined {
  const search = codeOrName.toLowerCase().trim();
  return ALL_ROADS.find(
    road =>
      road.code.toLowerCase() === search ||
      road.displayName.toLowerCase() === search ||
      road.searchTerms.some(term => term.toLowerCase().includes(search))
  );
}

/**
 * Build searchable text for geocoding
 */
export function buildSearchText(
  roadName: string,
  section: string | undefined,
  area: string,
  region: string
): string {
  const parts = [roadName, section, area, region, 'Namibia'].filter(Boolean);
  return parts.join(' ');
}



