import { AppDataSource } from '../../config/db';
import { Location } from './locations.entity';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';
import { calculateDistance } from '../../utils/distance';

export interface CreateLocationDTO {
  name: string;
  address: string;
  region: string;
  coordinates: { latitude: number; longitude: number };
  contactNumber?: string;
  email?: string;
  services?: string[];
  operatingHours?: Record<string, unknown>;
  closedDays?: string[];
  specialHours?: Array<{ date: string; reason: string; closed: boolean; hours?: { open: string; close: string } }>;
}

export interface UpdateLocationDTO {
  name?: string;
  address?: string;
  region?: string;
  coordinates?: { latitude: number; longitude: number };
  contactNumber?: string;
  email?: string;
  services?: string[];
  operatingHours?: Record<string, unknown>;
  closedDays?: string[];
  specialHours?: Array<{ date: string; reason: string; closed: boolean; hours?: { open: string; close: string } }>;
}

export interface ListLocationsQuery {
  region?: string;
}

class LocationsService {
  async createLocation(dto: CreateLocationDTO): Promise<Location> {
    try {
      logger.info('Creating location:', { name: dto.name, region: dto.region });
      const repo = AppDataSource.getRepository(Location);
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
      logger.info(`Location created with ID: ${location.id}`);
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

  async listLocations(query: ListLocationsQuery = {}): Promise<Location[]> {
    try {
      const repo = AppDataSource.getRepository(Location);
      const where: any = {};
      if (query.region) where.region = query.region;
      const locations = await repo.find({
        where,
        order: { region: 'ASC', name: 'ASC' },
      });
      return locations;
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

  async getLocationById(locationId: string): Promise<Location> {
    try {
      const id = parseInt(locationId, 10);
      const repo = AppDataSource.getRepository(Location);
      const location = await repo.findOne({ where: { id } });
      if (!location) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Location not found' };
      }
      return location;
    } catch (error: any) {
      logger.error('Get location error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve location',
        details: error.message,
      };
    }
  }

  async updateLocation(locationId: string, dto: UpdateLocationDTO): Promise<Location> {
    try {
      logger.info(`Updating location: ${locationId}`);
      const id = parseInt(locationId, 10);
      const repo = AppDataSource.getRepository(Location);
      const location = await repo.findOne({ where: { id } });
      if (!location) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Location not found' };
      }
      Object.assign(location, dto);
      await repo.save(location);
      logger.info(`Location ${locationId} updated successfully`);
      return location;
    } catch (error: any) {
      logger.error('Update location error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update location',
        details: error.message,
      };
    }
  }

  async deleteLocation(locationId: string): Promise<void> {
    try {
      logger.info(`Deleting location: ${locationId}`);
      const id = parseInt(locationId, 10);
      const repo = AppDataSource.getRepository(Location);
      const location = await repo.findOne({ where: { id } });
      if (!location) {
        throw { statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: 'Location not found' };
      }
      await repo.remove(location);
      logger.info(`Location ${locationId} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete location error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to delete location',
        details: error.message,
      };
    }
  }

  async findNearestOffices(
    latitude: number,
    longitude: number,
    limit: number = 5
  ): Promise<Array<Location & { distance: number }>> {
    try {
      logger.info('Finding nearest offices', { latitude, longitude, limit });
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
      const repo = AppDataSource.getRepository(Location);
      const offices = await repo.find({});
      const officesWithDistance = offices.map((office) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          office.coordinates.latitude,
          office.coordinates.longitude
        );
        return { ...office, distance };
      });
      officesWithDistance.sort((a, b) => a.distance - b.distance);
      const result = officesWithDistance.slice(0, limit);
      logger.info(`Found ${result.length} nearest offices`);
      return result;
    } catch (error: any) {
      logger.error('Find nearest offices error:', error);
      if (error.statusCode) throw error;
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
