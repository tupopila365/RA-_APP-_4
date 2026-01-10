"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roadworksService = void 0;
const roadworks_model_1 = require("./roadworks.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const cache_1 = require("../../utils/cache");
class RoadworksService {
    constructor() {
        this.cachePrefix = 'chatbot-roadworks';
    }
    async invalidateCache() {
        await cache_1.cacheService.deleteAll(this.cachePrefix);
    }
    async createRoadwork(dto, userId) {
        try {
            const roadwork = await roadworks_model_1.RoadworkModel.create({
                ...dto,
                status: dto.status || 'Planned',
                createdBy: userId,
                updatedBy: userId,
            });
            await this.invalidateCache();
            return roadwork;
        }
        catch (error) {
            logger_1.logger.error('Create roadwork error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create roadwork',
                details: error.message,
            };
        }
    }
    async updateRoadwork(roadworkId, dto, userId) {
        try {
            const roadwork = await roadworks_model_1.RoadworkModel.findByIdAndUpdate(roadworkId, { ...dto, updatedBy: userId }, { new: true, runValidators: true }).lean();
            if (!roadwork) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Roadwork not found',
                };
            }
            await this.invalidateCache();
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
            if (query.status) {
                filter.status = Array.isArray(query.status) ? { $in: query.status } : query.status;
            }
            if (query.road) {
                filter.road = new RegExp(query.road.trim(), 'i');
            }
            if (query.area) {
                filter.area = new RegExp(query.area.trim(), 'i');
            }
            if (query.fromDate || query.toDate) {
                filter.startDate = {};
                if (query.fromDate) {
                    filter.startDate.$gte = query.fromDate;
                }
                if (query.toDate) {
                    filter.startDate.$lte = query.toDate;
                }
            }
            const limit = Math.min(200, Math.max(1, query.limit || 50));
            const roadworks = await roadworks_model_1.RoadworkModel.find(filter)
                .sort({ startDate: -1, createdAt: -1 })
                .limit(limit)
                .lean();
            return roadworks;
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
    async findPublicForQuery(term, limit = 3) {
        const filter = { status: { $in: ['Planned', 'Ongoing'] } };
        if (term && term.trim()) {
            const regex = new RegExp(term.trim(), 'i');
            filter.$or = [{ road: regex }, { area: regex }, { section: regex }, { title: regex }];
        }
        const roadworks = await roadworks_model_1.RoadworkModel.find(filter)
            .sort({ startDate: -1, createdAt: -1 })
            .limit(limit)
            .lean();
        return roadworks;
    }
}
exports.roadworksService = new RoadworksService();
//# sourceMappingURL=roadworks.service.js.map