"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRole = exports.isValidPermission = exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.ROLES = void 0;
exports.ROLES = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
};
exports.PERMISSIONS = {
    NEWS_MANAGE: 'news:manage',
    TENDERS_MANAGE: 'tenders:manage',
    VACANCIES_MANAGE: 'vacancies:manage',
    DOCUMENTS_UPLOAD: 'documents:upload',
    BANNERS_MANAGE: 'banners:manage',
    LOCATIONS_MANAGE: 'locations:manage',
    USERS_MANAGE: 'users:manage',
    FAQS_MANAGE: 'faqs:manage',
    POTHOLE_REPORTS_MANAGE: 'pothole-reports:manage',
};
// Role-based permission mappings
exports.ROLE_PERMISSIONS = {
    [exports.ROLES.SUPER_ADMIN]: [
        exports.PERMISSIONS.NEWS_MANAGE,
        exports.PERMISSIONS.TENDERS_MANAGE,
        exports.PERMISSIONS.VACANCIES_MANAGE,
        exports.PERMISSIONS.DOCUMENTS_UPLOAD,
        exports.PERMISSIONS.BANNERS_MANAGE,
        exports.PERMISSIONS.LOCATIONS_MANAGE,
        exports.PERMISSIONS.USERS_MANAGE,
        exports.PERMISSIONS.FAQS_MANAGE,
        exports.PERMISSIONS.POTHOLE_REPORTS_MANAGE,
    ],
    [exports.ROLES.ADMIN]: [], // Admin permissions are assigned individually
};
// Validate if a permission exists
const isValidPermission = (permission) => {
    return Object.values(exports.PERMISSIONS).includes(permission);
};
exports.isValidPermission = isValidPermission;
// Validate if a role exists
const isValidRole = (role) => {
    return Object.values(exports.ROLES).includes(role);
};
exports.isValidRole = isValidRole;
//# sourceMappingURL=roles.js.map