import { Request, Response, NextFunction } from 'express';
export interface AppAuthRequest extends Request {
    user?: {
        id: string;
        userId: string;
        email: string;
    };
}
export declare const authenticateAppUser: (req: AppAuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=appAuth.d.ts.map