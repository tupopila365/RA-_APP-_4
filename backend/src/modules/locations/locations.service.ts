import { LocationModel, ILocation } from './locations.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface CreateLocationDTO {
  name: string;
  address: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  email?: string;
}

export interface UpdateLocationDTO {
  name?: string;
  address?: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  email?: string;
}

export interface ListLocationsQuery {
  region?: string;
}

class LocationsService {
  /**
   * Create a new location
   */
  async createLocation(dto: CreateLocationDTO): Promise<ILocation> {
    try {
      logger.info('Creating location:', { name: dto.name, region: dto.region });

      const location = await LocationModel.create({
        name: dto.name,
        address: dto.address,
        region: dto.region,
        coordinates: dto.coordinates,
        contactNumber: dto.contactNumber,
        email: dto.email,
      });

      logger.info(`Location created with ID: ${location._id}`);
      return location;
    } catch (error: any) {
      logger.error('Create location error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to create location',
        details: error.message,
      };
    }
  }

  /**
   * List locations with optional filtering by region
   */
  async listLocations(query: ListLocationsQuery = {}): Promise<ILocation[]> {
    try {
      // Build filter
      const filter: any = {};

      // Filter by region if provided
      if (query.region) {
        filter.region = query.region;
      }

      // Execute query ordered by region and name
      const locations = await LocationModel.find(filter)
        .sort({ region: 1, name: 1 })
        .lean();

      return locations as unknown as ILocation[];
    } catch (error: any) {
      logger.error('List locations error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve locations',
        details: error.message,
      };
    }
  }

  /**
   * Get a single location by ID
   */
  async getLocationById(locationId: string): Promise<ILocation> {
    try {
      const location = await LocationModel.findById(locationId).lean();

      if (!location) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Location not found',
        };
      }

      return location as unknown as ILocation;
    } catch (error: any) {
      logger.error('Get location error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve location',
        details: error.message,
      };
    }
  }

  /**
   * Update a location
   */
  async updateLocation(locationId: string, dto: UpdateLocationDTO): Promise<ILocation> {
    try {
      logger.info(`Updating location: ${locationId}`);

      const location = await LocationModel.findByIdAndUpdate(
        locationId,
        dto,
        { new: true, runValidators: true }
      ).lean();

      if (!location) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Location not found',
        };
      }

      logger.info(`Location ${locationId} updated successfully`);
      return location as unknown as ILocation;
    } catch (error: any) {
      logger.error('Update location error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update location',
        details: error.message,
      };
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(locationId: string): Promise<void> {
    try {
      logger.info(`Deleting location: ${locationId}`);

      const location = await LocationModel.findByIdAndDelete(locationId);

      if (!location) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Location not found',
        };
      }

      logger.info(`Location ${locationId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete location error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete location',
        details: error.message,
      };
    }
  }
}

export const locationsService = new LocationsService();
