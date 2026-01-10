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
exports.ProcurementOpeningRegisterModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const procurementOpeningRegisterSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['opportunities', 'rfq'],
        required: [true, 'Type is required'],
    },
    reference: {
        type: String,
        required: [true, 'Reference is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Reference cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    bidOpeningDate: {
        type: Date,
        required: [true, 'Bid opening date is required'],
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        required: [true, 'Status is required'],
    },
    noticeUrl: {
        type: String,
        required: [true, 'Notice URL is required'],
        trim: true,
    },
    noticeFileName: {
        type: String,
        required: [true, 'Notice filename is required'],
        trim: true,
    },
    category: {
        type: String,
        enum: ['Consultancy', 'Non-Consultancy', 'Goods', 'Works'],
        trim: true,
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
procurementOpeningRegisterSchema.index({ type: 1 });
procurementOpeningRegisterSchema.index({ status: 1 });
procurementOpeningRegisterSchema.index({ category: 1 });
procurementOpeningRegisterSchema.index({ published: 1 });
procurementOpeningRegisterSchema.index({ reference: 1 });
procurementOpeningRegisterSchema.index({ bidOpeningDate: -1 });
procurementOpeningRegisterSchema.index({ description: 'text', reference: 'text' });
procurementOpeningRegisterSchema.index({ createdAt: -1 });
procurementOpeningRegisterSchema.index({ publishedAt: -1 });
// Automatically set publishedAt when published is set to true
procurementOpeningRegisterSchema.pre('save', function (next) {
    if (this.isModified('published') && this.published && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});
exports.ProcurementOpeningRegisterModel = mongoose_1.default.model('ProcurementOpeningRegister', procurementOpeningRegisterSchema);
//# sourceMappingURL=procurement-opening-register.model.js.map