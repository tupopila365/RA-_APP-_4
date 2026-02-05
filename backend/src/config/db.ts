import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { logger } from '../utils/logger';

const trustServerCert = env.DB_TRUST_SERVER_CERTIFICATE ?? true;
const useTrustedConnection = !!env.DB_TRUSTED_CONNECTION;

const sqlAuthUser = env.DB_USER?.trim() || undefined;
const sqlAuthPassword = env.DB_PASSWORD || undefined;

// Use msnodesqlv8 ONLY when Windows auth is enabled; otherwise tedious (SQL auth)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sql = useTrustedConnection ? require('mssql/msnodesqlv8') : require('mssql');

logger.info(`DB auth mode: ${useTrustedConnection ? 'Windows (trusted connection, msnodesqlv8)' : 'SQL Authentication (tedious)'}`);

/** Reusable MSSQL connection pool. Uses msnodesqlv8 (trusted connection) or tedious (SQL auth). */
export let sqlPool: InstanceType<typeof sql.ConnectionPool> | null = null;

const tlsOptions = {
  encrypt: true,
  trustServerCertificate: trustServerCert,
  enableArithAbort: true,
};

// Connection string for msnodesqlv8 - matches TypeORM's working config (TrustServerCertificate required for self-signed certs)
const mssqlConnectionString = useTrustedConnection
  ? `Driver={SQL Server Native Client 11.0};Server=${env.DB_HOST},${env.DB_PORT};Database=${env.DB_NAME};Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;`
  : undefined;

const mssqlConfig = useTrustedConnection
  ? {
      connectionString: mssqlConnectionString,
      options: tlsOptions,
    }
  : {
      server: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      ...(sqlAuthUser != null && { user: sqlAuthUser }),
      ...(sqlAuthPassword != null && { password: sqlAuthPassword }),
      options: tlsOptions,
    };

// Entity imports - added as entities are created
import { User } from '../modules/auth/auth.entity';
import { AppUser } from '../modules/app-users/app-users.entity';
import { Banner } from '../modules/banners/banners.entity';
import { ChatbotInteraction } from '../modules/chatbot/interactions.entity';
import { Document } from '../modules/documents/documents.entity';
import { FAQ } from '../modules/faqs/faqs.entity';
import { Form } from '../modules/forms/forms.entity';
import { Incident } from '../modules/incidents/incidents.entity';
import { Location } from '../modules/locations/locations.entity';
import { News } from '../modules/news/news.entity';
import { PushToken, NotificationLog } from '../modules/notifications/notifications.entity';
import { PLN } from '../modules/pln/pln.entity';
import { PotholeReport } from '../modules/pothole-reports/pothole-reports.entity';
import { ProcurementAward } from '../modules/procurement-awards/procurement-awards.entity';
import { ProcurementLegislation } from '../modules/procurement-legislation/procurement-legislation.entity';
import { ProcurementOpeningRegister } from '../modules/procurement-opening-register/procurement-opening-register.entity';
import { ProcurementPlan } from '../modules/procurement-plan/procurement-plan.entity';
import { Roadwork } from '../modules/roadworks/roadworks.entity';
import { Tender } from '../modules/tenders/tenders.entity';
import { Vacancy } from '../modules/vacancies/vacancies.entity';
import { VehicleReg } from '../modules/vehicle-reg/vehicle-reg.entity';
import { RAService } from '../modules/ra-services/ra-services.entity';
import { FileStorage } from '../modules/file-storage/file-storage.entity';

const entities = [
  User,
  AppUser,
  Banner,
  ChatbotInteraction,
  Document,
  FAQ,
  Form,
  Incident,
  Location,
  News,
  PushToken,
  NotificationLog,
  PLN,
  PotholeReport,
  ProcurementAward,
  ProcurementLegislation,
  ProcurementOpeningRegister,
  ProcurementPlan,
  Roadwork,
  Tender,
  Vacancy,
  VehicleReg,
  RAService,
  FileStorage,
];

const typeormBaseOptions = {
  type: 'mssql' as const,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  ...(useTrustedConnection
    ? {}
    : {
        username: sqlAuthUser,
        password: sqlAuthPassword,
      }),
  options: tlsOptions,
  entities,
  synchronize: env.NODE_ENV !== 'production',
  logging: env.NODE_ENV === 'development',
};

const typeormOptions = useTrustedConnection
  ? {
      ...typeormBaseOptions,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      driver: require('mssql/msnodesqlv8'),
      // Use the connection string to force the driver to use the correct settings
      extra: {
        connectionString: `Driver={SQL Server Native Client 11.0};Server=${env.DB_HOST},${env.DB_PORT};Database=${env.DB_NAME};Trusted_Connection=yes;Encrypt=yes;TrustServerCertificate=yes;`,
      },
    }
  : typeormBaseOptions;

export const AppDataSource = new DataSource(typeormOptions);

export const connectDB = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      const authMode = useTrustedConnection ? 'Windows Auth (trusted)' : 'SQL Auth';
      logger.info(`SQL Server Connected: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME} (${authMode})`);
    }
    if (!sqlPool) {
      const pool = new sql.ConnectionPool(mssqlConfig);
      await pool.connect();
      sqlPool = pool;
      logger.info(`MSSQL connection pool ready (${useTrustedConnection ? 'msnodesqlv8/trusted' : 'tedious'})`);
    }
  } catch (error: unknown) {
    const err = error as Error & { info?: Record<string, unknown>; originalError?: unknown };
    let details = err.message;
    if (details === '[object Object]' || !details) {
      const orig = err.originalError;
      const arr = Array.isArray(orig) ? orig : orig ? [orig] : [];
      const msgs = arr.map((e: unknown) => {
        const o = e as Record<string, unknown>;
        return String(o?.message ?? o?.code ?? o?.sqlstate ?? JSON.stringify(o));
      });
      details = msgs.length ? msgs.join('; ') : (typeof error === 'object' && error !== null ? JSON.stringify(error, null, 2) : String(error));
    }
    if (err.info) details += ` | info: ${JSON.stringify(err.info)}`;
    logger.error(`Error connecting to SQL Server: ${details}`, { stack: err.stack });
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (sqlPool) {
      await sqlPool.close();
      sqlPool = null;
      logger.info('MSSQL connection pool closed');
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('SQL Server connection closed');
    }
  } catch (error) {
    logger.error('Error disconnecting from SQL Server:', error);
  }
};
