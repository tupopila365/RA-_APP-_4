import ENV from '../config/env';
import {
  findLicenceByNumber,
  isTokenUsed,
  markTokenUsed,
} from '../data/mockLicences';
import { normalizeLicenceNumber, parseQrPayload } from './qrParser';

export { parseQrPayload, normalizeLicenceNumber };

function formatVerifiedAt() {
  return new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapLicence(licence) {
  return {
    licenceNumber: licence.displayNumber || licence.licenceNumber,
    displayNumber: licence.displayNumber || licence.licenceNumber,
    firstName: licence.firstName,
    lastName: licence.lastName,
    fullName: licence.fullName,
    photo: licence.photo,
    codes: licence.codes,
    codeDisplay: licence.codeDisplay,
    issueDate: licence.issueDate,
    expiryDate: licence.expiryDate,
    expiryDisplay: licence.expiryDisplay,
    status: licence.status,
    restrictions: licence.restrictions || [],
  };
}

function buildSuccess(licence, method, extra = {}) {
  const isBad = ['expired', 'revoked', 'suspended'].includes(licence.status);
  const result = isBad ? licence.status : 'valid';

  return {
    success: result === 'valid',
    result,
    method,
    scanId: `scan_${Date.now()}`,
    verifiedAt: formatVerifiedAt(),
    message:
      result === 'valid'
        ? 'Licence verified against registry.'
        : `Licence status: ${licence.status}.`,
    licence: mapLicence(licence),
    prototype: ENV.USE_MOCK_DATA,
    ...extra,
  };
}

function buildFailure(code, message, method = 'qr_scan', extra = {}) {
  return {
    success: false,
    result: code.toLowerCase(),
    method,
    scanId: `scan_${Date.now()}`,
    verifiedAt: formatVerifiedAt(),
    message,
    licence: extra.licence || null,
    errorCode: code,
    prototype: ENV.USE_MOCK_DATA,
    ...extra,
  };
}

/**
 * Prototype: verify scanned QR from myRA (JSON with token + licence fields).
 */
export async function verifyByQr(rawQrData) {
  const parsed = parseQrPayload(rawQrData);
  if (!parsed.ok) {
    return buildFailure(parsed.error, parsed.message);
  }

  const { payload } = parsed;
  const now = Date.now();

  if (payload.exp != null && now > payload.exp) {
    return buildFailure(
      'TOKEN_EXPIRED',
      'QR code has expired. Ask the driver to generate a new one.'
    );
  }

  if (payload.token && isTokenUsed(payload.token)) {
    return buildFailure(
      'TOKEN_USED',
      'This QR code was already scanned. Ask for a new one.'
    );
  }

  const licence = findLicenceByNumber(payload.licence);
  if (!licence) {
    return buildFailure('LICENCE_NOT_FOUND', 'Licence not found in registry.');
  }

  if (payload.token) {
    markTokenUsed(payload.token);
  }

  return buildSuccess(licence, 'qr_scan', { token: payload.token || null });
}

/**
 * Manual lookup — does not consume QR token.
 */
export async function verifyByLicenceNumber(rawNumber) {
  const key = normalizeLicenceNumber(rawNumber);
  if (!key) {
    return buildFailure('INVALID_INPUT', 'Enter a licence number.', 'manual_lookup');
  }

  const licence = findLicenceByNumber(key);
  if (!licence) {
    return buildFailure('LICENCE_NOT_FOUND', 'No licence found for that number.', 'manual_lookup');
  }

  if (licence.status === 'expired') {
    return buildFailure(
      'LICENCE_EXPIRED',
      `Licence expired on ${licence.expiryDisplay}.`,
      'manual_lookup',
      { licence: mapLicence(licence) }
    );
  }

  return buildSuccess(licence, 'manual_lookup');
}
