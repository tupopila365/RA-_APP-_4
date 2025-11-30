interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD?: string;
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRY: string;
    JWT_REFRESH_EXPIRY: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    RAG_SERVICE_URL: string;
    CORS_ORIGIN: string;
}
export declare const env: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map