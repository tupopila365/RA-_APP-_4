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
exports.VacancyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const vacancySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Vacancy title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
        type: String,
        required: [true, 'Vacancy type is required'],
        enum: {
            values: ['full-time', 'part-time', 'bursary', 'internship'],
            message: 'Type must be one of: full-time, part-time, bursary, internship',
        },
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    requirements: {
        type: [String],
        required: [true, 'Requirements are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one requirement must be provided',
        },
    },
    responsibilities: {
        type: [String],
        required: [true, 'Responsibilities are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one responsibility must be provided',
        },
    },
    salary: {
        type: String,
        trim: true,
    },
    closingDate: {
        type: Date,
        required: [true, 'Closing date is required'],
        validate: {
            validator: function (v) {
                return v > new Date();
            },
            message: 'Closing date must be in the future',
        },
    },
    pdfUrl: {
        type: String,
        trim: true,
    },
    published: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
vacancySchema.index({ title: 'text', description: 'text' });
vacancySchema.index({ type: 1 });
vacancySchema.index({ department: 1 });
vacancySchema.index({ location: 1 });
vacancySchema.index({ published: 1 });
vacancySchema.index({ closingDate: 1 });
vacancySchema.index({ createdAt: -1 });
exports.VacancyModel = mongoose_1.default.model('Vacancy', vacancySchema);
//# sourceMappingURL=vacancies.model.js.map