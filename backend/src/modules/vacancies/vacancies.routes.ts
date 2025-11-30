import { Router } from 'express';
import { vacanciesController } from './vacancies.controller';
import { authenticate } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/roleGuard';

const router = Router();

/**
 * @route   POST /api/vacancies
 * @desc    Create a new vacancy
 * @access  Private (requires vacancies:manage permission)
 */
router.post(
  '/',
  authenticate,
  requirePermission('vacancies:manage'),
  vacanciesController.createVacancy.bind(vacanciesController)
);

/**
 * @route   GET /api/vacancies
 * @desc    List all vacancies with pagination, filtering, and search
 * @access  Public (mobile app users can view published vacancies)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   type - Filter by vacancy type (full-time, part-time, bursary, internship)
 * @query   department - Filter by department
 * @query   location - Filter by location
 * @query   published - Filter by published status (true/false)
 * @query   search - Search in title and description
 */
router.get(
  '/',
  vacanciesController.listVacancies.bind(vacanciesController)
);

/**
 * @route   GET /api/vacancies/:id
 * @desc    Get a single vacancy by ID
 * @access  Public (mobile app users can view published vacancies)
 */
router.get(
  '/:id',
  vacanciesController.getVacancy.bind(vacanciesController)
);

/**
 * @route   PUT /api/vacancies/:id
 * @desc    Update a vacancy
 * @access  Private (requires vacancies:manage permission)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('vacancies:manage'),
  vacanciesController.updateVacancy.bind(vacanciesController)
);

/**
 * @route   DELETE /api/vacancies/:id
 * @desc    Delete a vacancy
 * @access  Private (requires vacancies:manage permission)
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('vacancies:manage'),
  vacanciesController.deleteVacancy.bind(vacanciesController)
);

export default router;
