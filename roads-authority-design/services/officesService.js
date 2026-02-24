import ENV from '../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

/**
 * Format backend operatingHours to a single string for display.
 * Includes weekdays, weekends, and public holidays when present.
 */
function formatHours(operatingHours) {
  if (!operatingHours || typeof operatingHours !== 'object') return '';
  const parts = [];
  const w = operatingHours.weekdays;
  if (w && w.open && w.close) parts.push(`Mon–Fri ${w.open}–${w.close}`);
  const we = operatingHours.weekends;
  if (we && we.open && we.close) parts.push(`Sat–Sun ${we.open}–${we.close}`);
  const ph = operatingHours.publicHolidays;
  if (ph && ph.open && ph.close) parts.push(`Public holidays ${ph.open}–${ph.close}`);
  return parts.join('\n');
}

/**
 * Format closedDays array to a single line, e.g. "Closed: Sunday, Christmas Day"
 */
function formatClosedDays(closedDays) {
  if (!Array.isArray(closedDays) || closedDays.length === 0) return '';
  const list = closedDays.filter((d) => d && String(d).trim()).map((d) => String(d).trim());
  if (list.length === 0) return '';
  return `Closed: ${list.join(', ')}`;
}

/**
 * Format specialHours array to display lines.
 * Each entry: "25 Dec — Christmas: 09:00–12:00" or "1 Jan — New Year: Closed"
 */
function formatSpecialHours(specialHours) {
  if (!Array.isArray(specialHours) || specialHours.length === 0) return '';
  const lines = specialHours
    .filter((s) => s && (s.date || s.reason))
    .map((s) => {
      const date = s.date ? formatSpecialDate(s.date) : '';
      const reason = (s.reason && s.reason.trim()) ? s.reason.trim() : '';
      const label = [date, reason].filter(Boolean).join(' — ');
      if (s.closed) return `${label}: Closed`;
      const h = s.hours;
      if (h && h.open && h.close) return `${label}: ${h.open}–${h.close}`;
      return label || '';
    })
    .filter(Boolean);
  return lines.join('\n');
}

function formatSpecialDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Map backend location to frontend office shape (id, name, region, address, phone, email, hours, closedDays, specialHours, services).
 */
function mapLocation(loc) {
  if (!loc) return null;
  const id = String(loc.id ?? loc._id ?? '');
  const hours = formatHours(loc.operatingHours) || loc.operatingHoursString || '';
  const services = Array.isArray(loc.services) ? loc.services : [];
  const closedDaysText = formatClosedDays(loc.closedDays);
  const specialHoursText = formatSpecialHours(loc.specialHours);
  return {
    id,
    name: loc.name ?? '',
    region: loc.region ?? '',
    address: loc.address ?? '',
    phone: loc.contactNumber ?? loc.phone ?? null,
    email: (loc.email && loc.email.trim()) ? loc.email.trim() : null,
    hours: hours || null,
    closedDays: closedDaysText || null,
    specialHours: specialHoursText || null,
    services,
  };
}

/**
 * Fetch offices (locations) from the backend.
 * @param {Object} params - { region } optional region filter
 * @returns {Promise<Array<{ id, name, region, address, phone, hours, services }>>}
 */
export async function getOffices(params = {}) {
  const url = new URL(`${API_BASE_URL}/locations`);
  if (params.region && params.region.trim()) {
    url.searchParams.set('region', params.region.trim());
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load offices');
  }
  const data = await response.json();
  const raw = data.data?.locations ?? data.locations ?? [];
  return Array.isArray(raw) ? raw.map(mapLocation).filter(Boolean) : [];
}

/**
 * Fetch a single office by ID.
 * @param {string} id - Office/location ID
 * @returns {Promise<Object>} Mapped office
 */
export async function getOfficeById(id) {
  if (!id) throw new Error('Office ID is required');
  const response = await fetch(`${API_BASE_URL}/locations/${encodeURIComponent(id)}`);
  if (response.status === 404) throw new Error('Office not found');
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load office');
  }
  const data = await response.json();
  const raw = data.data?.location ?? data.location;
  return mapLocation(raw);
}
