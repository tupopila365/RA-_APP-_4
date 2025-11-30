"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vacancies_controller_1 = require("./vacancies.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/vacancies
 * @desc    Create a new vacancy
 * @access  Private (requires vacancies:manage permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vacancies:manage'), vacancies_controller_1.vacanciesController.createVacancy.bind(vacancies_controller_1.vacanciesController));
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
router.get('/', vacancies_controller_1.vacanciesController.listVacancies.bind(vacancies_controller_1.vacanciesController));
/**
 * @route   GET /api/vacancies/:id
 * @desc    Get a single vacancy by ID
 * @access  Public (mobile app users can view published vacancies)
 */
router.get('/:id', vacancies_controller_1.vacanciesController.getVacancy.bind(vacancies_controller_1.vacanciesController));
/**
 * @route   PUT /api/vacancies/:id
 * @desc    Update a vacancy
 * @access  Private (requires vacancies:manage permission)
 */
router.put('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vacancies:manage'), vacancies_controller_1.vacanciesController.updateVacancy.bind(vacancies_controller_1.vacanciesController));
/**
 * @route   DELETE /api/vacancies/:id
 * @desc    Delete a vacancy
 * @access  Private (requires vacancies:manage permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('vacancies:manage'), vacancies_controller_1.vacanciesController.deleteVacancy.bind(vacancies_controller_1.vacanciesController));
exports.default = router;
//# sourceMappingURL=vacancies.routes.js.map