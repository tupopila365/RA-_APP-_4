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
exports.PotholeReport = void 0;
const typeorm_1 = require("typeorm");
let PotholeReport = class PotholeReport {
};
exports.PotholeReport = PotholeReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PotholeReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PotholeReport.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "userEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], PotholeReport.prototype, "referenceCode", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], PotholeReport.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PotholeReport.prototype, "town", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PotholeReport.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], PotholeReport.prototype, "roadName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000 }),
    __metadata("design:type", String)
], PotholeReport.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1000, nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, default: 'pending' }),
    __metadata("design:type", String)
], PotholeReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "adminNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2000, nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "repairPhotoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PotholeReport.prototype, "fixedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PotholeReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PotholeReport.prototype, "updatedAt", void 0);
exports.PotholeReport = PotholeReport = __decorate([
    (0, typeorm_1.Entity)('pothole_reports'),
    (0, typeorm_1.Index)(['deviceId', 'createdAt']),
    (0, typeorm_1.Index)(['userEmail', 'createdAt']),
    (0, typeorm_1.Index)(['status', 'createdAt']),
    (0, typeorm_1.Index)(['region', 'town']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['referenceCode'], { unique: true })
], PotholeReport);
//# sourceMappingURL=pothole-reports.entity.js.map