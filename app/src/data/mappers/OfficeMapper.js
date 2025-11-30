import { BaseMapper } from './BaseMapper';
import { OfficeEntity } from '../../domain/entities/OfficeEntity';
import {
  parseDate,
  formatDate,
  parseString,
  parseNumber,
} from './MapperUtils';

/**
 * Office Mapper
 * 
 * Transforms between Office DTOs and OfficeEntity domain objects.
 */
export class OfficeMapper extends BaseMapper {
  /**
   * Convert Office DTO to OfficeEntity
   * @param {Object} dto - Office DTO from API
   * @returns {OfficeEntity}
   */
  toEntity(dto) {
    if (!dto) {
      throw new Error('Cannot map null or undefined DTO to OfficeEntity');
    }

    return new OfficeEntity({
      id: parseString(dto._id || dto.id),
      name: parseString(dto.name),
      address: parseString(dto.address),
      region: parseString(dto.region),
      coordinates: {
        latitude: parseNumber(dto.coordinates?.latitude, 0),
        longitude: parseNumber(dto.coordinates?.longitude, 0),
      },
      contactNumber: parseString(dto.contactNumber || dto.contact_number || '', null),
      email: parseString(dto.email || '', null),
      createdAt: parseDate(dto.createdAt || dto.created_at, null),
      updatedAt: parseDate(dto.updatedAt || dto.updated_at, null),
    });
  }

  /**
   * Convert OfficeEntity to DTO
   * @param {OfficeEntity} entity - Office domain entity
   * @returns {Object}
   */
  toDTO(entity) {
    if (!entity) {
      throw new Error('Cannot map null or undefined entity to DTO');
    }

    return {
      id: entity.id,
      name: entity.name,
      address: entity.address,
      region: entity.region,
      coordinates: entity.coordinates,
      contact_number: entity.contactNumber,
      email: entity.email,
      created_at: formatDate(entity.createdAt),
      updated_at: formatDate(entity.updatedAt),
    };
  }

  /**
   * Convert array of DTOs to entities with error handling
   * @param {Array} dtos - Array of office DTOs
   * @returns {Array<OfficeEntity>}
   */
  toEntityList(dtos) {
    if (!Array.isArray(dtos)) {
      return [];
    }

    return this.safeToEntityList(dtos);
  }
}

/**
 * Singleton instance
 */
export const officeMapper = new OfficeMapper();
