"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsService = void 0;
const db_1 = require("../../config/db");
const locations_entity_1 = require("./locations.entity");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const distance_1 = require("../../utils/distance");
class LocationsService {
    async createLocation(dto) {
        try {
            logger_1.logger.info('Creating location:', { name: dto.name, region: dto.region });
            const repo = db_1.AppDataSource.getRepository(locations_entity_1.Location);
            const location = repo.create({
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
            await repo.save(location);
            logger_1.logger.info(`Location created with ID: ${location.id}`);
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
    async listLocations(query = {}) {
        try {
            const repo = db_1.AppDataSource.getRepository(locations_entity_1.Location);
            const where = {};
            if (query.region)
                where.region = query.region;
            const locations = await repo.find({
                where,
                order: { region: 'ASC', name: 'ASC' },
            });
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
    async getLocationById(locationId) {
        try {
            const id = parseInt(locationId, 10);
            const repo = db_1.AppDataSource.getRepository(locations_entity_1.Location);
            const location = await repo.findOne({ where: { id } });
            if (!location) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Location not found' };
            }
            return location;
        }
        catch (error) {
            logger_1.logger.error('Get location error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to retrieve location',
                details: error.message,
            };
        }
    }
    async updateLocation(locationId, dto) {
        try {
            logger_1.logger.info(`Updating location: ${locationId}`);
            const id = parseInt(locationId, 10);
            const repo = db_1.AppDataSource.getRepository(locations_entity_1.Location);
            const location = await repo.findOne({ where: { id } });
            if (!location) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Location not found' };
            }
            Object.assign(location, dto);
            await repo.save(location);
            logger_1.logger.info(`Location ${locationId} updated successfully`);
            return location;
        }
        catch (error) {
            logger_1.logger.error('Update location error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to update location',
                details: error.message,
            };
        }
    }
    async deleteLocation(locationId) {
        try {
            logger_1.logger.info(`Deleting location: ${locationId}`);
            const id = parseInt(locationId, 10);
            const repo = db_1.AppDataSource.getRepository(locations_entity_1.Location);
            const location = await repo.findOne({ where: { id } });
            if (!location) {
                throw { statusCode: 404, code: errors_1.ERROR_CODES.NOT_FOUND, message: 'Location not found' };
            }
            await repo.remove(location);
            logger_1.logger.info(`Location ${locationId} deleted successfully`);
        }
        catch (error) {
            logger_1.logger.error('Delete location error:', error);
            if (error.statusCode)
                throw error;
            throw {
                statusCode: 500,
                code: errors_1.ERROR_CODES.DB_OPERATION_FAILED,
                message: 'Failed to delete location',
                details: error.message,
            };
        }
    }
    async findNearestOffices(latitude, longitude, limit = 5) {
        try {
            logger_1.logger.info('Finding nearest offices', { latitude, longitude, limit });
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
            const repo = db_1.AppDataSource.getRepository(locations_entity_1.Location);
            const offices = await repo.find({});
            const officesWithDistance = offices.map((office) => {
                const distance = (0, distance_1.calculateDistance)(latitude, longitude, office.coordinates.latitude, office.coordinates.longitude);
                return { ...office, distance };
            });
            officesWithDistance.sort((a, b) => a.distance - b.distance);
            const result = officesWithDistance.slice(0, limit);
            logger_1.logger.info(`Found ${result.length} nearest offices`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Find nearest offices error:', error);
            if (error.statusCode)
                throw error;
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