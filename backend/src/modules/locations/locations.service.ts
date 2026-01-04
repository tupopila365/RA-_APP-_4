import { LocationModel, ILocation } from './locations.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { calculateDistance } from '../../utils/distance';

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

  /**
   * Find nearest offices to a given location
   * 
   * @param latitude - User's latitude
   * @param longitude - User's longitude
   * @param limit - Maximum number of offices to return (default: 5)
   * @returns Array of offices with distance in kilometers, sorted by distance
   */
  async findNearestOffices(
    latitude: number,
    longitude: number,
    limit: number = 5
  ): Promise<Array<ILocation & { distance: number }>> {
    try {
      logger.info('Finding nearest offices', { latitude, longitude, limit });

      // Validate coordinates
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid coordinates provided',
        };
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw {
          statusCode: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Coordinates out of valid range',
        };
      }

      // Retrieve all offices from database
      const offices = await LocationModel.find({}).lean();

      // Calculate distance for each office and add to result
      const officesWithDistance = offices.map((office) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          office.coordinates.latitude,
          office.coordinates.longitude
        );

        return {
          ...office,
          distance,
        } as ILocation & { distance: number };
      });

      // Sort by distance (ascending)
      officesWithDistance.sort((a, b) => a.distance - b.distance);

      // Return top N offices
      const result = officesWithDistance.slice(0, limit);

      logger.info(`Found ${result.length} nearest offices`);
      return result as unknown as Array<ILocation & { distance: number }>;
    } catch (error: any) {
      logger.error('Find nearest offices error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to find nearest offices',
        details: error.message,
      };
    }
  }
}

export const locationsService = new LocationsService();
