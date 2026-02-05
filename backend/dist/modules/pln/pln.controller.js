"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.plnController = exports.PLNController = void 0;
const pln_service_1 = require("./pln.service");
const pdf_service_1 = require("../../services/pdf.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
/**
 * Normalize a PLN application document into the structure expected by admin clients.
 * Includes fallbacks so legacy submissions still show meaningful data.
 */
const buildApplicationResponse = (application) => {
    const fullName = application.fullName ||
        [application.surname, application.initials].filter(Boolean).join(' ') ||
        application.businessName ||
        '';
    const idNumber = application.idNumber ||
        application.trafficRegisterNumber ||
        application.businessRegNumber ||
        '';
    const phoneNumber = application.phoneNumber ||
        [application.cellNumber?.code, application.cellNumber?.number].filter(Boolean).join(' ') ||
        [application.telephoneDay?.code, application.telephoneDay?.number].filter(Boolean).join(' ') ||
        [application.telephoneHome?.code, application.telephoneHome?.number].filter(Boolean).join(' ') ||
        '';
    return {
        id: application.id,
        referenceId: application.referenceId,
        transactionType: application.transactionType,
        // Section A - Owner/Transferor
        idType: application.idType,
        trafficRegisterNumber: application.trafficRegisterNumber,
        businessRegNumber: application.businessRegNumber,
        surname: application.surname,
        initials: application.initials,
        businessName: application.businessName,
        postalAddress: application.postalAddress,
        streetAddress: application.streetAddress,
        telephoneHome: application.telephoneHome,
        telephoneDay: application.telephoneDay,
        cellNumber: application.cellNumber,
        email: application.email,
        // Legacy / computed fallbacks
        fullName,
        idNumber,
        phoneNumber,
        // Section B
        plateFormat: application.plateFormat,
        quantity: application.quantity,
        plateChoices: application.plateChoices,
        // Section C - Representative / Proxy
        hasRepresentative: application.hasRepresentative,
        representativeIdType: application.representativeIdType,
        representativeIdNumber: application.representativeIdNumber,
        representativeSurname: application.representativeSurname,
        representativeInitials: application.representativeInitials,
        // Section D - Vehicle
        hasVehicle: application.hasVehicle,
        currentLicenceNumber: application.currentLicenceNumber,
        vehicleRegisterNumber: application.vehicleRegisterNumber,
        chassisNumber: application.chassisNumber,
        vehicleMake: application.vehicleMake,
        seriesName: application.seriesName,
        // Section E - Declaration
        declarationAccepted: application.declarationAccepted,
        declarationDate: application.declarationDate,
        declarationPlace: application.declarationPlace,
        declarationRole: application.declarationRole,
        // Document and status
        documentUrl: application.documentUrl,
        status: application.status,
        statusHistory: application.statusHistory,
        adminComments: application.adminComments,
        paymentDeadline: application.paymentDeadline,
        paymentReceivedAt: application.paymentReceivedAt,
        // Additional admin fields
        assignedTo: application.assignedTo,
        priority: application.priority,
        tags: application.tags,
        internalNotes: application.internalNotes,
        // Payment information
        paymentAmount: application.paymentAmount,
        paymentMethod: application.paymentMethod,
        paymentReference: application.paymentReference,
        // Processing information
        processedBy: application.processedBy,
        processedAt: application.processedAt,
        reviewedBy: application.reviewedBy,
        reviewedAt: application.reviewedAt,
        // Plate production information
        plateOrderNumber: application.plateOrderNumber,
        plateSupplier: application.plateSupplier,
        plateOrderedAt: application.plateOrderedAt,
        plateDeliveredAt: application.plateDeliveredAt,
        plateCollectedAt: application.plateCollectedAt,
        plateCollectedBy: application.plateCollectedBy,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
    };
};
class PLNController {
    /**
     * Create a new PLN application
     * POST /api/pln/applications
     */
    async createApplication(req, res, next) {
        try {
            const authReq = req;
            const userEmail = authReq.user?.email;
            logger_1.logger.info('Received PLN application request:', {
                body: req.body,
                hasFile: !!req.file,
                hasUser: !!userEmail,
            });
            // Parse form data (FormData sends JSON strings for complex objects)
            const parseJSONField = (field) => {
                if (typeof field === 'string') {
                    try {
                        return JSON.parse(field);
                    }
                    catch {
                        return field;
                    }
                }
                return field;
            };
            let plateChoices = parseJSONField(req.body.plateChoices);
            const postalAddress = parseJSONField(req.body.postalAddress);
            const streetAddress = parseJSONField(req.body.streetAddress);
            const telephoneHome = parseJSONField(req.body.telephoneHome);
            const telephoneDay = parseJSONField(req.body.telephoneDay);
            const cellNumber = parseJSONField(req.body.cellNumber); // Check if using new structure or legacy
            const isNewStructure = req.body.idType && req.body.surname && postalAddress; // Validate document file
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Certified ID document is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Build DTO based on structure
            let dto;
            if (isNewStructure) { // New comprehensive structure
                dto = {
                    idType: req.body.idType,
                    trafficRegisterNumber: req.body.trafficRegisterNumber,
                    businessRegNumber: req.body.businessRegNumber,
                    surname: req.body.surname,
                    initials: req.body.initials,
                    businessName: req.body.businessName,
                    postalAddress,
                    streetAddress,
                    telephoneHome,
                    telephoneDay,
                    cellNumber,
                    email: userEmail || req.body.email, // Use authenticated user's email if available
                    plateFormat: req.body.plateFormat,
                    quantity: req.body.quantity ? parseInt(req.body.quantity, 10) : 1,
                    plateChoices,
                    hasRepresentative: req.body.hasRepresentative === 'true',
                    representativeIdType: req.body.representativeIdType,
                    representativeIdNumber: req.body.representativeIdNumber,
                    representativeSurname: req.body.representativeSurname,
                    representativeInitials: req.body.representativeInitials,
                    currentLicenceNumber: req.body.currentLicenceNumber,
                    vehicleRegisterNumber: req.body.vehicleRegisterNumber,
                    chassisNumber: req.body.chassisNumber,
                    vehicleMake: req.body.vehicleMake,
                    seriesName: req.body.seriesName,
                    declarationAccepted: req.body.declarationAccepted === 'true',
                    declarationPlace: req.body.declarationPlace,
                    declarationRole: req.body.declarationRole || 'applicant',
                };
            }
            else { // Legacy structure
                const { fullName, idNumber, phoneNumber } = req.body;
                if (!fullName || !fullName.trim()) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Full name is required',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                if (!idNumber || !idNumber.trim()) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'ID number is required',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                if (!phoneNumber || !phoneNumber.trim()) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Phone number is required',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                if (!plateChoices || !Array.isArray(plateChoices) || plateChoices.length !== 3) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                            message: 'Exactly 3 plate choices are required',
                        },
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
                dto = {
                    fullName: fullName.trim(),
                    idNumber: idNumber.trim(),
                    phoneNumber: phoneNumber.trim(),
                    plateChoices,
                };
            }
            // Create application
            const application = await pln_service_1.plnService.createApplication(dto, req.file);
            logger_1.logger.info(`PLN application created successfully: ${application.id}`);
            res.status(201).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        referenceId: application.referenceId,
                        trackingPin: application.trackingPin,
                        fullName: application.fullName,
                        status: application.status,
                        createdAt: application.createdAt,
                    },
                    message: 'Application submitted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create application error:', error);
            next(error);
        }
    }
    /**
     * Get user's PLN applications by email (if authenticated)
     * GET /api/pln/my-applications
     */
    async getMyApplications(req, res, next) {
        try {
            const authReq = req;
            const userEmail = authReq.user?.email;
            if (!userEmail) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.AUTH_MISSING_TOKEN,
                        message: 'Authentication required. Please log in to view your applications.',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const applications = await pln_service_1.plnService.getApplicationsByEmail(userEmail);
            res.status(200).json({
                success: true,
                data: {
                    applications: applications.map((app) => ({
                        id: app.id,
                        referenceId: app.referenceId,
                        trackingPin: app.trackingPin,
                        fullName: app.fullName,
                        status: app.status,
                        plateChoices: app.plateChoices,
                        statusHistory: app.statusHistory,
                        paymentDeadline: app.paymentDeadline,
                        paymentReceivedAt: app.paymentReceivedAt,
                        adminComments: app.adminComments,
                        createdAt: app.createdAt,
                        updatedAt: app.updatedAt,
                    })),
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get my applications error:', error);
            next(error);
        }
    }
    /**
     * Track application by reference ID and PIN (public)
     * GET /api/pln/track/:referenceId/:pin
     * Universal PIN: 12345 for all users
     */
    async trackApplication(req, res, next) {
        try {
            const { referenceId, pin } = req.params;
            if (!referenceId || !pin) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Reference ID and PIN are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const application = await pln_service_1.plnService.getApplicationByReference(referenceId, pin);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        referenceId: application.referenceId,
                        fullName: application.fullName,
                        status: application.status,
                        plateChoices: application.plateChoices,
                        statusHistory: application.statusHistory,
                        paymentDeadline: application.paymentDeadline,
                        paymentReceivedAt: application.paymentReceivedAt,
                        adminComments: application.adminComments,
                        createdAt: application.createdAt,
                        updatedAt: application.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Track application error:', error);
            next(error);
        }
    }
    /**
     * List all applications (admin)
     * GET /api/pln/applications
     */
    async listApplications(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const search = req.query.search;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const result = await pln_service_1.plnService.listApplications({
                page,
                limit,
                status,
                search,
                startDate,
                endDate,
            });
            res.status(200).json({
                success: true,
                data: {
                    applications: result.applications.map((app) => buildApplicationResponse(app)),
                    pagination: {
                        total: result.total,
                        page: result.page,
                        totalPages: result.totalPages,
                        limit,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('List applications error:', error);
            next(error);
        }
    }
    /**
     * Get application by ID (admin)
     * GET /api/pln/applications/:id
     */
    async getApplication(req, res, next) {
        try {
            const { id } = req.params;
            const application = await pln_service_1.plnService.getApplicationById(id);
            res.status(200).json({
                success: true,
                data: {
                    application: buildApplicationResponse(application),
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get application error:', error);
            next(error);
        }
    }
    /**
     * Update application status (admin)
     * PUT /api/pln/applications/:id/status
     */
    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, comment } = req.body;
            if (!status || !['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DECLINED'].includes(status)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Valid status is required (SUBMITTED, UNDER_REVIEW, APPROVED, DECLINED)',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.updateStatus(id, status, adminId, comment);
            logger_1.logger.info(`Application ${id} status updated to ${status}`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        status: application.status,
                        paymentDeadline: application.paymentDeadline,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Status updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update status error:', error);
            next(error);
        }
    }
    /**
     * Mark payment as received (admin)
     * PUT /api/pln/applications/:id/payment
     */
    async markPaymentReceived(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.markPaymentReceived(id, adminId);
            logger_1.logger.info(`Payment marked as received for application ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        status: application.status,
                        paymentReceivedAt: application.paymentReceivedAt,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Payment marked as received',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Mark payment received error:', error);
            next(error);
        }
    }
    /**
     * Order plates (admin)
     * PUT /api/pln/applications/:id/order-plates
     */
    async orderPlates(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.orderPlates(id, adminId);
            logger_1.logger.info(`Plates ordered for application ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        status: application.status,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Plates ordered successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Order plates error:', error);
            next(error);
        }
    }
    /**
     * Mark ready for collection (admin)
     * PUT /api/pln/applications/:id/ready
     */
    async markReadyForCollection(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.markReadyForCollection(id, adminId);
            logger_1.logger.info(`Application ${id} marked as ready for collection`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        status: application.status,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Application marked as ready for collection',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Mark ready for collection error:', error);
            next(error);
        }
    }
    /**
     * Get dashboard statistics (admin)
     * GET /api/pln/dashboard/stats
     */
    async getDashboardStats(req, res, next) {
        try {
            const stats = await pln_service_1.plnService.getDashboardStats();
            res.status(200).json({
                success: true,
                data: {
                    stats,
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get dashboard stats error:', error);
            next(error);
        }
    }
    /**
     * Download application form as PDF (admin)
     * GET /api/pln/applications/:id/download-pdf
     * This fills the actual PLN-FORM.pdf template with the user's application data
     */
    async downloadPDF(req, res, next) {
        try {
            const { id } = req.params;
            // Get application data
            const application = await pln_service_1.plnService.getApplicationById(id);
            // Log application data for debugging
            logger_1.logger.info('Downloading PDF for application', {
                applicationId: id,
                referenceId: application.referenceId,
                hasSurname: !!application.surname,
                hasIdType: !!application.idType,
                hasPlateChoices: !!application.plateChoices?.length,
                surname: application.surname,
                idType: application.idType,
                plateChoicesCount: application.plateChoices?.length || 0,
            });
            // Resolve path to static PDF template file
            const templatePath = path.join(__dirname, '../../../data/forms/PLN-FORM.pdf');
            logger_1.logger.info('Template PDF path:', templatePath);
            // Try to fill the PDF template with application data
            // If the template doesn't have fillable fields, it will overlay text on the PDF
            const pdfBuffer = await pdf_service_1.pdfService.fillPLNFormPDF(application, templatePath);
            logger_1.logger.info('PDF filled successfully', {
                bufferSize: pdfBuffer.length,
                applicationId: id,
            });
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="PLN-Application-${application.referenceId}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length.toString());
            // Send filled PDF
            res.send(pdfBuffer);
        }
        catch (error) {
            logger_1.logger.error('Download PDF error:', error);
            next(error);
        }
    }
    /**
     * Update admin comments (admin)
     * PUT /api/pln/applications/:id/comments
     */
    async updateAdminComments(req, res, next) {
        try {
            const { id } = req.params;
            const { comments } = req.body;
            if (!comments || typeof comments !== 'string') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Comments are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.updateAdminComments(id, comments, adminId);
            logger_1.logger.info(`Admin comments updated for application ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        adminComments: application.adminComments,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Admin comments updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update admin comments error:', error);
            next(error);
        }
    }
    /**
     * Assign application to admin (admin)
     * PUT /api/pln/applications/:id/assign
     */
    async assignToAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const { assignedTo } = req.body;
            if (!assignedTo || typeof assignedTo !== 'string') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Assigned to field is required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.assignToAdmin(id, assignedTo, adminId);
            logger_1.logger.info(`Application ${id} assigned to ${assignedTo}`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        assignedTo: application.assignedTo,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Application assigned successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Assign to admin error:', error);
            next(error);
        }
    }
    /**
     * Set application priority (admin)
     * PUT /api/pln/applications/:id/priority
     */
    async setPriority(req, res, next) {
        try {
            const { id } = req.params;
            const { priority } = req.body;
            if (!priority || !['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(priority)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Valid priority is required (LOW, NORMAL, HIGH, URGENT)',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const adminId = req.user?.email || req.user?.userId || 'Unknown';
            const application = await pln_service_1.plnService.setPriority(id, priority, adminId);
            logger_1.logger.info(`Application ${id} priority set to ${priority}`);
            res.status(200).json({
                success: true,
                data: {
                    application: {
                        id: application.id,
                        priority: application.priority,
                        statusHistory: application.statusHistory,
                        updatedAt: application.updatedAt,
                    },
                    message: 'Priority updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Set priority error:', error);
            next(error);
        }
    }
    async downloadForm(req, res, next) {
        try {
            // Resolve path to static PDF template file
            // __dirname in dev: backend/src/modules/pln
            // __dirname in prod: backend/dist/modules/pln
            // Need to go up 3 levels to reach backend root, then into data/forms
            const templatePath = path.join(__dirname, '../../../data/forms/PLN-FORM.pdf');
            // Check if file exists
            try {
                await fs.access(templatePath);
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.NOT_FOUND,
                        message: 'PLN form PDF not found',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Read the PDF file
            const pdfBuffer = await fs.readFile(templatePath);
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="PLN-FORM.pdf"');
            res.setHeader('Content-Length', pdfBuffer.length.toString());
            // Send PDF
            res.send(pdfBuffer);
        }
        catch (error) {
            logger_1.logger.error('Download form error:', error);
            next(error);
        }
    }
}
exports.PLNController = PLNController;
exports.plnController = new PLNController();
//# sourceMappingURL=pln.controller.js.map