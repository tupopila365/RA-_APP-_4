"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoordinatesInNamibia = validateCoordinatesInNamibia;
exports.validateCoordinatesInRegion = validateCoordinatesInRegion;
exports.validateDates = validateDates;
exports.validateRoadworkData = validateRoadworkData;
const logger_1 = require("../../utils/logger");
// Namibia's approximate bounding box
const NAMIBIA_BOUNDS = {
    minLat: -28.0,
    maxLat: -16.0,
    minLon: 11.0,
    maxLon: 26.0
};
// Regional boundaries (approximate centers and radius for validation)
const REGIONAL_BOUNDARIES = {
    'Khomas': { center: { lat: -22.57, lon: 17.08 }, radiusKm: 150 },
    'Erongo': { center: { lat: -22.35, lon: 14.97 }, radiusKm: 200 },
    'Hardap': { center: { lat: -24.63, lon: 17.91 }, radiusKm: 200 },
    'ǁKaras': { center: { lat: -26.64, lon: 17.09 }, radiusKm: 250 },
    'Kavango East': { center: { lat: -18.08, lon: 20.52 }, radiusKm: 150 },
    'Kavango West': { center: { lat: -18.42, lon: 18.65 }, radiusKm: 150 },
    'Kunene': { center: { lat: -19.57, lon: 14.52 }, radiusKm: 250 },
    'Ohangwena': { center: { lat: -17.60, lon: 16.23 }, radiusKm: 100 },
    'Omaheke': { center: { lat: -21.70, lon: 19.50 }, radiusKm: 200 },
    'Omusati': { center: { lat: -18.25, lon: 14.98 }, radiusKm: 100 },
    'Oshana': { center: { lat: -18.42, lon: 15.92 }, radiusKm: 80 },
    'Oshikoto': { center: { lat: -18.85, lon: 17.05 }, radiusKm: 120 },
    'Otjozondjupa': { center: { lat: -20.46, lon: 17.42 }, radiusKm: 250 },
    'Zambezi': { center: { lat: -17.80, lon: 24.27 }, radiusKm: 150 }
};
/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Validate that coordinates are within Namibia
 */
function validateCoordinatesInNamibia(latitude, longitude) {
    if (latitude < NAMIBIA_BOUNDS.minLat ||
        latitude > NAMIBIA_BOUNDS.maxLat ||
        longitude < NAMIBIA_BOUNDS.minLon ||
        longitude > NAMIBIA_BOUNDS.maxLon) {
        return {
            valid: false,
            error: `Coordinates are outside Namibia. Latitude must be between ${NAMIBIA_BOUNDS.minLat} and ${NAMIBIA_BOUNDS.maxLat}, Longitude must be between ${NAMIBIA_BOUNDS.minLon} and ${NAMIBIA_BOUNDS.maxLon}. Please verify location.`
        };
    }
    return { valid: true };
}
/**
 * Validate that coordinates belong to the selected region
 */
function validateCoordinatesInRegion(latitude, longitude, region) {
    const regionalBounds = REGIONAL_BOUNDARIES[region];
    if (!regionalBounds) {
        logger_1.logger.warn(`No boundary data for region: ${region}`);
        return {
            valid: true,
            warning: `Could not verify coordinates for region "${region}" - no boundary data available`
        };
    }
    const distance = calculateDistance(latitude, longitude, regionalBounds.center.lat, regionalBounds.center.lon);
    if (distance > regionalBounds.radiusKm) {
        return {
            valid: false,
            error: `Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) are ${distance.toFixed(1)}km from ${region} region center. This location appears to be outside the selected region.`
        };
    }
    return { valid: true };
}
/**
 * Validate date logic
 */
function validateDates(startDate, expectedCompletion, status, published) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for comparison
    // Convert string dates to Date objects
    const start = startDate ? new Date(startDate) : undefined;
    const completion = expectedCompletion ? new Date(expectedCompletion) : undefined;
    // Validate: Start date ≤ Expected completion
    if (start && completion) {
        if (start > completion) {
            return {
                valid: false,
                error: 'Start date cannot be after expected completion date'
            };
        }
    }
    // Validate: Planned jobs cannot be published if start date is in the past
    if (published && (status === 'Planned' || status === 'Planned Works')) {
        if (start && start < now) {
            return {
                valid: false,
                error: 'Planned roadworks with a past start date cannot be published. Please update the start date or change the status.'
            };
        }
    }
    return { valid: true };
}
/**
 * Comprehensive validation for roadwork creation/update
 */
function validateRoadworkData(dto, isUpdate = false) {
    const errors = [];
    const warnings = [];
    // Required fields validation (only for create)
    if (!isUpdate) {
        if (!dto.title || !dto.title.trim()) {
            errors.push('Title is required');
        }
        if (!dto.road || !dto.road.trim()) {
            errors.push('Road name is required');
        }
        if (!dto.area || !dto.area.trim()) {
            errors.push('Area/Town is required');
        }
        if (!dto.region) {
            errors.push('Region is required');
        }
    }
    // Date validation
    const dateValidation = validateDates(dto.startDate, dto.expectedCompletion, dto.status, dto.published);
    if (!dateValidation.valid && dateValidation.error) {
        errors.push(dateValidation.error);
    }
    // Coordinates validation (if provided)
    if (dto.coordinates) {
        const { latitude, longitude } = dto.coordinates;
        // Validate coordinate format
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            errors.push('Coordinates must be valid numbers');
        }
        else if (isNaN(latitude) || isNaN(longitude)) {
            errors.push('Coordinates contain invalid values');
        }
        else {
            // Check if coordinates are in Namibia
            const namibiaCheck = validateCoordinatesInNamibia(latitude, longitude);
            if (!namibiaCheck.valid && namibiaCheck.error) {
                errors.push(namibiaCheck.error);
            }
            else {
                // Check if coordinates match the selected region
                if (dto.region) {
                    const regionCheck = validateCoordinatesInRegion(latitude, longitude, dto.region);
                    if (!regionCheck.valid && regionCheck.error) {
                        errors.push(regionCheck.error);
                    }
                    if (regionCheck.warning) {
                        warnings.push(regionCheck.warning);
                    }
                }
            }
        }
    }
    // Critical status validation
    const criticalStatuses = ['Closed', 'Restricted'];
    if (dto.status && criticalStatuses.includes(dto.status)) {
        if (!dto.coordinates || !dto.coordinates.latitude || !dto.coordinates.longitude) {
            errors.push(`GPS coordinates are required for ${dto.status} roads`);
        }
    }
    // Published validation
    if (dto.published) {
        if (!dto.coordinates) {
            warnings.push('Publishing roadwork without GPS coordinates may reduce visibility on maps');
        }
        if (!dto.startDate) {
            warnings.push('Publishing roadwork without a start date may confuse users');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
//# sourceMappingURL=roadworks.validation.js.map