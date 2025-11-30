export declare const ROLES: {
    readonly SUPER_ADMIN: "super-admin";
    readonly ADMIN: "admin";
};
export type Role = typeof ROLES[keyof typeof ROLES];
export declare const PERMISSIONS: {
    readonly NEWS_MANAGE: "news:manage";
    readonly TENDERS_MANAGE: "tenders:manage";
    readonly VACANCIES_MANAGE: "vacancies:manage";
    readonly DOCUMENTS_UPLOAD: "documents:upload";
    readonly BANNERS_MANAGE: "banners:manage";
    readonly LOCATIONS_MANAGE: "locations:manage";
    readonly USERS_MANAGE: "users:manage";
};
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export declare const isValidPermission: (permission: string) => permission is Permission;
export declare const isValidRole: (role: string) => role is Role;
//# sourceMappingURL=roles.d.ts.map