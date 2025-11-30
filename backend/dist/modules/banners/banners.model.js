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
exports.BannerModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bannerSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Banner title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
        type: String,
        required: [true, 'Banner image URL is required'],
        trim: true,
    },
    linkUrl: {
        type: String,
        trim: true,
    },
    order: {
        type: Number,
        required: [true, 'Banner order is required'],
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Index for efficient queries
bannerSchema.index({ order: 1 });
bannerSchema.index({ active: 1 });
bannerSchema.index({ createdAt: -1 });
exports.BannerModel = mongoose_1.default.model('Banner', bannerSchema);
//# sourceMappingURL=banners.model.js.map