import { AppUser } from './app-users.entity';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, ChangePasswordDTO } from './app-users.dto';
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AppUsersService {
    /**
     * Register a new app user
     */
    register(dto: RegisterDTO): Promise<{
        user: AppUser;
        tokens: AuthTokens;
    }>;
    /**
     * Login app user
     */
    login(credentials: LoginDTO): Promise<{
        user: AppUser;
        tokens: AuthTokens;
    }>;
    /**
     * Get user by ID
     */
    getUserById(id: string): Promise<AppUser>;
    /**
     * Update user profile
     */
    updateUser(id: string, dto: UpdateProfileDTO): Promise<AppUser>;
    /**
     * Change user password
     */
    changePassword(id: string, dto: ChangePasswordDTO): Promise<void>;
    /**
     * Generate access and refresh tokens
     */
    generateTokens(user: AppUser): Promise<AuthTokens>;
    /**
     * Store refresh token in Redis with expiry
     */
    storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    /**
     * Logout user (invalidate refresh token)
     */
    logout(userId: string): Promise<void>;
    /**
     * Generate secure email verification token
     */
    generateEmailVerificationToken(): string;
    /**
     * Verify email using token
     */
    verifyEmail(token: string): Promise<AppUser>;
    /**
     * Resend verification email
     */
    resendVerificationEmail(email: string): Promise<void>;
}
export declare const appUsersService: AppUsersService;
export {};
//# sourceMappingURL=app-users.service.d.ts.map