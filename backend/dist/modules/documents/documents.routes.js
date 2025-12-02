"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documents_controller_1 = require("./documents.controller");
const auth_1 = require("../../middlewares/auth");
const roleGuard_1 = require("../../middlewares/roleGuard");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/documents
 * @desc    Upload a new PDF document
 * @access  Private (requires documents:upload permission)
 */
router.post('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('documents:upload'), upload_1.uploadPDF.single('file'), documents_controller_1.documentsController.uploadDocument.bind(documents_controller_1.documentsController));
/**
 * @route   GET /api/documents
 * @desc    List all documents with pagination and filtering
 * @access  Private (requires documents:upload permission)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 100)
 * @query   category - Filter by category (policy, tender, report, other)
 * @query   indexed - Filter by indexed status (true/false)
 * @query   search - Search in title and description
 */
router.get('/', auth_1.authenticate, (0, roleGuard_1.requirePermission)('documents:upload'), documents_controller_1.documentsController.listDocuments.bind(documents_controller_1.documentsController));
/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document by ID
 * @access  Private (requires documents:upload permission)
 */
router.get('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('documents:upload'), documents_controller_1.documentsController.getDocument.bind(documents_controller_1.documentsController));
/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private (requires documents:upload permission)
 */
router.delete('/:id', auth_1.authenticate, (0, roleGuard_1.requirePermission)('documents:upload'), documents_controller_1.documentsController.deleteDocument.bind(documents_controller_1.documentsController));
/**
 * @route   GET /api/documents/:id/indexing-progress
 * @desc    Get indexing progress for a document
 * @access  Private (requires documents:upload permission)
 */
router.get('/:id/indexing-progress', auth_1.authenticate, (0, roleGuard_1.requirePermission)('documents:upload'), documents_controller_1.documentsController.getIndexingProgress.bind(documents_controller_1.documentsController));
exports.default = router;
//# sourceMappingURL=documents.routes.js.map