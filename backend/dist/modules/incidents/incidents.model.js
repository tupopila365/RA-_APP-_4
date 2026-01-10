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
exports.IncidentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const incidentSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: {
        type: String,
        required: true,
        enum: ['Accident', 'Road closure', 'Hazard', 'Debris', 'Flooding'],
    },
    road: { type: String, required: true, trim: true, maxlength: 50 },
    locationDescription: { type: String, required: true, trim: true, maxlength: 300 },
    area: { type: String, trim: true, maxlength: 120 },
    status: {
        type: String,
        enum: ['Active', 'Cleared'],
        default: 'Active',
        index: true,
    },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    reportedAt: { type: Date, default: () => new Date(), index: true },
    expectedClearance: { type: Date },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    source: {
        type: String,
        enum: ['official'],
        default: 'official',
    },
    createdBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
}, {
    timestamps: true,
});
incidentSchema.index({ road: 1, status: 1, reportedAt: -1 });
incidentSchema.index({ area: 1, status: 1, reportedAt: -1 });
incidentSchema.index({ type: 1, status: 1 });
incidentSchema.index({ locationDescription: 'text', road: 'text', area: 'text' });
exports.IncidentModel = mongoose_1.default.model('Incident', incidentSchema);
//# sourceMappingURL=incidents.model.js.map