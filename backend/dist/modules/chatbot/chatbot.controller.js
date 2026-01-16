"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotController = void 0;
const chatbot_service_1 = require("./chatbot.service");
const interactions_service_1 = require("./interactions.service");
const logger_1 = require("../../utils/logger");
const errors_1 = require("../../constants/errors");
const cache_1 = require("../../utils/cache");
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
class ChatbotController {
    /**
     * Handle chatbot query request with streaming
     * POST /api/chatbot/query/stream
     */
    async queryStream(req, res, next) {
        try {
            const { question, sessionId, userLocation } = req.body;
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
            // Validate question length
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
            // Generate sessionId if not provided
            const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const normalizedQuestion = question.trim();
            // Set headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
            // Check if this is a traffic query
            if (chatbot_service_1.chatbotService.isTrafficQuery(normalizedQuestion)) {
                logger_1.logger.info('Traffic query detected, processing traffic status', { question: normalizedQuestion });
                const trafficResponse = await chatbot_service_1.chatbotService.processTrafficQuery(normalizedQuestion);
                const metadata = {
                    type: 'metadata',
                    sources: [],
                    confidence: 1.0,
                    traffic: {
                        congestionLevel: trafficResponse.metadata?.type === 'traffic_status' ? trafficResponse.metadata.congestionLevel : undefined,
                        estimatedDelayMinutes: trafficResponse.metadata?.type === 'traffic_status' ? trafficResponse.metadata.estimatedDelayMinutes : undefined,
                    },
                };
                res.write(`data: ${JSON.stringify(metadata)}\n\n`);
                const words = trafficResponse.answer.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const chunkData = {
                        type: 'chunk',
                        content: words[i] + (i < words.length - 1 ? ' ' : ''),
                    };
                    res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
                }
                const completeData = { type: 'done' };
                res.write(`data: ${JSON.stringify(completeData)}\n\n`);
                interactions_service_1.interactionsService
                    .logInteraction({
                    question: normalizedQuestion,
                    answer: trafficResponse.answer,
                    sessionId: finalSessionId,
                })
                    .then((interaction) => {
                    const interactionData = {
                        type: 'interactionId',
                        interactionId: interaction._id.toString(),
                    };
                    res.write(`data: ${JSON.stringify(interactionData)}\n\n`);
                    logger_1.logger.info('Traffic query interaction logged in stream', {
                        interactionId: interaction._id,
                    });
                })
                    .catch((error) => {
                    logger_1.logger.error('Failed to log traffic query interaction in stream:', error);
                });
                res.end();
                return;
            }
            // Check if this is an incident query
            if (chatbot_service_1.chatbotService.isIncidentQuery(normalizedQuestion)) {
                logger_1.logger.info('Incident query detected, processing incidents', { question: normalizedQuestion });
                const incidentResponse = await chatbot_service_1.chatbotService.processIncidentQuery(normalizedQuestion);
                const metadata = {
                    type: 'metadata',
                    sources: [],
                    confidence: 1.0,
                    incidents: incidentResponse.metadata?.type === 'incident' ? incidentResponse.metadata.incidents : [],
                };
                res.write(`data: ${JSON.stringify(metadata)}\n\n`);
                const words = incidentResponse.answer.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const chunkData = {
                        type: 'chunk',
                        content: words[i] + (i < words.length - 1 ? ' ' : ''),
                    };
                    res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
                }
                const completeData = { type: 'done' };
                res.write(`data: ${JSON.stringify(completeData)}\n\n`);
                interactions_service_1.interactionsService
                    .logInteraction({
                    question: normalizedQuestion,
                    answer: incidentResponse.answer,
                    sessionId: finalSessionId,
                })
                    .then((interaction) => {
                    const interactionData = {
                        type: 'interactionId',
                        interactionId: interaction._id.toString(),
                    };
                    res.write(`data: ${JSON.stringify(interactionData)}\n\n`);
                    logger_1.logger.info('Incident query interaction logged in stream', {
                        interactionId: interaction._id,
                    });
                })
                    .catch((error) => {
                    logger_1.logger.error('Failed to log incident query interaction in stream:', error);
                });
                res.end();
                return;
            }
            // Check if this is a roadworks query
            if (chatbot_service_1.chatbotService.isRoadworkQuery(normalizedQuestion)) {
                logger_1.logger.info('Roadwork query detected, processing roadworks', { question: normalizedQuestion });
                const roadworkResponse = await chatbot_service_1.chatbotService.processRoadworkQuery(normalizedQuestion);
                const metadata = {
                    type: 'metadata',
                    sources: [],
                    confidence: 1.0,
                    roadworks: roadworkResponse.metadata?.type === 'roadwork' ? roadworkResponse.metadata.roadworks : [],
                };
                res.write(`data: ${JSON.stringify(metadata)}\n\n`);
                const words = roadworkResponse.answer.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const chunkData = {
                        type: 'chunk',
                        content: words[i] + (i < words.length - 1 ? ' ' : ''),
                    };
                    res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
                }
                const completeData = { type: 'done' };
                res.write(`data: ${JSON.stringify(completeData)}\n\n`);
                interactions_service_1.interactionsService
                    .logInteraction({
                    question: normalizedQuestion,
                    answer: roadworkResponse.answer,
                    sessionId: finalSessionId,
                })
                    .then((interaction) => {
                    const interactionData = {
                        type: 'interactionId',
                        interactionId: interaction._id.toString(),
                    };
                    res.write(`data: ${JSON.stringify(interactionData)}\n\n`);
                    logger_1.logger.info('Roadwork query interaction logged in stream', {
                        interactionId: interaction._id,
                    });
                })
                    .catch((error) => {
                    logger_1.logger.error('Failed to log roadwork query interaction in stream:', error);
                });
                res.end();
                return;
            }
            // Check if this is a location query
            if (chatbot_service_1.chatbotService.isLocationQuery(normalizedQuestion)) {
                logger_1.logger.info('Location query detected, processing location query', { question: normalizedQuestion });
                // Process location query
                const userLat = userLocation?.latitude;
                const userLon = userLocation?.longitude;
                const locationResponse = await chatbot_service_1.chatbotService.processLocationQuery(userLat, userLon);
                // Stream the location response
                // Send metadata first (empty sources for location query)
                const metadata = {
                    type: 'metadata',
                    sources: [],
                    confidence: 1.0,
                };
                res.write(`data: ${JSON.stringify(metadata)}\n\n`);
                // Stream the answer word by word for natural feel
                const words = locationResponse.answer.split(' ');
                for (let i = 0; i < words.length; i++) {
                    const chunkData = {
                        type: 'chunk',
                        content: words[i] + (i < words.length - 1 ? ' ' : ''),
                    };
                    res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
                }
                // Send completion signal
                const completeData = { type: 'done' };
                res.write(`data: ${JSON.stringify(completeData)}\n\n`);
                // Log interaction asynchronously
                interactions_service_1.interactionsService.logInteraction({
                    question: normalizedQuestion,
                    answer: locationResponse.answer,
                    sessionId: finalSessionId,
                })
                    .then((interaction) => {
                    const interactionData = {
                        type: 'interactionId',
                        interactionId: interaction._id.toString(),
                    };
                    res.write(`data: ${JSON.stringify(interactionData)}\n\n`);
                    logger_1.logger.info('Location query interaction logged in stream', {
                        interactionId: interaction._id,
                    });
                })
                    .catch((error) => {
                    logger_1.logger.error('Failed to log location query interaction in stream:', error);
                });
                res.end();
                return;
            }
            // Forward streaming request to RAG service
            const ragResponse = await axios_1.default.post(`${env_1.env.RAG_SERVICE_URL}/api/query/stream`, { question: normalizedQuestion, top_k: 5 }, {
                responseType: 'stream',
                timeout: 60000, // 60 seconds
            });
            // Intercept the stream to collect answer and log interaction
            let buffer = '';
            let fullAnswer = '';
            let sources = [];
            let streamEnded = false;
            ragResponse.data.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            // Forward all events to client
                            res.write(line + '\n');
                            // Collect answer chunks
                            if (data.type === 'chunk') {
                                fullAnswer += data.content || '';
                            }
                            else if (data.type === 'metadata') {
                                sources = data.sources || [];
                            }
                            else if (data.type === 'complete') {
                                // Handle complete event (no results case)
                                fullAnswer = data.answer || '';
                                sources = data.sources || [];
                            }
                            else if (data.type === 'done') {
                                // Stream is done, log interaction and send interactionId
                                streamEnded = true;
                                // Log interaction asynchronously (don't block the response)
                                interactions_service_1.interactionsService.logInteraction({
                                    question: normalizedQuestion,
                                    answer: fullAnswer,
                                    sessionId: finalSessionId,
                                })
                                    .then((interaction) => {
                                    // Send interactionId after logging
                                    const interactionData = {
                                        type: 'interactionId',
                                        interactionId: interaction._id.toString(),
                                    };
                                    res.write(`data: ${JSON.stringify(interactionData)}\n\n`);
                                    logger_1.logger.info('Interaction logged in stream', {
                                        interactionId: interaction._id,
                                    });
                                })
                                    .catch((error) => {
                                    logger_1.logger.error('Failed to log interaction in stream:', error);
                                    // Don't send error to client, just log it
                                });
                            }
                        }
                        catch (parseError) {
                            // If parsing fails, just forward the line as-is
                            res.write(line + '\n');
                        }
                    }
                    else if (line.trim()) {
                        // Forward non-data lines (like empty lines or comments)
                        res.write(line + '\n');
                    }
                }
            });
            ragResponse.data.on('end', () => {
                if (!streamEnded && fullAnswer) {
                    // If stream ended without 'done' event, log interaction
                    interactions_service_1.interactionsService.logInteraction({
                        question: normalizedQuestion,
                        answer: fullAnswer,
                        sessionId: finalSessionId,
                    })
                        .then((interaction) => {
                        const interactionData = {
                            type: 'interactionId',
                            interactionId: interaction._id.toString(),
                        };
                        res.write(`data: ${JSON.stringify(interactionData)}\n\n`);
                        logger_1.logger.info('Interaction logged in stream (end event)', {
                            interactionId: interaction._id,
                        });
                    })
                        .catch((error) => {
                        logger_1.logger.error('Failed to log interaction in stream (end event):', error);
                    });
                }
                res.end();
            });
            ragResponse.data.on('error', (error) => {
                logger_1.logger.error('RAG streaming error:', error);
                if (!res.headersSent) {
                    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Streaming error occurred' })}\n\n`);
                }
                res.end();
            });
        }
        catch (error) {
            logger_1.logger.error('Chatbot stream controller error:', error);
            if (!res.headersSent) {
                res.status(503).json({
                    success: false,
                    error: {
                        code: errors_1.ERROR_CODES.RAG_SERVICE_UNAVAILABLE,
                        message: 'Failed to stream chatbot response',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        }
    }
    /**
     * Handle chatbot query request
     * POST /api/chatbot/query
     */
    async query(req, res, next) {
        try {
            const { question, sessionId, userLocation } = req.body;
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
            // Generate sessionId if not provided
            const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const normalizedQuestion = question.trim();
            let response;
            let fromCache = false;
            // Check if this is a traffic query
            if (chatbot_service_1.chatbotService.isTrafficQuery(normalizedQuestion)) {
                logger_1.logger.info('Traffic query detected, processing traffic status', { question: normalizedQuestion });
                response = await chatbot_service_1.chatbotService.processTrafficQuery(normalizedQuestion);
            }
            else if (chatbot_service_1.chatbotService.isIncidentQuery(normalizedQuestion)) {
                logger_1.logger.info('Incident query detected, processing incidents', { question: normalizedQuestion });
                response = await chatbot_service_1.chatbotService.processIncidentQuery(normalizedQuestion);
            }
            else if (chatbot_service_1.chatbotService.isRoadworkQuery(normalizedQuestion)) {
                logger_1.logger.info('Roadwork query detected, processing roadworks', { question: normalizedQuestion });
                response = await chatbot_service_1.chatbotService.processRoadworkQuery(normalizedQuestion);
            }
            else if (chatbot_service_1.chatbotService.isLocationQuery(normalizedQuestion)) {
                logger_1.logger.info('Location query detected, processing location query', { question: normalizedQuestion });
                // Process location query (don't cache location queries as they depend on user location)
                const userLat = userLocation?.latitude;
                const userLon = userLocation?.longitude;
                response = await chatbot_service_1.chatbotService.processLocationQuery(userLat, userLon);
            }
            else {
                // Try to get cached response first
                const cachedResponse = await cache_1.cacheService.get('chatbot', normalizedQuestion);
                if (cachedResponse) {
                    logger_1.logger.info('Serving chatbot response from cache', { question: normalizedQuestion.substring(0, 50) });
                    response = { ...cachedResponse };
                    fromCache = true;
                }
                else {
                    // Cache miss - process query
                    const queryRequest = {
                        question: normalizedQuestion,
                        sessionId: finalSessionId,
                    };
                    response = await chatbot_service_1.chatbotService.processQuery(queryRequest);
                    // Cache the response (without interactionId, as it's per-request)
                    // Create a clean response object without interactionId for caching
                    const responseToCache = {
                        answer: response.answer,
                        sources: response.sources,
                        timestamp: response.timestamp,
                    };
                    await cache_1.cacheService.set('chatbot', normalizedQuestion, responseToCache, 3600);
                }
            }
            // Log interaction to database (always log, even for cached responses)
            try {
                const interaction = await interactions_service_1.interactionsService.logInteraction({
                    question: normalizedQuestion,
                    answer: response.answer,
                    sessionId: finalSessionId,
                });
                response.interactionId = interaction._id.toString();
                logger_1.logger.info('Interaction logged successfully', {
                    interactionId: interaction._id,
                    fromCache,
                });
            }
            catch (error) {
                // Log error but don't fail the request - interactionId will be undefined
                logger_1.logger.error('Failed to log interaction:', error);
            }
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