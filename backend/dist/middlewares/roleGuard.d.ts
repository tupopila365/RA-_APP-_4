import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requirePermission: (permission: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=roleGuard.d.ts.map