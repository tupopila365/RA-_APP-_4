"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationsController = exports.LocationsController = void 0;
const locations_service_1 = require("./locations.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class LocationsController {
    /**
     * Create a new location
     * POST /api/locations
     */
    async createLocation(req, res, next) {
        try {
            // Validate required fields
            const { name, address, region, coordinates, contactNumber, email, services, operatingHours, closedDays, specialHours } = req.body;
            if (!name || !address || !region || !coordinates) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Name, address, region, and coordinates are required',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate coordinates structure
            if (!coordinates.latitude || !coordinates.longitude) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_ERROR,
                        message: 'Coordinates must include latitude and longitude',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Create location
            const location = await locations_service_1.locationsService.createLocation({
                name,
                address,
                region,
                coordinates,
                contactNumber,
                email,
                services,
                operatingHours,
                closedDays,
                specialHours,
            });
            logger_1.logger.info(`Location created successfully: ${location._id}`);
            res.status(201).json({
                success: true,
                data: {
                    location: {
                        id: location._id,
                        name: location.name,
                        address: location.address,
                        region: location.region,
                        coordinates: location.coordinates,
                        contactNumber: location.contactNumber,
                        email: location.email,
                        services: location.services,
                        operatingHours: location.operatingHours,
                        closedDays: location.closedDays,
                        specialHours: location.specialHours,
                        createdAt: location.createdAt,
                        updatedAt: location.updatedAt,
                    },
                    message: 'Location created successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create location error:', error);
            next(error);
        }
    }
    /**
     * List all locations with optional region filtering
     * GET /api/locations
     */
    async listLocations(req, res, next) {
        try {
            // Get region filter from query params
            const { region } = req.query;
            const locations = await locations_service_1.locationsService.listLocations({
                region: region,
            });
            res.status(200).json({
                success: true,
                data: {
                    locations: locations.map((location) => ({
                        id: location._id,
                        name: location.name,
                        address: location.address,
                        region: location.region,
                        coordinates: location.coordinates,
                        contactNumber: location.contactNumber,
                        email: location.email,
                        services: location.services,
                        operatingHours: location.operatingHours,
                        closedDays: location.closedDays,
                        specialHours: location.specialHours,
                        createdAt: location.createdAt,
                        updatedAt: location.updatedAt,
                    })),
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('List locations error:', error);
            next(error);
        }
    }
    /**
     * Get a single location by ID
     * GET /api/locations/:id
     */
    async getLocation(req, res, next) {
        try {
            const { id } = req.params;
            const location = await locations_service_1.locationsService.getLocationById(id);
            res.status(200).json({
                success: true,
                data: {
                    location: {
                        id: location._id,
                        name: location.name,
                        address: location.address,
                        region: location.region,
                        coordinates: location.coordinates,
                        contactNumber: location.contactNumber,
                        email: location.email,
                        services: location.services,
                        operatingHours: location.operatingHours,
                        closedDays: location.closedDays,
                        specialHours: location.specialHours,
                        createdAt: location.createdAt,
                        updatedAt: location.updatedAt,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get location error:', error);
            next(error);
        }
    }
    /**
     * Update a location
     * PUT /api/locations/:id
     */
    async updateLocation(req, res, next) {
        try {
            const { id } = req.params;
            const { name, address, region, coordinates, contactNumber, email, services, operatingHours, closedDays, specialHours } = req.body;
            // Build update object with only provided fields
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (address !== undefined)
                updateData.address = address;
            if (region !== undefined)
                updateData.region = region;
            if (coordinates !== undefined)
                updateData.coordinates = coordinates;
            if (contactNumber !== undefined)
                updateData.contactNumber = contactNumber;
            if (email !== undefined)
                updateData.email = email;
            if (services !== undefined)
                updateData.services = services;
            if (operatingHours !== undefined)
                updateData.operatingHours = operatingHours;
            if (closedDays !== undefined)
                updateData.closedDays = closedDays;
            if (specialHours !== undefined)
                updateData.specialHours = specialHours;
            const location = await locations_service_1.locationsService.updateLocation(id, updateData);
            logger_1.logger.info(`Location updated successfully: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    location: {
                        id: location._id,
                        name: location.name,
                        address: location.address,
                        region: location.region,
                        coordinates: location.coordinates,
                        contactNumber: location.contactNumber,
                        email: location.email,
                        services: location.services,
                        operatingHours: location.operatingHours,
                        closedDays: location.closedDays,
                        specialHours: location.specialHours,
                        createdAt: location.createdAt,
                        updatedAt: location.updatedAt,
                    },
                    message: 'Location updated successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update location error:', error);
            next(error);
        }
    }
    /**
     * Delete a location
     * DELETE /api/locations/:id
     */
    async deleteLocation(req, res, next) {
        try {
            const { id } = req.params;
            await locations_service_1.locationsService.deleteLocation(id);
            logger_1.logger.info(`Location deleted: ${id}`);
            res.status(200).json({
                success: true,
                data: {
                    message: 'Location deleted successfully',
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete location error:', error);
            next(error);
        }
    }
}
exports.LocationsController = LocationsController;
exports.locationsController = new LocationsController();
//# sourceMappingURL=locations.controller.js.map