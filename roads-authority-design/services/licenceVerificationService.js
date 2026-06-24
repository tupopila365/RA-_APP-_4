const TOKEN_TTL_MS = 60 * 1000;

function randomToken() {
  const segment = () => Math.random().toString(36).slice(2, 10);
  return `${segment()}${segment()}${segment()}`.slice(0, 24);
}

export function buildVerificationPayload(licence) {
  const generatedAt = Date.now();
  const expiresAt = generatedAt + TOKEN_TTL_MS;
  const licenceNumber = licence.licenceNumber.replace(/\s+/g, '');

  return {
    v: 1,
    type: 'ra-licence-verify',
    token: randomToken(),
    licence: licenceNumber,
    name: `${licence.firstName} ${licence.lastName}`,
    code: licence.code,
    exp: expiresAt,
    iat: generatedAt,
  };
}

export function serializeVerificationPayload(payload) {
  return JSON.stringify(payload);
}

export function formatVerificationTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getRemainingSeconds(expiresAt, now = Date.now()) {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

export const VERIFICATION_TOKEN_TTL_MS = TOKEN_TTL_MS;
