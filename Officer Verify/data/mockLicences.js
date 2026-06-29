/**
 * Mock NaTIS licence registry — matches myRA design app sample holder.
 */

const IMG = require('../assets/passport.jpg');

export const MOCK_LICENCES = {
  NAM879912PE84: {
    licenceNumber: 'NAM879912PE84',
    displayNumber: 'NAM 879912 PE84',
    firstName: 'Peter',
    lastName: 'Kyle',
    fullName: 'Peter Kyle',
    photo: IMG,
    codes: ['B'],
    codeDisplay: 'B',
    issueDate: '2024-08-21',
    expiryDate: '2026-08-21',
    expiryDisplay: '21 Aug 2026',
    status: 'active',
    restrictions: [],
  },
};

export const DEMO_OFFICERS = [
  {
    officerId: 'NAMPOL-1001',
    password: 'demo1234',
    name: 'Officer T. Shikongo',
    unit: 'Windhoek Traffic',
    organisation: 'NAMPOL',
  },
  {
    officerId: 'RA-2001',
    password: 'demo1234',
    name: 'Inspector M. Nangolo',
    unit: 'RA Enforcement',
    organisation: 'RA',
  },
];

const usedTokens = new Set();

export function markTokenUsed(token) {
  if (token) usedTokens.add(token);
}

export function isTokenUsed(token) {
  return usedTokens.has(token);
}

export function clearUsedTokens() {
  usedTokens.clear();
}

export function findLicenceByNumber(rawNumber) {
  const key = String(rawNumber || '').replace(/\s+/g, '').toUpperCase();
  return MOCK_LICENCES[key] || null;
}
