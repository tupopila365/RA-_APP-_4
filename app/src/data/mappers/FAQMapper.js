import { BaseMapper } from './BaseMapper';
import { FAQEntity } from '../../domain/entities/FAQEntity';
import {
  parseDate,
  formatDate,
  parseString,
  parseInt,
} from './MapperUtils';

/**
 * FAQ Mapper
 * 
 * Transforms between FAQ DTOs and FAQEntity domain objects.
 */
export class FAQMapper extends BaseMapper {
  /**
   * Convert FAQ DTO to FAQEntity
   * @param {Object} dto - FAQ DTO
   * @returns {FAQEntity}
   */
  toEntity(dto) {
    if (!dto) {
      throw new Error('Cannot map null or undefined DTO to FAQEntity');
    }

    return new FAQEntity({
      id: parseString(dto.id || dto._id), // Use string ID for MongoDB ObjectIds
      question: parseString(dto.question),
      answer: parseString(dto.answer),
      category: parseString(dto.category || '', null),
      order: parseInt(dto.order, 0),
      createdAt: parseDate(dto.createdAt || dto.created_at, null),
      updatedAt: parseDate(dto.updatedAt || dto.updated_at, null),
    });
  }

  /**
   * Convert FAQEntity to DTO
   * @param {FAQEntity} entity - FAQ domain entity
   * @returns {Object}
   */
  toDTO(entity) {
    if (!entity) {
      throw new Error('Cannot map null or undefined entity to DTO');
    }

    return {
      id: entity.id,
      question: entity.question,
      answer: entity.answer,
      category: entity.category,
      order: entity.order,
      created_at: formatDate(entity.createdAt),
      updated_at: formatDate(entity.updatedAt),
    };
  }

  /**
   * Convert array of DTOs to entities with error handling
   * @param {Array} dtos - Array of FAQ DTOs
   * @returns {Array<FAQEntity>}
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
export const faqMapper = new FAQMapper();
