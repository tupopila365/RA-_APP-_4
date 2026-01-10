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
const faqs_routes_1 = __importDefault(require("./modules/faqs/faqs.routes"));
const pothole_reports_routes_1 = __importDefault(require("./modules/pothole-reports/pothole-reports.routes"));
const notifications_routes_1 = __importDefault(require("./modules/notifications/notifications.routes"));
const pln_routes_1 = __importDefault(require("./modules/pln/pln.routes"));
const app_users_routes_1 = __importDefault(require("./modules/app-users/app-users.routes"));
const traffic_routes_1 = __importDefault(require("./modules/traffic/traffic.routes"));
const incidents_routes_1 = __importDefault(require("./modules/incidents/incidents.routes"));
const roadworks_routes_1 = __importDefault(require("./modules/roadworks/roadworks.routes"));
const procurement_legislation_routes_1 = __importDefault(require("./modules/procurement-legislation/procurement-legislation.routes"));
const procurement_plan_routes_1 = __importDefault(require("./modules/procurement-plan/procurement-plan.routes"));
const procurement_awards_routes_1 = __importDefault(require("./modules/procurement-awards/procurement-awards.routes"));
const procurement_opening_register_routes_1 = __importDefault(require("./modules/procurement-opening-register/procurement-opening-register.routes"));
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
    app.use('/api/faqs', faqs_routes_1.default);
    app.use('/api/pothole-reports', pothole_reports_routes_1.default);
    app.use('/api/notifications', notifications_routes_1.default);
    app.use('/api/pln', pln_routes_1.default);
    app.use('/api/app-users', app_users_routes_1.default);
    app.use('/api/traffic', traffic_routes_1.default);
    app.use('/api/incidents', incidents_routes_1.default);
    app.use('/api/roadworks', roadworks_routes_1.default);
    app.use('/api/procurement-legislation', procurement_legislation_routes_1.default);
    app.use('/api/procurement-plan', procurement_plan_routes_1.default);
    app.use('/api/procurement-awards', procurement_awards_routes_1.default);
    app.use('/api/procurement-opening-register', procurement_opening_register_routes_1.default);
    // Error handling middleware (must be last)
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
// Export app instance for testing
exports.app = (0, exports.createApp)();
//# sourceMappingURL=app.js.map