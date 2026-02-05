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
exports.PLN = void 0;
const typeorm_1 = require("typeorm");
let PLN = class PLN {
};
exports.PLN = PLN;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PLN.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], PLN.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: '12345' }),
    __metadata("design:type", String)
], PLN.prototype, "trackingPin", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'New Personalised Licence Number' }),
    __metadata("design:type", String)
], PLN.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50 }),
    __metadata("design:type", String)
], PLN.prototype, "idType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "trafficRegisterNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "businessRegNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], PLN.prototype, "surname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], PLN.prototype, "initials", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], PLN.prototype, "postalAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], PLN.prototype, "streetAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "telephoneHome", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "telephoneDay", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "cellNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "trafficRegisterNumber_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "businessRegNumber_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], PLN.prototype, "surname_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], PLN.prototype, "initials_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "businessName_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "email_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "trafficRegisterNumber_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "businessRegNumber_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], PLN.prototype, "surname_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "email_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "idNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "fullName_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "idNumber_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "phoneNumber_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "fullName_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "idNumber_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 30 }),
    __metadata("design:type", String)
], PLN.prototype, "plateFormat", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], PLN.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Array)
], PLN.prototype, "plateChoices", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PLN.prototype, "hasRepresentative", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "representativeIdType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "representativeIdNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "representativeSurname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "representativeInitials", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PLN.prototype, "hasVehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "currentLicenceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "vehicleRegisterNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "chassisNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "vehicleMake", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "seriesName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PLN.prototype, "declarationAccepted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], PLN.prototype, "declarationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], PLN.prototype, "declarationPlace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "declarationRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000 }),
    __metadata("design:type", String)
], PLN.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 30, default: 'SUBMITTED' }),
    __metadata("design:type", String)
], PLN.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { default: '[]' }),
    __metadata("design:type", Array)
], PLN.prototype, "statusHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "adminComments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "paymentDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "paymentReceivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, default: 'NORMAL' }),
    __metadata("design:type", String)
], PLN.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "paymentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "plateOrderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "plateSupplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "plateOrderedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "plateDeliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "plateCollectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", Object)
], PLN.prototype, "plateCollectedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PLN.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PLN.prototype, "updatedAt", void 0);
exports.PLN = PLN = __decorate([
    (0, typeorm_1.Entity)('plns'),
    (0, typeorm_1.Index)(['referenceId'], { unique: true }),
    (0, typeorm_1.Index)(['status', 'createdAt']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['assignedTo']),
    (0, typeorm_1.Index)(['priority']),
    (0, typeorm_1.Index)(['surname']),
    (0, typeorm_1.Index)(['businessName']),
    (0, typeorm_1.Index)(['email'])
], PLN);
//# sourceMappingURL=pln.entity.js.map