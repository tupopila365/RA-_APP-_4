"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsService = void 0;
const locations_model_1 = require("./locations.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class LocationsService {
    /**
     * Create a new location
     */
    async createLocation(dto) {
        try {
            logger_1.logger.info('Creating location:', { name: dto.name, region: dto.region });
            const location = await locations_model_1.LocationModel.create({
                name: dto.name,
                address: dto.address,
                region: dto.region,
                coordinates: dto.coordinates,
                contactNumber: dto.contactNumber,
                email: dto.email,
            });
            logger_1.logger.info(`Location created with ID: ${location._id}`);
            return location;
        }
        catch (error) {
            logger_1.logger.error('Create location error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to create location',
                details: error.message,
            };
        }
    }
    /**
     * List locations with optional filtering by region
     */
    async listLocations(query = {}) {
        try {
            // Build filter
            const filter = {};
            // Filter by region if provided
            if (query.region) {
                filter.region = query.region;
            }
            // Execute query ordered by region and name
            const locations = await locations_model_1.LocationModel.find(filter)
                .sort({ region: 1, name: 1 })
                .lean();
            return locations;
        }
        catch (error) {
            logger_1.logger.error('List locations error:', error);
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve locations',
                details: error.message,
            };
        }
    }
    /**
     * Get a single location by ID
     */
    async getLocationById(locationId) {
        try {
            const location = await locations_model_1.LocationModel.findById(locationId).lean();
            if (!location) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Location not found',
                };
            }
            return location;
        }
        catch (error) {
            logger_1.logger.error('Get location error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve location',
                details: error.message,
            };
        }
    }
    /**
     * Update a location
     */
    async updateLocation(locationId, dto) {
        try {
            logger_1.logger.info(`Updating location: ${locationId}`);
            const location = await locations_model_1.LocationModel.findByIdAndUpdate(locationId, dto, { new: true, runValidators: true }).lean();
            if (!location) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Location not found',
                };
            }
            logger_1.logger.info(`Location ${locationId} updated successfully`);
            return location;
        }
        catch (error) {
            logger_1.logger.error('Update location error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update location',
                details: error.message,
            };
        }
    }
    /**
     * Delete a location
     */
    async deleteLocation(locationId) {
        try {
            logger_1.logger.info(`Deleting location: ${locationId}`);
            const location = await locations_model_1.LocationModel.findByIdAndDelete(locationId);
            if (!location) {
                throw {
                    statusCode: 404,
                    code: errors_1.ERROR_CODES.NOT_FOUND,
                    message: 'Location not found',
                };
            }
            logger_1.logger.info(`Location ${locationId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete location error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete location',
                details: error.message,
            };
        }
    }
}
exports.locationsService = new LocationsService();
//# sourceMappingURL=locations.service.js.map