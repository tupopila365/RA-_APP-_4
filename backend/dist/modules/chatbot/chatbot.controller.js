"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotController = void 0;
const chatbot_service_1 = require("./chatbot.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
class ChatbotController {
    /**
     * Handle chatbot query request
     * POST /api/chatbot/query
     */
    async query(req, res, next) {
        try {
            const { question, sessionId } = req.body;
            // Validate input
            if (!question || typeof question !== 'string' || question.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_INVALID_INPUT,
                        message: 'Question is required and must be a non-empty string',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Validate question length (max 1000 characters)
            if (question.length > 1000) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.VALIDATION_INVALID_INPUT,
                        message: 'Question must not exceed 1000 characters',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const queryRequest = {
                question: question.trim(),
                sessionId,
            };
            // Process query through chatbot service
            const response = await chatbot_service_1.chatbotService.processQuery(queryRequest);
            res.status(200).json({
                success: true,
                data: response,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Chatbot query controller error:', error);
            next(error);
        }
    }
    /**
     * Health check endpoint for chatbot service
     * GET /api/chatbot/health
     */
    async health(_req, res, next) {
        try {
            const healthStatus = await chatbot_service_1.chatbotService.healthCheck();
            const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json({
                success: healthStatus.status === 'healthy',
                data: healthStatus,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Chatbot health check controller error:', error);
            next(error);
        }
    }
}
exports.chatbotController = new ChatbotController();
//# sourceMappingURL=chatbot.controller.js.map