"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadworksService = void 0;
const roadworks_model_1 = require("./roadworks.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const cache_1 = require("../../utils/cache");
const routeCalculator_1 = require("../../utils/routeCalculator");
const roadworks_validation_1 = require("./roadworks.validation");
class RoadworksService {
    constructor() {
        this.cachePrefix = 'chatbot-roadworks';
    }
    async invalidateCache() {
        await cache_1.cacheService.deleteAll(this.cachePrefix);
    }
    async createRoadwork(dto, userId, userEmail) {
        try {
            // Validate roadwork data
            const validation = (0, roadworks_validation_1.validateRoadworkData)(dto, false);
            if (!validation.valid) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Validation failed',
                    details: validation.errors.join('; ')
                };
            }
            // Log warnings if any
            if (validation.warnings.length > 0) {
                logger_1.logger.warn('Roadwork creation warnings:', validation.warnings);
            }
            // Process alternate routes if provided
            const processedAlternateRoutes = await this.processAlternateRoutes(dto.alternateRoutes || [], dto.roadClosure ? {
                ...dto.roadClosure,
                polylineCoordinates: dto.roadClosure.polylineCoordinates || []
            } : undefined);
            // Process road closure polyline if provided
            let processedRoadClosure = undefined;
            if (dto.roadClosure) {
                processedRoadClosure = {
                    ...dto.roadClosure,
                    polylineCoordinates: dto.roadClosure.polylineCoordinates || (0, routeCalculator_1.generatePolylineCoordinates)([
                        dto.roadClosure.startCoordinates,
                        dto.roadClosure.endCoordinates
                    ])
                };
            }
            // Create initial change history entry
            const initialHistory = {
                timestamp: new Date(),
                userId: userId || 'system',
                userEmail: userEmail,
                action: 'created',
                changes: [
                    { field: 'status', newValue: dto.status || 'Planned' },
                    { field: 'published', newValue: dto.published || false }
                ]
            };
            const roadwork = await roadworks_model_1.RoadworkModel.create({
                ...dto,
                status: dto.status || 'Planned',
                createdBy: userId,
                createdByEmail: userEmail,
                updatedBy: userId,
                updatedByEmail: userEmail,
                roadClosure: processedRoadClosure,
                alternateRoutes: processedAlternateRoutes,
                changeHistory: [initialHistory]
            });
            await this.invalidateCache();
            logger_1.logger.info(`Roadwork created by ${userEmail || userId}: ${roadwork._id}`);
            return roadwork;
        }
        catch (error) {
            logger_1.logger.error('Create roadwork error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create roadwork',
                details: error.message,
            };
        }
    }
    async updateRoadwork(roadworkId, dto, userId, userEmail) {
        try {
            // Get existing roadwork for change tracking
            const existingRoadwork = await roadworks_model_1.RoadworkModel.findById(roadworkId);
            if (!existingRoadwork) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Roadwork not found',
                };
            }
            // Validate roadwork data
            const validation = (0, roadworks_validation_1.validateRoadworkData)(dto, true);
            if (!validation.valid) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Validation failed',
                    details: validation.errors.join('; ')
                };
            }
            // Log warnings if any
            if (validation.warnings.length > 0) {
                logger_1.logger.warn('Roadwork update warnings:', validation.warnings);
            }
            // Track changes for history
            const changes = [];
            // Compare key fields
            const fieldsToTrack = [
                'status', 'published', 'title', 'road', 'section', 'area', 'region',
                'startDate', 'expectedCompletion', 'priority', 'contractor'
            ];
            for (const field of fieldsToTrack) {
                if (dto[field] !== undefined) {
                    const oldValue = existingRoadwork[field];
                    const newValue = dto[field];
                    // Convert dates to strings for comparison
                    const oldStr = oldValue instanceof Date ? oldValue.toISOString() : oldValue;
                    const newStr = newValue instanceof Date ? new Date(newValue).toISOString() : newValue;
                    if (oldStr !== newStr) {
                        changes.push({
                            field,
                            oldValue: oldStr,
                            newValue: newStr
                        });
                    }
                }
            }
            // Check coordinates change
            if (dto.coordinates) {
                const oldCoords = existingRoadwork.coordinates;
                const newCoords = dto.coordinates;
                if (!oldCoords ||
                    oldCoords.latitude !== newCoords.latitude ||
                    oldCoords.longitude !== newCoords.longitude) {
                    changes.push({
                        field: 'coordinates',
                        oldValue: oldCoords ? `${oldCoords.latitude},${oldCoords.longitude}` : 'none',
                        newValue: `${newCoords.latitude},${newCoords.longitude}`
                    });
                }
            }
            // Determine action type
            let action = 'updated';
            if (changes.some(c => c.field === 'status')) {
                action = 'status_changed';
            }
            else if (changes.some(c => c.field === 'published')) {
                action = dto.published ? 'published' : 'unpublished';
            }
            // Process alternate routes if provided
            let processedAlternateRoutes = dto.alternateRoutes;
            if (dto.alternateRoutes) {
                processedAlternateRoutes = await this.processAlternateRoutes(dto.alternateRoutes, dto.roadClosure ? {
                    ...dto.roadClosure,
                    polylineCoordinates: dto.roadClosure.polylineCoordinates || []
                } : undefined);
            }
            // Process road closure polyline if provided
            let processedRoadClosure = undefined;
            if (dto.roadClosure) {
                processedRoadClosure = {
                    ...dto.roadClosure,
                    polylineCoordinates: dto.roadClosure.polylineCoordinates || (0, routeCalculator_1.generatePolylineCoordinates)([
                        dto.roadClosure.startCoordinates,
                        dto.roadClosure.endCoordinates
                    ])
                };
            }
            // Create change history entry
            const historyEntry = {
                timestamp: new Date(),
                userId: userId || 'system',
                userEmail: userEmail,
                action,
                changes
            };
            const updateData = {
                ...dto,
                updatedBy: userId,
                updatedByEmail: userEmail,
                ...(processedRoadClosure && { roadClosure: processedRoadClosure }),
                ...(processedAlternateRoutes && { alternateRoutes: processedAlternateRoutes }),
                $push: { changeHistory: historyEntry }
            };
            const roadwork = await roadworks_model_1.RoadworkModel.findByIdAndUpdate(roadworkId, updateData, { new: true, runValidators: true }).lean();
            if (!roadwork) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Roadwork not found',
                };
            }
            await this.invalidateCache();
            logger_1.logger.info(`Roadwork updated by ${userEmail || userId}: ${roadworkId} - ${changes.length} changes`);
            return roadwork;
        }
        catch (error) {
            logger_1.logger.error('Update roadwork error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update roadwork',
                details: error.message,
            };
        }
    }
    async deleteRoadwork(roadworkId) {
        try {
            const roadwork = await roadworks_model_1.RoadworkModel.findByIdAndDelete(roadworkId);
            if (!roadwork) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Roadwork not found',
                };
            }
            await this.invalidateCache();
        }
        catch (error) {
            logger_1.logger.error('Delete roadwork error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete roadwork',
                details: error.message,
            };
        }
    }
    async getRoadworkById(roadworkId) {
        try {
            const roadwork = await roadworks_model_1.RoadworkModel.findById(roadworkId).lean();
            if (!roadwork) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Roadwork not found',
                };
            }
            return roadwork;
        }
        catch (error) {
            logger_1.logger.error('Get roadwork error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve roadwork',
                details: error.message,
            };
        }
    }
    async listRoadworks(query = {}) {
        try {
            const filter = {};
            // Status filter
            if (query.status) {
                filter.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
            }
            // Text search
            if (query.search && query.search.trim()) {
                filter.$text = { $search: query.search.trim() };
            }
            // Field filters
            if (query.road) {
                filter.road = new RegExp(query.road.trim(), 'i');
            }
            if (query.area) {
                filter.area = new RegExp(query.area.trim(), 'i');
            }
            if (query.region) {
                filter.region = new RegExp(query.region.trim(), 'i');
            }
            if (query.published !== undefined) {
                filter.published = query.published;
            }
            if (query.priority) {
                filter.priority = query.priority;
            }
            // Date range filter
            if (query.fromDate || query.toDate) {
                filter.startDate = {};
                if (query.fromDate) {
                    filter.startDate.$gte = query.fromDate;
                }
                if (query.toDate) {
                    filter.startDate.$lte = query.toDate;
                }
            }
            // Pagination
            const page = Math.max(1, query.page || 1);
            const limit = Math.min(100, Math.max(1, query.limit || 20));
            const skip = (page - 1) * limit;
            // Get total count
            const total = await roadworks_model_1.RoadworkModel.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);
            // Get roadworks
            const roadworks = await roadworks_model_1.RoadworkModel.find(filter)
                .sort({ startDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            return {
                roadworks: roadworks,
                pagination: {
                    total,
                    page,
                    totalPages,
                    limit,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('List roadworks error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve roadworks',
                details: error.message,
            };
        }
    }
    async findPublicForQuery(term, limit = 50) {
        try {
            const filter = {
                published: true,
                status: { $in: ['Planned', 'Planned Works', 'Ongoing', 'Ongoing Maintenance', 'Closed', 'Restricted'] }
            };
            if (term && term.trim()) {
                const regex = new RegExp(term.trim(), 'i');
                filter.$or = [
                    { road: regex },
                    { area: regex },
                    { region: regex },
                    { section: regex },
                    { title: regex },
                    { description: regex }
                ];
            }
            const roadworks = await roadworks_model_1.RoadworkModel.find(filter)
                .sort({ priority: -1, startDate: -1, createdAt: -1 })
                .limit(Math.min(100, limit))
                .lean();
            return roadworks;
        }
        catch (error) {
            logger_1.logger.error('Find public roadworks error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve public roadworks',
                details: error.message,
            };
        }
    }
    /**
     * Process and validate alternate routes
     */
    async processAlternateRoutes(routes, roadClosure) {
        const processedRoutes = [];
        for (const route of routes) {
            // Validate waypoints coordinates
            for (const waypoint of route.waypoints) {
                if (!(0, routeCalculator_1.validateNamibianCoordinates)(waypoint.coordinates)) {
                    throw {
                        statusCode: 400,
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: `Invalid coordinates for waypoint "${waypoint.name}". Must be within Namibia bounds.`,
                    };
                }
            }
            // Auto-calculate distance and time if not provided
            let { distanceKm, estimatedTime } = route;
            if (!distanceKm || !estimatedTime) {
                const calculated = (0, routeCalculator_1.calculateRouteMetrics)(route.waypoints, route.roadsUsed);
                distanceKm = distanceKm || calculated.distanceKm;
                estimatedTime = estimatedTime || calculated.estimatedTime;
            }
            // Generate polyline coordinates if not provided
            let polylineCoordinates = route.polylineCoordinates;
            if (!polylineCoordinates || polylineCoordinates.length === 0) {
                polylineCoordinates = (0, routeCalculator_1.generatePolylineCoordinates)(route.waypoints.map(wp => wp.coordinates));
            }
            // Validate route doesn't overlap with closed road
            if (roadClosure && roadClosure.polylineCoordinates) {
                const hasOverlap = (0, routeCalculator_1.validateRouteOverlap)(polylineCoordinates, roadClosure.polylineCoordinates, 0.5 // 500m tolerance
                );
                if (hasOverlap) {
                    logger_1.logger.warn(`Alternate route "${route.routeName}" overlaps with closed road`);
                    // Don't throw error, just log warning - admin can still approve if needed
                }
            }
            processedRoutes.push({
                routeName: route.routeName,
                roadsUsed: route.roadsUsed,
                waypoints: route.waypoints,
                vehicleType: route.vehicleType || ['All'],
                distanceKm,
                estimatedTime,
                polylineCoordinates,
                isRecommended: route.isRecommended || false,
                approved: route.approved || false,
            });
        }
        return processedRoutes;
    }
}
exports.roadworksService = new RoadworksService();
//# sourceMappingURL=roadworks.service.js.map