"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middlewares/errorHandler");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/auth/users.routes"));
const documents_routes_1 = __importDefault(require("./modules/documents/documents.routes"));
const news_routes_1 = __importDefault(require("./modules/news/news.routes"));
const vacancies_routes_1 = __importDefault(require("./modules/vacancies/vacancies.routes"));
const tenders_routes_1 = __importDefault(require("./modules/tenders/tenders.routes"));
const banners_routes_1 = __importDefault(require("./modules/banners/banners.routes"));
const locations_routes_1 = __importDefault(require("./modules/locations/locations.routes"));
const chatbot_routes_1 = __importDefault(require("./modules/chatbot/chatbot.routes"));
const upload_routes_1 = __importDefault(require("./modules/upload/upload.routes"));
const createApp = () => {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
        });
    });
    // API Routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/users', users_routes_1.default);
    app.use('/api/documents', documents_routes_1.default);
    app.use('/api/news', news_routes_1.default);
    app.use('/api/vacancies', vacancies_routes_1.default);
    app.use('/api/tenders', tenders_routes_1.default);
    app.use('/api/banners', banners_routes_1.default);
    app.use('/api/locations', locations_routes_1.default);
    app.use('/api/chatbot', chatbot_routes_1.default);
    app.use('/api/upload', upload_routes_1.default);
    // Error handling middleware (must be last)
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
// Export app instance for testing
exports.app = (0, exports.createApp)();
//# sourceMappingURL=app.js.map