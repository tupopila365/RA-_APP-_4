"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsService = void 0;
const locations_model_1 = require("./locations.model");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const distance_1 = require("../../utils/distance");
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
                services: dto.services,
                operatingHours: dto.operatingHours,
                closedDays: dto.closedDays,
                specialHours: dto.specialHours,
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
    /**
     * Find nearest offices to a given location
     *
     * @param latitude - User's latitude
     * @param longitude - User's longitude
     * @param limit - Maximum number of offices to return (default: 5)
     * @returns Array of offices with distance in kilometers, sorted by distance
     */
    async findNearestOffices(latitude, longitude, limit = 5) {
        try {
            logger_1.logger.info('Finding nearest offices', { latitude, longitude, limit });
            // Validate coordinates
            if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Invalid coordinates provided',
                };
            }
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                throw {
                    statusCode: 400,
                    code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                    message: 'Coordinates out of valid range',
                };
            }
            // Retrieve all offices from database
            const offices = await locations_model_1.LocationModel.find({}).lean();
            // Calculate distance for each office and add to result
            const officesWithDistance = offices.map((office) => {
                const distance = (0, distance_1.calculateDistance)(latitude, longitude, office.coordinates.latitude, office.coordinates.longitude);
                return {
                    ...office,
                    distance,
                };
            });
            // Sort by distance (ascending)
            officesWithDistance.sort((a, b) => a.distance - b.distance);
            // Return top N offices
            const result = officesWithDistance.slice(0, limit);
            logger_1.logger.info(`Found ${result.length} nearest offices`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Find nearest offices error:', error);
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to find nearest offices',
                details: error.message,
            };
        }
    }
}
exports.locationsService = new LocationsService();
//# sourceMappingURL=locations.service.js.map