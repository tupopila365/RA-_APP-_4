import ENV from '../config/env';
import { getOrCreateDeviceId } from './deviceIdService';
import { authService } from './authService';

const API_BASE_URL = ENV.API_BASE_URL;

export async function testConnection() {
  try {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    const res = await fetch(`${base}/health`, { method: 'GET' });
    return res.ok;
  } catch (_) {
    return false;
  }
}

async function getHeaders() {
  const headers = { 'X-Device-ID': await getOrCreateDeviceId() };
  const token = await authService.getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Create a pothole report. Data appears in admin panel.
 * @param {Object} reportData - { location: { latitude, longitude }, roadName?, townName?, streetName?, severity?, description? }
 * @param {string} photoUri - Local file URI of the photo
 */
export async function createReport(reportData, photoUri) {
  if (!reportData?.location || reportData.location.latitude == null || reportData.location.longitude == null) {
    throw new Error('Location is required');
  }
  if (!photoUri) throw new Error('Photo is required');

  const formData = new FormData();
  const photoFile = {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  };
  formData.append('photo', photoFile);
  formData.append('location', JSON.stringify(reportData.location));
  formData.append('severity', reportData.severity || 'medium');
  if (reportData.roadName) formData.append('roadName', reportData.roadName);
  if (reportData.townName) formData.append('townName', reportData.townName);
  if (reportData.streetName) formData.append('streetName', reportData.streetName);
  if (reportData.description) formData.append('description', reportData.description);

  const headers = await getHeaders();
  delete headers['Content-Type'];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/pothole-reports`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.error?.message || errData.message || `HTTP ${response.status}`;
      const err = new Error(msg);
      err.status = response.status;
      throw err;
    }
    const data = await response.json();
    return data.data?.report || data;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('Request timed out. Try a smaller photo or check your connection.');
    }
    if (e.message?.includes('Network request failed') || e.message?.includes('Failed to fetch')) {
      const ok = await testConnection();
      throw new Error(ok ? 'Upload failed. Check photo size and try again.' : 'Cannot connect to server. Ensure backend is running.');
    }
    throw e;
  }
}

/**
 * Map backend report to app shape (list and detail).
 */
export function mapReportFromApi(r) {
  if (!r) return null;
  const loc = r.location;
  const hasCoords = loc && typeof loc === 'object' && loc.latitude != null && loc.longitude != null;
  const roadPart = r.roadName && String(r.roadName).trim();
  const placePart = [r.town, r.region].filter(Boolean).join(', ');
  const locationStr =
    (roadPart && placePart ? `${roadPart}, ${placePart}` : roadPart || placePart) ||
    (hasCoords ? `${Number(loc.latitude).toFixed(5)}, ${Number(loc.longitude).toFixed(5)}` : null) ||
    'Location recorded';
  return {
    id: String(r.id),
    submittedAt: r.createdAt,
    location: locationStr,
    description: r.description || null,
    status: r.status || 'pending',
    image: r.photoUrl || `https://picsum.photos/400/260?random=${r.id}`,
    referenceCode: r.referenceCode || null,
    town: r.town,
    region: r.region,
    roadName: r.roadName,
    severity: r.severity,
    assignedTo: r.assignedTo,
    adminNotes: r.adminNotes,
    repairPhotoUrl: r.repairPhotoUrl,
    fixedAt: r.fixedAt,
    updatedAt: r.updatedAt,
    locationCoords: hasCoords ? { latitude: loc.latitude, longitude: loc.longitude } : null,
  };
}

/**
 * Fetch current user's reports (uses device ID or auth token). For My Reports screen.
 */
export async function getMyReports() {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE_URL}/pothole-reports/my-reports`, { headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load reports');
  }
  const data = await res.json();
  const list = data.data?.reports ?? data.reports ?? [];
  return Array.isArray(list) ? list : [];
}

/**
 * Fetch a single report by ID. For report detail screen.
 */
export async function getReportById(reportId) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE_URL}/pothole-reports/${encodeURIComponent(reportId)}`, { headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || 'Failed to load report');
  }
  const data = await res.json();
  const raw = data.data?.report ?? data.report ?? data;
  return raw ? mapReportFromApi(raw) : null;
}
