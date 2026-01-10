import { Request, Response, NextFunction } from 'express';
declare class TrafficController {
    getStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    private parseType;
}
export declare const trafficController: TrafficController;
export {};
//# sourceMappingURL=traffic.controller.d.ts.map