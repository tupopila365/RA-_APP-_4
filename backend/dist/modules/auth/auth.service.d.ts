import { User } from './auth.entity';
interface LoginCredentials {
    email: string;
    password: string;
}
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    /**
     * Authenticate user with email and password
     */
    login(credentials: LoginCredentials): Promise<{
        user: User;
        tokens: AuthTokens;
    }>;
    /**
     * Generate access and refresh tokens
     */
    generateTokens(user: User): Promise<AuthTokens>;
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
     * Logout user by removing refresh token from Redis
     */
    logout(userId: string): Promise<void>;
    /**
     * Verify if a refresh token is valid
     */
    verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map