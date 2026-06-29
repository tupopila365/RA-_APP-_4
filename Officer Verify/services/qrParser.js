/**
 * Parse QR payloads from myRA citizen app (ra-licence-verify).
 */

export function parseQrPayload(raw) {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'INVALID_FORMAT', message: 'Empty scan result.' };
  }

  const trimmed = raw.trim();

  try {
    const data = JSON.parse(trimmed);
    if (data?.type !== 'ra-licence-verify') {
      return { ok: false, error: 'INVALID_FORMAT', message: 'Not an RA licence verification code.' };
    }
    return { ok: true, payload: data };
  } catch (_) {
    try {
      const url = new URL(trimmed);
      const token = url.searchParams.get('t');
      if (token) {
        return {
          ok: true,
          payload: { v: 1, type: 'ra-licence-verify', token, exp: null },
        };
      }
    } catch (_) {
      // not a URL
    }
    return { ok: false, error: 'INVALID_FORMAT', message: 'Unrecognised QR code format.' };
  }
}

export function normalizeLicenceNumber(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase();
}
