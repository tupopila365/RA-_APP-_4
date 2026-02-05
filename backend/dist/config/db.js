"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = exports.AppDataSource = exports.sqlPool = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const trustServerCert = env_1.env.DB_TRUST_SERVER_CERTIFICATE ?? true;
const useTrustedConnection = !!env_1.env.DB_TRUSTED_CONNECTION;
const sqlAuthUser = env_1.env.DB_USER?.trim() || undefined;
const sqlAuthPassword = env_1.env.DB_PASSWORD || undefined;
// Use msnodesqlv8 ONLY when Windows auth is enabled; otherwise tedious (SQL auth)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sql = useTrustedConnection ? require('mssql/msnodesqlv8') : require('mssql');
logger_1.logger.info(`DB auth mode: ${useTrustedConnection ? 'Windows (trusted connection, msnodesqlv8)' : 'SQL Authentication (tedious)'}`);
/** Reusable MSSQL connection pool. Uses msnodesqlv8 (trusted connection) or tedious (SQL auth). */
exports.sqlPool = null;
const tlsOptions = {
    encrypt: true,
    trustServerCertificate: trustServerCert,
    enableArithAbort: true,
};
const mssqlConfig = useTrustedConnection
    ? {
        server: env_1.env.DB_HOST,
        port: env_1.env.DB_PORT,
        database: env_1.env.DB_NAME,
        driver: 'msnodesqlv8',
        options: {
            trustedConnection: true,
            ...tlsOptions,
        },
    }
    : {
        server: env_1.env.DB_HOST,
        port: env_1.env.DB_PORT,
        database: env_1.env.DB_NAME,
        ...(sqlAuthUser != null && { user: sqlAuthUser }),
        ...(sqlAuthPassword != null && { password: sqlAuthPassword }),
        options: tlsOptions,
    };
// Entity imports - added as entities are created
const auth_entity_1 = require("../modules/auth/auth.entity");
const app_users_entity_1 = require("../modules/app-users/app-users.entity");
const banners_entity_1 = require("../modules/banners/banners.entity");
const interactions_entity_1 = require("../modules/chatbot/interactions.entity");
const documents_entity_1 = require("../modules/documents/documents.entity");
const faqs_entity_1 = require("../modules/faqs/faqs.entity");
const forms_entity_1 = require("../modules/forms/forms.entity");
const incidents_entity_1 = require("../modules/incidents/incidents.entity");
const locations_entity_1 = require("../modules/locations/locations.entity");
const news_entity_1 = require("../modules/news/news.entity");
const notifications_entity_1 = require("../modules/notifications/notifications.entity");
const pln_entity_1 = require("../modules/pln/pln.entity");
const pothole_reports_entity_1 = require("../modules/pothole-reports/pothole-reports.entity");
const procurement_awards_entity_1 = require("../modules/procurement-awards/procurement-awards.entity");
const procurement_legislation_entity_1 = require("../modules/procurement-legislation/procurement-legislation.entity");
const procurement_opening_register_entity_1 = require("../modules/procurement-opening-register/procurement-opening-register.entity");
const procurement_plan_entity_1 = require("../modules/procurement-plan/procurement-plan.entity");
const roadworks_entity_1 = require("../modules/roadworks/roadworks.entity");
const tenders_entity_1 = require("../modules/tenders/tenders.entity");
const vacancies_entity_1 = require("../modules/vacancies/vacancies.entity");
const vehicle_reg_entity_1 = require("../modules/vehicle-reg/vehicle-reg.entity");
const entities = [
    auth_entity_1.User,
    app_users_entity_1.AppUser,
    banners_entity_1.Banner,
    interactions_entity_1.ChatbotInteraction,
    documents_entity_1.Document,
    faqs_entity_1.FAQ,
    forms_entity_1.Form,
    incidents_entity_1.Incident,
    locations_entity_1.Location,
    news_entity_1.News,
    notifications_entity_1.PushToken,
    notifications_entity_1.NotificationLog,
    pln_entity_1.PLN,
    pothole_reports_entity_1.PotholeReport,
    procurement_awards_entity_1.ProcurementAward,
    procurement_legislation_entity_1.ProcurementLegislation,
    procurement_opening_register_entity_1.ProcurementOpeningRegister,
    procurement_plan_entity_1.ProcurementPlan,
    roadworks_entity_1.Roadwork,
    tenders_entity_1.Tender,
    vacancies_entity_1.Vacancy,
    vehicle_reg_entity_1.VehicleReg,
];
const typeormBaseOptions = {
    type: 'mssql',
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    database: env_1.env.DB_NAME,
    ...(useTrustedConnection
        ? {}
        : {
            username: sqlAuthUser,
            password: sqlAuthPassword,
        }),
    options: tlsOptions,
    entities,
    synchronize: env_1.env.NODE_ENV !== 'production',
    logging: env_1.env.NODE_ENV === 'development',
};
const typeormOptions = useTrustedConnection
    ? {
        ...typeormBaseOptions,
        extra: {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            driver: require('mssql/msnodesqlv8'),
            options: {
                trustedConnection: true,
                ...tlsOptions,
            },
        },
    }
    : typeormBaseOptions;
exports.AppDataSource = new typeorm_1.DataSource(typeormOptions);
const connectDB = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            const authMode = useTrustedConnection ? 'Windows Auth (trusted)' : 'SQL Auth';
            logger_1.logger.info(`SQL Server Connected: ${env_1.env.DB_HOST}:${env_1.env.DB_PORT}/${env_1.env.DB_NAME} (${authMode})`);
        }
        if (!exports.sqlPool) {
            const pool = new sql.ConnectionPool(mssqlConfig);
            await pool.connect();
            exports.sqlPool = pool;
            logger_1.logger.info(`MSSQL connection pool ready (${useTrustedConnection ? 'msnodesqlv8/trusted' : 'tedious'})`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error connecting to SQL Server:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        if (exports.sqlPool) {
            await exports.sqlPool.close();
            exports.sqlPool = null;
            logger_1.logger.info('MSSQL connection pool closed');
        }
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
            logger_1.logger.info('SQL Server connection closed');
        }
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from SQL Server:', error);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=db.js.map