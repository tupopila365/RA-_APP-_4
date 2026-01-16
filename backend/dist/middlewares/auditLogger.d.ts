import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare class AuditLogger {
    /**
     * Log PLN submission attempts
     */
    static logPLNSubmission: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Log admin actions on PLN applications
     */
    static logAdminAction: (action: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Log data access attempts
     */
    static logDataAccess: (req: AuthRequest, res: Response, next: NextFunction) => void;
    /**
     * Log security events
     */
    static logSecurityEvent: (event: string, details: any) => void;
}
//# sourceMappingURL=auditLogger.d.ts.map