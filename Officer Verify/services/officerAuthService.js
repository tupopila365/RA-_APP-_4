import { DEMO_OFFICERS } from '../data/mockLicences';

const SESSION_KEY = 'ra_verifier_session';
let memorySession = null;

function buildSession(officer) {
  return {
    accessToken: `mock-officer-${officer.officerId}`,
    officer: {
      id: officer.officerId,
      name: officer.name,
      unit: officer.unit,
      organisation: officer.organisation,
    },
    loggedInAt: new Date().toISOString(),
  };
}

export async function login(officerId, password) {
  const id = String(officerId || '').trim();
  const pass = String(password || '');

  if (!id || !pass) {
    throw new Error('Officer ID and password are required.');
  }

  const match = DEMO_OFFICERS.find(
    (o) => o.officerId.toLowerCase() === id.toLowerCase() && o.password === pass
  );

  if (!match) {
    throw new Error('Invalid officer credentials. Try NAMPOL-1001 / demo1234');
  }

  const session = buildSession(match);
  memorySession = session;
  return session;
}

export async function logout() {
  memorySession = null;
}

export async function getSession() {
  return memorySession;
}

export async function isAuthenticated() {
  return !!memorySession;
}
