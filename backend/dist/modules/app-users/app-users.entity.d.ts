export declare class AppUser {
    id: number;
    email: string;
    password: string;
    fullName: string | null;
    phoneNumber: string | null;
    isEmailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationTokenExpiry: Date | null;
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
//# sourceMappingURL=app-users.entity.d.ts.map