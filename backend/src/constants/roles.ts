export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  NEWS_MANAGE: 'news:manage',
  TENDERS_MANAGE: 'tenders:manage',
  VACANCIES_MANAGE: 'vacancies:manage',
  DOCUMENTS_UPLOAD: 'documents:upload',
  BANNERS_MANAGE: 'banners:manage',
  LOCATIONS_MANAGE: 'locations:manage',
  USERS_MANAGE: 'users:manage',
  FAQS_MANAGE: 'faqs:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.NEWS_MANAGE,
    PERMISSIONS.TENDERS_MANAGE,
    PERMISSIONS.VACANCIES_MANAGE,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.BANNERS_MANAGE,
    PERMISSIONS.LOCATIONS_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.FAQS_MANAGE,
  ],
  [ROLES.ADMIN]: [], // Admin permissions are assigned individually
};

// Validate if a permission exists
export const isValidPermission = (permission: string): permission is Permission => {
  return Object.values(PERMISSIONS).includes(permission as Permission);
};

// Validate if a role exists
export const isValidRole = (role: string): role is Role => {
  return Object.values(ROLES).includes(role as Role);
};
