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
exports.ChatbotInteraction = void 0;
const typeorm_1 = require("typeorm");
let ChatbotInteraction = class ChatbotInteraction {
};
exports.ChatbotInteraction = ChatbotInteraction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatbotInteraction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 'MAX' }),
    __metadata("design:type", String)
], ChatbotInteraction.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)('nvarchar', { length: 'MAX' }),
    __metadata("design:type", String)
], ChatbotInteraction.prototype, "answer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], ChatbotInteraction.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1000, nullable: true }),
    __metadata("design:type", Object)
], ChatbotInteraction.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], ChatbotInteraction.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], ChatbotInteraction.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'general' }),
    __metadata("design:type", String)
], ChatbotInteraction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatbotInteraction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatbotInteraction.prototype, "updatedAt", void 0);
exports.ChatbotInteraction = ChatbotInteraction = __decorate([
    (0, typeorm_1.Entity)('chatbot_interactions'),
    (0, typeorm_1.Index)(['timestamp']),
    (0, typeorm_1.Index)(['feedback']),
    (0, typeorm_1.Index)(['category']),
    (0, typeorm_1.Index)(['sessionId']),
    (0, typeorm_1.Index)(['createdAt'])
], ChatbotInteraction);
//# sourceMappingURL=interactions.entity.js.map