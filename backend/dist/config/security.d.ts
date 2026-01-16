import { Application } from 'express';
/**
 * Security configuration for the application
 */
export declare class SecurityConfig {
    /**
     * Apply all security configurations
     */
    static configure(app: Application): void;
    /**
     * Security environment validation
     */
    static validateEnvironment(): void;
    /**
     * Security monitoring setup
     */
    static setupMonitoring(): void;
}
//# sourceMappingURL=security.d.ts.map