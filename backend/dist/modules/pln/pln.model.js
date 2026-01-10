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
exports.PLNModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const statusHistorySchema = new mongoose_1.Schema({
    status: {
        type: String,
        required: true,
        enum: [
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'DECLINED',
            'PAYMENT_PENDING',
            'PAID',
            'PLATES_ORDERED',
            'READY_FOR_COLLECTION',
            'EXPIRED',
        ],
    },
    changedBy: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    },
    comment: {
        type: String,
        trim: true,
    },
}, { _id: false });
const plateChoiceSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: [true, 'Plate text is required'],
        trim: true,
        maxlength: [7, 'Plate text cannot exceed 7 characters'],
        uppercase: true,
    },
    meaning: {
        type: String,
        required: [true, 'Plate meaning is required'],
        trim: true,
        maxlength: [500, 'Meaning cannot exceed 500 characters'],
    },
}, { _id: false });
const addressSchema = new mongoose_1.Schema({
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    line3: { type: String, trim: true },
}, { _id: false });
const phoneNumberSchema = new mongoose_1.Schema({
    code: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
}, { _id: false });
const plnSchema = new mongoose_1.Schema({
    referenceId: {
        type: String,
        required: [true, 'Reference ID is required'],
        unique: true,
        trim: true,
        index: true,
    },
    transactionType: {
        type: String,
        default: 'New Personalised Licence Number',
        trim: true,
    },
    // Section A
    idType: {
        type: String,
        required: [true, 'ID type is required'],
        enum: ['Traffic Register Number', 'Namibia ID-doc', 'Business Reg. No'],
    },
    trafficRegisterNumber: {
        type: String,
        trim: true,
    },
    businessRegNumber: {
        type: String,
        trim: true,
    },
    surname: {
        type: String,
        required: [true, 'Surname is required'],
        trim: true,
        maxlength: [100, 'Surname cannot exceed 100 characters'],
    },
    initials: {
        type: String,
        required: [true, 'Initials are required'],
        trim: true,
        maxlength: [10, 'Initials cannot exceed 10 characters'],
    },
    businessName: {
        type: String,
        trim: true,
        maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    postalAddress: {
        type: addressSchema,
        required: [true, 'Postal address is required'],
    },
    streetAddress: {
        type: addressSchema,
        required: [true, 'Street address is required'],
    },
    telephoneHome: {
        type: phoneNumberSchema,
    },
    telephoneDay: {
        type: phoneNumberSchema,
    },
    cellNumber: {
        type: phoneNumberSchema,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [200, 'Email cannot exceed 200 characters'],
    },
    // Legacy fields (for backward compatibility)
    fullName: {
        type: String,
        trim: true,
        maxlength: [200, 'Full name cannot exceed 200 characters'],
    },
    idNumber: {
        type: String,
        trim: true,
        index: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    // Section B
    plateFormat: {
        type: String,
        required: [true, 'Plate format is required'],
        enum: ['Long/German', 'Normal', 'American', 'Square', 'Small motorcycle'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        enum: [1, 2],
    },
    plateChoices: {
        type: [plateChoiceSchema],
        required: [true, 'Plate choices are required'],
        validate: {
            validator: (choices) => choices.length === 3,
            message: 'Exactly 3 plate choices are required',
        },
    },
    // Section C
    hasRepresentative: {
        type: Boolean,
        default: false,
    },
    representativeIdType: {
        type: String,
        enum: ['Traffic Register Number', 'Namibia ID-doc'],
    },
    representativeIdNumber: {
        type: String,
        trim: true,
    },
    representativeSurname: {
        type: String,
        trim: true,
        maxlength: [100, 'Representative surname cannot exceed 100 characters'],
    },
    representativeInitials: {
        type: String,
        trim: true,
        maxlength: [10, 'Representative initials cannot exceed 10 characters'],
    },
    // Section D
    currentLicenceNumber: {
        type: String,
        trim: true,
        maxlength: [20, 'Current licence number cannot exceed 20 characters'],
    },
    vehicleRegisterNumber: {
        type: String,
        trim: true,
        maxlength: [20, 'Vehicle register number cannot exceed 20 characters'],
    },
    chassisNumber: {
        type: String,
        trim: true,
        maxlength: [30, 'Chassis number cannot exceed 30 characters'],
    },
    vehicleMake: {
        type: String,
        trim: true,
        maxlength: [100, 'Vehicle make cannot exceed 100 characters'],
    },
    seriesName: {
        type: String,
        trim: true,
        maxlength: [100, 'Series name cannot exceed 100 characters'],
    },
    // Section E
    declarationAccepted: {
        type: Boolean,
        required: [true, 'Declaration acceptance is required'],
        default: false,
    },
    declarationDate: {
        type: Date,
        required: [true, 'Declaration date is required'],
        default: Date.now,
    },
    declarationPlace: {
        type: String,
        required: [true, 'Declaration place is required'],
        trim: true,
        maxlength: [100, 'Declaration place cannot exceed 100 characters'],
    },
    declarationRole: {
        type: String,
        enum: ['applicant', 'proxy', 'representative'],
        default: 'applicant',
    },
    // Document and status
    documentUrl: {
        type: String,
        required: [true, 'Document URL is required'],
        trim: true,
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: [
            'SUBMITTED',
            'UNDER_REVIEW',
            'APPROVED',
            'DECLINED',
            'PAYMENT_PENDING',
            'PAID',
            'PLATES_ORDERED',
            'READY_FOR_COLLECTION',
            'EXPIRED',
        ],
        default: 'SUBMITTED',
        index: true,
    },
    statusHistory: {
        type: [statusHistorySchema],
        default: [],
    },
    adminComments: {
        type: String,
        trim: true,
        maxlength: [2000, 'Admin comments cannot exceed 2000 characters'],
    },
    paymentDeadline: {
        type: Date,
    },
    paymentReceivedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
plnSchema.index({ referenceId: 1 });
plnSchema.index({ idNumber: 1 });
plnSchema.index({ status: 1, createdAt: -1 });
plnSchema.index({ createdAt: -1 });
plnSchema.index({ 'plateChoices.text': 1 });
// Auto-compute legacy fields for backward compatibility
plnSchema.pre('save', function (next) {
    // Compute fullName from surname + initials
    if (this.surname && this.initials && !this.fullName) {
        this.fullName = `${this.surname} ${this.initials}`.trim();
    }
    // Compute idNumber based on idType
    if (!this.idNumber) {
        if (this.idType === 'Traffic Register Number' && this.trafficRegisterNumber) {
            this.idNumber = this.trafficRegisterNumber;
        }
        else if (this.idType === 'Namibia ID-doc' && this.trafficRegisterNumber) {
            this.idNumber = this.trafficRegisterNumber;
        }
        else if (this.idType === 'Business Reg. No' && this.businessRegNumber) {
            this.idNumber = this.businessRegNumber;
        }
    }
    // Compute phoneNumber from cellNumber or telephoneDay
    if (!this.phoneNumber) {
        if (this.cellNumber) {
            this.phoneNumber = `${this.cellNumber.code}${this.cellNumber.number}`;
        }
        else if (this.telephoneDay) {
            this.phoneNumber = `${this.telephoneDay.code}${this.telephoneDay.number}`;
        }
        else if (this.telephoneHome) {
            this.phoneNumber = `${this.telephoneHome.code}${this.telephoneHome.number}`;
        }
    }
    // Auto-add initial status to history on creation
    if (this.isNew && this.statusHistory.length === 0) {
        this.statusHistory.push({
            status: this.status,
            changedBy: 'System',
            timestamp: new Date(),
            comment: 'Application submitted',
        });
    }
    next();
});
exports.PLNModel = mongoose_1.default.model('PLN', plnSchema);
//# sourceMappingURL=pln.model.js.map