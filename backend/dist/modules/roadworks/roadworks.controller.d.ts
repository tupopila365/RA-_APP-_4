import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
declare class RoadworksController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    list(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    listPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const roadworksController: RoadworksController;
export {};
//# sourceMappingURL=roadworks.controller.d.ts.map