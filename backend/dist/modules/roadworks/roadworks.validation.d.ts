import { CreateRoadworkDTO, UpdateRoadworkDTO } from './roadworks.service';
/**
 * Validate that coordinates are within Namibia
 */
export declare function validateCoordinatesInNamibia(latitude: number, longitude: number): {
    valid: boolean;
    error?: string;
};
/**
 * Validate that coordinates belong to the selected region
 * Note: This is a soft validation (warning only) because:
 * - Roads can cross region boundaries
 * - Coordinates might be at the edge of a region
 * - The region might be selected based on the main area, not the exact coordinate
 */
export declare function validateCoordinatesInRegion(latitude: number, longitude: number, region: string): {
    valid: boolean;
    error?: string;
    warning?: string;
};
/**
 * Validate date logic
 */
export declare function validateDates(startDate?: Date | string, expectedCompletion?: Date | string, status?: string, published?: boolean): {
    valid: boolean;
    error?: string;
};
/**
 * Comprehensive validation for roadwork creation/update
 */
export declare function validateRoadworkData(dto: CreateRoadworkDTO | UpdateRoadworkDTO, isUpdate?: boolean): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
//# sourceMappingURL=roadworks.validation.d.ts.map