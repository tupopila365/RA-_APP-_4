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
exports.NotificationLogModel = exports.PushTokenModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PushTokenSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    pushToken: {
        type: String,
        required: true,
        unique: true,
    },
    platform: {
        type: String,
        enum: ['ios', 'android'],
        required: true,
    },
    deviceInfo: {
        brand: String,
        modelName: String,
        osName: String,
        osVersion: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastUsed: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Index for efficient queries
PushTokenSchema.index({ pushToken: 1 });
PushTokenSchema.index({ userId: 1 });
PushTokenSchema.index({ active: 1 });
exports.PushTokenModel = mongoose_1.default.model('PushToken', PushTokenSchema);
const NotificationLogSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    data: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    recipients: [{
            type: String,
        }],
    sentCount: {
        type: Number,
        default: 0,
    },
    failedCount: {
        type: Number,
        default: 0,
    },
    type: {
        type: String,
        enum: ['news', 'tender', 'vacancy', 'general'],
        required: true,
    },
    relatedId: {
        type: String,
    },
    sentBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Index for efficient queries
NotificationLogSchema.index({ type: 1, sentAt: -1 });
NotificationLogSchema.index({ relatedId: 1 });
exports.NotificationLogModel = mongoose_1.default.model('NotificationLog', NotificationLogSchema);
//# sourceMappingURL=notifications.model.js.map