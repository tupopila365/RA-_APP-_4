import * as memoryStorage from './storage';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000;
const PIN_HASH_SALT = 'ra-licence-pin-v1';

async function getItem(key) {
  return memoryStorage.getItem(key);
}

async function setItem(key, value) {
  await memoryStorage.setItem(key, value);
}

async function removeItem(key) {
  await memoryStorage.removeItem(key);
}

function pinHashKey(userId) {
  return `licence_pin_hash_${userId}`;
}

function biometricsKey(userId) {
  return `licence_biometrics_${userId}`;
}

function failedAttemptsKey(userId) {
  return `licence_failed_attempts_${userId}`;
}

function lockoutUntilKey(userId) {
  return `licence_lockout_until_${userId}`;
}

function getUserScope(user) {
  const id = user?.id ?? user?.email;
  if (!id) throw new Error('User is required for licence lock.');
  return String(id);
}

function hashPin(userId, pin) {
  const value = `${PIN_HASH_SALT}:${userId}:${pin}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;

  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2, 33) + code) >>> 0;
  }

  return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

export async function hasLicencePin(user) {
  const userId = getUserScope(user);
  const stored = await getItem(pinHashKey(userId));
  return !!stored;
}

export async function setLicencePin(user, pin) {
  const userId = getUserScope(user);
  await setItem(pinHashKey(userId), hashPin(userId, pin));
  await clearFailedAttempts(user);
}

export async function verifyLicencePin(user, pin) {
  const userId = getUserScope(user);
  const lockout = await getLockoutRemainingMs(user);
  if (lockout > 0) {
    throw new Error(`Too many attempts. Try again in ${Math.ceil(lockout / 1000)} seconds.`);
  }

  const stored = await getItem(pinHashKey(userId));
  const valid = stored === hashPin(userId, pin);

  if (!valid) {
    await recordFailedAttempt(user);
    const remaining = await getRemainingAttempts(user);
    if (remaining <= 0) {
      throw new Error('Too many attempts. Try again in 60 seconds.');
    }
    throw new Error(`Incorrect PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
  }

  await clearFailedAttempts(user);
  return true;
}

export async function isBiometricsEnabled(user) {
  const userId = getUserScope(user);
  const value = await getItem(biometricsKey(userId));
  return value === 'true';
}

export async function setBiometricsEnabled(user, enabled) {
  const userId = getUserScope(user);
  await setItem(biometricsKey(userId), enabled ? 'true' : 'false');
}

export async function canUseBiometrics() {
  return false;
}

export async function getBiometricLabel() {
  return 'Biometrics';
}

export async function unlockWithBiometrics() {
  return false;
}

async function recordFailedAttempt(user) {
  const userId = getUserScope(user);
  const raw = await getItem(failedAttemptsKey(userId));
  const count = (raw ? parseInt(raw, 10) : 0) + 1;
  await setItem(failedAttemptsKey(userId), String(count));
  if (count >= MAX_FAILED_ATTEMPTS) {
    await setItem(lockoutUntilKey(userId), String(Date.now() + LOCKOUT_MS));
  }
}

async function clearFailedAttempts(user) {
  const userId = getUserScope(user);
  await removeItem(failedAttemptsKey(userId));
  await removeItem(lockoutUntilKey(userId));
}

export async function getLockoutRemainingMs(user) {
  const userId = getUserScope(user);
  const until = await getItem(lockoutUntilKey(userId));
  if (!until) return 0;
  const remaining = parseInt(until, 10) - Date.now();
  if (remaining <= 0) {
    await clearFailedAttempts(user);
    return 0;
  }
  return remaining;
}

async function getRemainingAttempts(user) {
  const userId = getUserScope(user);
  const raw = await getItem(failedAttemptsKey(userId));
  const count = raw ? parseInt(raw, 10) : 0;
  return Math.max(0, MAX_FAILED_ATTEMPTS - count);
}

export function isValidPin(pin) {
  return /^\d{4,6}$/.test(pin || '');
}
