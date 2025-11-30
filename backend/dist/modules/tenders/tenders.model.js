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
exports.TenderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tenderSchema = new mongoose_1.Schema({
    referenceNumber: {
        type: String,
        required: [true, 'Reference number is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Reference number cannot exceed 50 characters'],
    },
    title: {
        type: String,
        required: [true, 'Tender title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    value: {
        type: Number,
        min: [0, 'Value cannot be negative'],
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['open', 'closed', 'upcoming'],
            message: 'Status must be one of: open, closed, upcoming',
        },
    },
    openingDate: {
        type: Date,
        required: [true, 'Opening date is required'],
    },
    closingDate: {
        type: Date,
        required: [true, 'Closing date is required'],
        validate: {
            validator: function (v) {
                return v > this.openingDate;
            },
            message: 'Closing date must be after opening date',
        },
    },
    pdfUrl: {
        type: String,
        required: [true, 'PDF document URL is required'],
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
tenderSchema.index({ referenceNumber: 1 });
tenderSchema.index({ title: 'text', description: 'text' });
tenderSchema.index({ status: 1 });
tenderSchema.index({ category: 1 });
tenderSchema.index({ published: 1 });
tenderSchema.index({ closingDate: 1 });
tenderSchema.index({ openingDate: 1 });
tenderSchema.index({ createdAt: -1 });
exports.TenderModel = mongoose_1.default.model('Tender', tenderSchema);
//# sourceMappingURL=tenders.model.js.map