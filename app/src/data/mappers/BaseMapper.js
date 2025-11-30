/**
 * Base Mapper Interface
 * 
 * Defines the contract for mapping between DTOs and domain entities.
 */
export class BaseMapper {
  toEntity(dto) {
    throw new Error('toEntity method must be implemented by subclass');
  }

  toDTO(entity) {
    throw new Error('toDTO method must be implemented by subclass');
  }

  toEntityList(dtos) {
    if (!Array.isArray(dtos)) {
      return [];
    }
    return dtos.map(dto => this.toEntity(dto));
  }

  toDTOList(entities) {
    if (!Array.isArray(entities)) {
      return [];
    }
    return entities.map(entity => this.toDTO(entity));
  }

  safeToEntity(dto) {
    try {
      return this.toEntity(dto);
    } catch (error) {
      console.warn('Failed to convert DTO to entity:', error);
      return null;
    }
  }

  safeToDTO(entity) {
    try {
      return this.toDTO(entity);
    } catch (error) {
      console.warn('Failed to convert entity to DTO:', error);
      return null;
    }
  }

  safeToEntityList(dtos) {
    if (!Array.isArray(dtos)) {
      return [];
    }
    return dtos
      .map(dto => this.safeToEntity(dto))
      .filter(entity => entity !== null);
  }

  safeToDTOList(entities) {
    if (!Array.isArray(entities)) {
      return [];
    }
    return entities
      .map(entity => this.safeToDTO(entity))
      .filter(dto => dto !== null);
  }
}
