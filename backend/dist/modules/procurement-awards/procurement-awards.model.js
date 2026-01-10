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
exports.ProcurementAwardModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const executiveSummarySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Executive summary title is required'],
        trim: true,
        maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    url: {
        type: String,
        required: [true, 'Executive summary URL is required'],
        trim: true,
    },
    fileName: {
        type: String,
        required: [true, 'Executive summary filename is required'],
        trim: true,
    },
}, { _id: false });
const procurementAwardSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['opportunities', 'rfq'],
        required: [true, 'Type is required'],
    },
    procurementReference: {
        type: String,
        required: [true, 'Procurement reference is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Procurement reference cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    executiveSummary: {
        type: executiveSummarySchema,
        required: [true, 'Executive summary is required'],
    },
    successfulBidder: {
        type: String,
        required: [true, 'Successful bidder is required'],
        trim: true,
        maxlength: [500, 'Successful bidder cannot exceed 500 characters'],
    },
    dateAwarded: {
        type: Date,
        required: [true, 'Date awarded is required'],
    },
    published: {
        type: Boolean,
        default: false,
    },
    publishedAt: {
        type: Date,
    },
    createdBy: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
procurementAwardSchema.index({ type: 1 });
procurementAwardSchema.index({ published: 1 });
procurementAwardSchema.index({ procurementReference: 1 });
procurementAwardSchema.index({ dateAwarded: -1 });
procurementAwardSchema.index({ description: 'text', procurementReference: 'text', successfulBidder: 'text' });
procurementAwardSchema.index({ createdAt: -1 });
procurementAwardSchema.index({ publishedAt: -1 });
// Automatically set publishedAt when published is set to true
procurementAwardSchema.pre('save', function (next) {
    if (this.isModified('published') && this.published && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
exports.ProcurementAwardModel = mongoose_1.default.model('ProcurementAward', procurementAwardSchema);
//# sourceMappingURL=procurement-awards.model.js.map