"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PotholeReportModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const potholeReportSchema = new mongoose_1.Schema({
    deviceId: {
        type: String,
        required: [true, 'Device ID is required'],
        index: true,
    },
    referenceCode: {
        type: String,
        required: [true, 'Reference code is required'],
        unique: true,
        trim: true,
    },
    location: {
        latitude: {
            type: Number,
            required: [true, 'Latitude is required'],
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90'],
        },
        longitude: {
            type: Number,
            required: [true, 'Longitude is required'],
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180'],
        },
    },
    town: {
        type: String,
        required: [true, 'Town is required'],
        trim: true,
        default: 'Unknown',
    },
    region: {
        type: String,
        required: [true, 'Region is required'],
        trim: true,
        default: 'Unknown',
    },
    roadName: {
        type: String,
        required: [true, 'Road name is required'],
        trim: true,
        maxlength: [200, 'Road name cannot exceed 200 characters'],
    },
    photoUrl: {
        type: String,
        required: [true, 'Photo URL is required'],
        trim: true,
    },
    severity: {
        type: String,
        required: [true, 'Severity is required'],
        enum: ['small', 'medium', 'dangerous'],
        default: 'medium',
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['pending', 'assigned', 'in-progress', 'fixed', 'duplicate', 'invalid'],
        default: 'pending',
        index: true,
    },
    assignedTo: {
        type: String,
        trim: true,
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Admin notes cannot exceed 2000 characters'],
    },
    repairPhotoUrl: {
        type: String,
        trim: true,
    },
    fixedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
potholeReportSchema.index({ deviceId: 1, createdAt: -1 });
potholeReportSchema.index({ status: 1, createdAt: -1 });
potholeReportSchema.index({ region: 1, town: 1 });
potholeReportSchema.index({ createdAt: -1 });
potholeReportSchema.index({ referenceCode: 1 });
// Auto-set fixedAt when status changes to 'fixed'
potholeReportSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'fixed' && !this.fixedAt) {
        this.fixedAt = new Date();
    }
    next();
});
exports.PotholeReportModel = mongoose_1.default.model('PotholeReport', potholeReportSchema);
//# sourceMappingURL=pothole-reports.model.js.map