import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

/**
 * Fetch published road status from the backend (simple model: name, region, status, lat, lng, notes).
 * @param {string} [query] - Optional search term (name, region, notes)
 * @returns {Promise<Array<{ id: string, name: string, region: string, status: string, lat: number, lng: number, notes?: string }>>}
 */
export async function getRoadStatus(query = '') {
  const url = new URL(`${API_BASE_URL}/road-status/public`);
  if (query && query.trim()) url.searchParams.set('q', query.trim());
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load road status');
  }
  const data = await response.json();
  const items = data.data ?? data;
  if (!Array.isArray(items)) return [];
  return items.map((r) => ({
    id: String(r.id ?? r._id ?? ''),
    name: r.name ?? '',
    region: r.region ?? '',
    status: (r.status ?? 'open').toLowerCase(),
    lat: typeof r.lat === 'number' ? r.lat : parseFloat(r.lat) || 0,
    lng: typeof r.lng === 'number' ? r.lng : parseFloat(r.lng) || 0,
    notes: r.notes ?? null,
  }));
}
