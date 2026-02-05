"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleReg = void 0;
const typeorm_1 = require("typeorm");
let VehicleReg = class VehicleReg {
};
exports.VehicleReg = VehicleReg;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VehicleReg.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], VehicleReg.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: '12345' }),
    __metadata("design:type", String)
], VehicleReg.prototype, "trackingPin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "idType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "identificationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "personType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "surname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "initials", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], VehicleReg.prototype, "postalAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], VehicleReg.prototype, "streetAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "telephoneDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleReg.prototype, "hasProxy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "proxyIdType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "proxyIdNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "proxySurname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "proxyInitials", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleReg.prototype, "hasRepresentative", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "representativeIdType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "representativeIdNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "representativeSurname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "representativeInitials", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], VehicleReg.prototype, "declarationAccepted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], VehicleReg.prototype, "declarationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "declarationPlace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "declarationRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "declarationSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "make", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "seriesName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "vehicleCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "drivenType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "vehicleDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "netPower", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "engineCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "fuelTypeOther", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "totalMass", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "grossVehicleMass", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "maxPermissibleVehicleMass", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "maxPermissibleDrawingMass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "transmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "mainColour", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "mainColourOther", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "usedForTransportation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "economicSector", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "odometerReading", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "odometerReadingKm", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "vehicleStreetAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "ownershipType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], VehicleReg.prototype, "usedOnPublicRoad", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "chassisNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "engineNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "feesPaidRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "receiptNumberRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "feesPaidLicensing", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "receiptNumberLicensing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "roadWorthinessCompliant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "roadWorthinessTestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "roadWorthinessCertificateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "registrationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "policeClearanceSubmitted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "transactionEffectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "firstLicensingLiabilityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "registrationCertificateControlNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "vehicleStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000 }),
    __metadata("design:type", String)
], VehicleReg.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, default: 'SUBMITTED' }),
    __metadata("design:type", String)
], VehicleReg.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { default: '[]' }),
    __metadata("design:type", Array)
], VehicleReg.prototype, "statusHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "adminComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "paymentDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "paymentReceivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, default: 'NORMAL' }),
    __metadata("design:type", String)
], VehicleReg.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "paymentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "registrationNumberAssigned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "registrationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], VehicleReg.prototype, "registrationCertificateUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VehicleReg.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VehicleReg.prototype, "updatedAt", void 0);
exports.VehicleReg = VehicleReg = __decorate([
    (0, typeorm_1.Entity)('vehicle_regs'),
    (0, typeorm_1.Index)(['referenceId'], { unique: true }),
    (0, typeorm_1.Index)(['status', 'createdAt']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['assignedTo']),
    (0, typeorm_1.Index)(['priority']),
    (0, typeorm_1.Index)(['surname']),
    (0, typeorm_1.Index)(['businessName']),
    (0, typeorm_1.Index)(['make']),
    (0, typeorm_1.Index)(['chassisNumber'])
], VehicleReg);
//# sourceMappingURL=vehicle-reg.entity.js.map