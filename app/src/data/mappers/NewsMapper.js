import { BaseMapper } from './BaseMapper';
import { NewsEntity } from '../../domain/entities/NewsEntity';
import {
  parseDate,
  formatDate,
  parseString,
  parseInt,
  parseBoolean,
  parseArray,
} from './MapperUtils';

/**
 * News Mapper
 * 
 * Transforms between News DTOs (from API) and NewsEntity domain objects.
 * Handles data validation, type conversion, and field mapping.
 * 
 * @example
 * const mapper = new NewsMapper();
 * const entity = mapper.toEntity(apiResponse);
 * const dto = mapper.toDTO(entity);
 */
export class NewsMapper extends BaseMapper {
  /**
   * Convert News DTO to NewsEntity
   * @param {Object} dto - News DTO from API
   * @returns {NewsEntity} News domain entity
   */
  toEntity(dto) {
    if (!dto) {
      throw new Error('Cannot map null or undefined DTO to NewsEntity');
    }

    return new NewsEntity({
      id: parseString(dto.id || dto._id), // Use string ID for MongoDB ObjectIds
      title: parseString(dto.title),
      content: parseString(dto.content || dto.body || ''),
      excerpt: parseString(dto.excerpt || dto.summary || ''),
      imageUrl: parseString(dto.imageUrl || dto.image_url || dto.image || '', null),
      category: parseString(dto.category || '', null),
      publishedAt: parseDate(dto.publishedAt || dto.published_at || dto.createdAt, new Date()),
      updatedAt: parseDate(dto.updatedAt || dto.updated_at, null),
      published: parseBoolean(dto.published, true),
      author: parseString(dto.author || '', null),
      tags: parseArray(dto.tags || dto.keywords || []),
    });
  }

  /**
   * Convert NewsEntity to DTO
   * @param {NewsEntity} entity - News domain entity
   * @returns {Object} News DTO for API
   */
  toDTO(entity) {
    if (!entity) {
      throw new Error('Cannot map null or undefined entity to DTO');
    }

    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      excerpt: entity.excerpt,
      image_url: entity.imageUrl,
      category: entity.category,
      published_at: formatDate(entity.publishedAt),
      updated_at: formatDate(entity.updatedAt),
      published: entity.published,
      author: entity.author,
      tags: entity.tags,
    };
  }

  /**
   * Convert array of DTOs to entities with error handling
   * @param {Array} dtos - Array of news DTOs
   * @returns {Array<NewsEntity>} Array of news entities
   */
  toEntityList(dtos) {
    if (!Array.isArray(dtos)) {
      return [];
    }

    // Use safe conversion to filter out invalid entries
    return this.safeToEntityList(dtos);
  }
}

/**
 * Singleton instance for convenience
 */
export const newsMapper = new NewsMapper();
