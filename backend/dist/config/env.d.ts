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
    CLOUDINARY_PDF_ACCESS_MODE?: 'public' | 'signed';
    CLOUDINARY_SIGNED_URL_EXPIRY?: number;
    GOOGLE_DRIVE_CLIENT_ID?: string;
    GOOGLE_DRIVE_CLIENT_SECRET?: string;
    GOOGLE_DRIVE_REDIRECT_URI?: string;
    GOOGLE_DRIVE_REFRESH_TOKEN?: string;
    GOOGLE_DRIVE_FOLDER_ID?: string;
    RAG_SERVICE_URL: string;
    CORS_ORIGIN: string;
    GEOCODING_API_KEY?: string;
    GEOCODING_SERVICE?: 'nominatim' | 'google';
}
export declare const env: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map