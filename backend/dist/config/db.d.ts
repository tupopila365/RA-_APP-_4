import 'reflect-metadata';
import { DataSource } from 'typeorm';
declare const sql: any;
/** Reusable MSSQL connection pool. Uses msnodesqlv8 (trusted connection) or tedious (SQL auth). */
export declare let sqlPool: InstanceType<typeof sql.ConnectionPool> | null;
export declare const AppDataSource: DataSource;
export declare const connectDB: () => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
export {};
//# sourceMappingURL=db.d.ts.map