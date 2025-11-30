import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class LocationsController {
    /**
     * Create a new location
     * POST /api/locations
     */
    createLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all locations with optional region filtering
     * GET /api/locations
     */
    listLocations(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single location by ID
     * GET /api/locations/:id
     */
    getLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a location
     * PUT /api/locations/:id
     */
    updateLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a location
     * DELETE /api/locations/:id
     */
    deleteLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const locationsController: LocationsController;
//# sourceMappingURL=locations.controller.d.ts.map