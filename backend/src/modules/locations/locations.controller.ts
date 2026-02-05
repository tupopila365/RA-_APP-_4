import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { locationsService } from './locations.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class LocationsController {
  /**
   * Create a new location
   * POST /api/locations
   */
  async createLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate required fields
      const { 
        name, 
        address, 
        region, 
        coordinates, 
        contactNumber, 
        email, 
        services, 
        operatingHours, 
        closedDays, 
        specialHours 
      } = req.body;

      if (!name || !address || !region || !coordinates) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
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
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Coordinates must include latitude and longitude',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create location
      const location = await locationsService.createLocation({
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

      logger.info(`Location created successfully: ${location.id}`);

      res.status(201).json({
        success: true,
        data: {
          location: {
            id: location.id,
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
    } catch (error: any) {
      logger.error('Create location error:', error);
      next(error);
    }
  }

  /**
   * List all locations with optional region filtering
   * GET /api/locations
   */
  async listLocations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get region filter from query params
      const { region } = req.query;

      const locations = await locationsService.listLocations({
        region: region as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: {
          locations: locations.map((location) => ({
            id: location.id,
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
    } catch (error: any) {
      logger.error('List locations error:', error);
      next(error);
    }
  }

  /**
   * Get a single location by ID
   * GET /api/locations/:id
   */
  async getLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const location = await locationsService.getLocationById(id);

      res.status(200).json({
        success: true,
        data: {
          location: {
            id: location.id,
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
    } catch (error: any) {
      logger.error('Get location error:', error);
      next(error);
    }
  }

  /**
   * Update a location
   * PUT /api/locations/:id
   */
  async updateLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        name, 
        address, 
        region, 
        coordinates, 
        contactNumber, 
        email, 
        services, 
        operatingHours, 
        closedDays, 
        specialHours 
      } = req.body;

      // Build update object with only provided fields
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (region !== undefined) updateData.region = region;
      if (coordinates !== undefined) updateData.coordinates = coordinates;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (email !== undefined) updateData.email = email;
      if (services !== undefined) updateData.services = services;
      if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
      if (closedDays !== undefined) updateData.closedDays = closedDays;
      if (specialHours !== undefined) updateData.specialHours = specialHours;

      const location = await locationsService.updateLocation(id, updateData);

      logger.info(`Location updated successfully: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          location: {
            id: location.id,
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
    } catch (error: any) {
      logger.error('Update location error:', error);
      next(error);
    }
  }

  /**
   * Delete a location
   * DELETE /api/locations/:id
   */
  async deleteLocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await locationsService.deleteLocation(id);

      logger.info(`Location deleted: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Location deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete location error:', error);
      next(error);
    }
  }
}

export const locationsController = new LocationsController();
