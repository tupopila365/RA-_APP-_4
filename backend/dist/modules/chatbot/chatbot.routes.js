"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbot_controller_1 = require("./chatbot.controller");
const interactions_routes_1 = __importDefault(require("./interactions.routes"));
const router = (0, express_1.Router)();
/**
 * POST /api/chatbot/query
 * Send a question to the chatbot and receive an AI-generated answer
 * No authentication required - accessible to mobile app users
 */
router.post('/query', chatbot_controller_1.chatbotController.query.bind(chatbot_controller_1.chatbotController));
/**
 * POST /api/chatbot/query/stream
 * Send a question to the chatbot and receive a streaming response
 * No authentication required - accessible to mobile app users
 */
router.post('/query/stream', chatbot_controller_1.chatbotController.queryStream.bind(chatbot_controller_1.chatbotController));
/**
 * GET /api/chatbot/health
 * Check the health status of the chatbot service
 * No authentication required
 */
router.get('/health', chatbot_controller_1.chatbotController.health.bind(chatbot_controller_1.chatbotController));
/**
 * Interactions routes
 * /api/chatbot/interactions/*
 */
router.use('/interactions', interactions_routes_1.default);
exports.default = router;
//# sourceMappingURL=chatbot.routes.js.map