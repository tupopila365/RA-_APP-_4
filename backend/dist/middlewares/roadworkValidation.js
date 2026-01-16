"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoadworkUpdate = exports.validateRoadworkCreate = void 0;
const errors_1 = require("../constants/errors");
const NAMIBIAN_REGIONS = [
    'Erongo',
    'Hardap',
    'ǁKaras',
    'Kavango East',
    'Kavango West',
    'Khomas',
    'Kunene',
    'Ohangwena',
    'Omaheke',
    'Omusati',
    'Oshana',
    'Oshikoto',
    'Otjozondjupa',
    'Zambezi',
];
const VALID_STATUSES = [
    'Open',
    'Ongoing',
    'Ongoing Maintenance',
    'Planned',
    'Planned Works',
    'Closed',
    'Restricted',
    'Completed'
];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
// Namibia approximate bounds
const NAMIBIA_BOUNDS = {
    minLat: -29.0,
    maxLat: -16.5,
    minLng: 11.5,
    maxLng: 25.5,
};
const validateRoadworkCreate = (req, res, next) => {
    const { title, road, section, region, status, coordinates, priority } = req.body;
    const errors = [];
    // Required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    }
    else if (title.length > 200) {
        errors.push('Title must be 200 characters or less');
    }
    if (!road || typeof road !== 'string' || road.trim().length === 0) {
        errors.push('Road is required and must be a non-empty string');
    }
    else if (road.length > 50) {
        errors.push('Road must be 50 characters or less');
    }
    if (!section || typeof section !== 'string' || section.trim().length === 0) {
        errors.push('Section is required and must be a non-empty string');
    }
    else if (section.length > 300) {
        errors.push('Section must be 300 characters or less');
    }
    if (!region || typeof region !== 'string' || region.trim().length === 0) {
        errors.push('Region is required and must be a non-empty string');
    }
    else if (!NAMIBIAN_REGIONS.includes(region)) {
        errors.push(`Region must be one of: ${NAMIBIAN_REGIONS.join(', ')}`);
    }
    // Optional field validations
    if (status && !VALID_STATUSES.includes(status)) {
        errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
        errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
    // Coordinates validation
    if (coordinates) {
        if (typeof coordinates !== 'object' || coordinates === null) {
            errors.push('Coordinates must be an object');
        }
        else {
            const { latitude, longitude } = coordinates;
            if (typeof latitude !== 'number' || isNaN(latitude)) {
                errors.push('Latitude must be a valid number');
            }
            else if (latitude < NAMIBIA_BOUNDS.minLat || latitude > NAMIBIA_BOUNDS.maxLat) {
                errors.push(`Latitude must be within Namibia bounds (${NAMIBIA_BOUNDS.minLat} to ${NAMIBIA_BOUNDS.maxLat})`);
            }
            if (typeof longitude !== 'number' || isNaN(longitude)) {
                errors.push('Longitude must be a valid number');
            }
            else if (longitude < NAMIBIA_BOUNDS.minLng || longitude > NAMIBIA_BOUNDS.maxLng) {
                errors.push(`Longitude must be within Namibia bounds (${NAMIBIA_BOUNDS.minLng} to ${NAMIBIA_BOUNDS.maxLng})`);
            }
        }
    }
    // Date validations
    if (req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        if (isNaN(startDate.getTime())) {
            errors.push('Start date must be a valid date');
        }
    }
    if (req.body.endDate) {
        const endDate = new Date(req.body.endDate);
        if (isNaN(endDate.getTime())) {
            errors.push('End date must be a valid date');
        }
    }
    if (req.body.expectedCompletion) {
        const expectedCompletion = new Date(req.body.expectedCompletion);
        if (isNaN(expectedCompletion.getTime())) {
            errors.push('Expected completion date must be a valid date');
        }
    }
    // Date range validation
    if (req.body.startDate && req.body.endDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        if (startDate >= endDate) {
            errors.push('End date must be after start date');
        }
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    next();
};
exports.validateRoadworkCreate = validateRoadworkCreate;
const validateRoadworkUpdate = (req, res, next) => {
    const { title, road, section, region, status, coordinates, priority } = req.body;
    const errors = [];
    // Optional field validations (since it's an update)
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
            errors.push('Title must be a non-empty string');
        }
        else if (title.length > 200) {
            errors.push('Title must be 200 characters or less');
        }
    }
    if (road !== undefined) {
        if (typeof road !== 'string' || road.trim().length === 0) {
            errors.push('Road must be a non-empty string');
        }
        else if (road.length > 50) {
            errors.push('Road must be 50 characters or less');
        }
    }
    if (section !== undefined) {
        if (typeof section !== 'string' || section.trim().length === 0) {
            errors.push('Section must be a non-empty string');
        }
        else if (section.length > 300) {
            errors.push('Section must be 300 characters or less');
        }
    }
    if (region !== undefined) {
        if (typeof region !== 'string' || region.trim().length === 0) {
            errors.push('Region must be a non-empty string');
        }
        else if (!NAMIBIAN_REGIONS.includes(region)) {
            errors.push(`Region must be one of: ${NAMIBIAN_REGIONS.join(', ')}`);
        }
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
        errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
    // Coordinates validation
    if (coordinates !== undefined) {
        if (coordinates === null) {
            // Allow null to clear coordinates
        }
        else if (typeof coordinates !== 'object') {
            errors.push('Coordinates must be an object or null');
        }
        else {
            const { latitude, longitude } = coordinates;
            if (typeof latitude !== 'number' || isNaN(latitude)) {
                errors.push('Latitude must be a valid number');
            }
            else if (latitude < NAMIBIA_BOUNDS.minLat || latitude > NAMIBIA_BOUNDS.maxLat) {
                errors.push(`Latitude must be within Namibia bounds (${NAMIBIA_BOUNDS.minLat} to ${NAMIBIA_BOUNDS.maxLat})`);
            }
            if (typeof longitude !== 'number' || isNaN(longitude)) {
                errors.push('Longitude must be a valid number');
            }
            else if (longitude < NAMIBIA_BOUNDS.minLng || longitude > NAMIBIA_BOUNDS.maxLng) {
                errors.push(`Longitude must be within Namibia bounds (${NAMIBIA_BOUNDS.minLng} to ${NAMIBIA_BOUNDS.maxLng})`);
            }
        }
    }
    // Date validations
    if (req.body.startDate !== undefined) {
        const startDate = new Date(req.body.startDate);
        if (isNaN(startDate.getTime())) {
            errors.push('Start date must be a valid date');
        }
    }
    if (req.body.endDate !== undefined) {
        const endDate = new Date(req.body.endDate);
        if (isNaN(endDate.getTime())) {
            errors.push('End date must be a valid date');
        }
    }
    if (req.body.expectedCompletion !== undefined) {
        const expectedCompletion = new Date(req.body.expectedCompletion);
        if (isNaN(expectedCompletion.getTime())) {
            errors.push('Expected completion date must be a valid date');
        }
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            code: errors_1.ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    next();
};
exports.validateRoadworkUpdate = validateRoadworkUpdate;
//# sourceMappingURL=roadworkValidation.js.map