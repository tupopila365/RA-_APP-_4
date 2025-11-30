import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare class VacanciesController {
    /**
     * Create a new vacancy
     * POST /api/vacancies
     */
    createVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all vacancies with pagination, filtering, and search
     * GET /api/vacancies
     */
    listVacancies(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single vacancy by ID
     * GET /api/vacancies/:id
     */
    getVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update a vacancy
     * PUT /api/vacancies/:id
     */
    updateVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete a vacancy
     * DELETE /api/vacancies/:id
     */
    deleteVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const vacanciesController: VacanciesController;
//# sourceMappingURL=vacancies.controller.d.ts.map