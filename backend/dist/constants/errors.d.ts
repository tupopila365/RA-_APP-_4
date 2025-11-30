export declare const ERROR_CODES: {
    readonly AUTH_INVALID_CREDENTIALS: "AUTH_001";
    readonly AUTH_TOKEN_EXPIRED: "AUTH_002";
    readonly AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_003";
    readonly AUTH_INVALID_TOKEN: "AUTH_004";
    readonly AUTH_MISSING_TOKEN: "AUTH_005";
    readonly AUTH_UNAUTHORIZED: "AUTH_006";
    readonly VALIDATION_ERROR: "VALIDATION_001";
    readonly VALIDATION_INVALID_INPUT: "VALIDATION_002";
    readonly UPLOAD_FAILED: "UPLOAD_001";
    readonly UPLOAD_INVALID_FILE_TYPE: "UPLOAD_002";
    readonly UPLOAD_FILE_TOO_LARGE: "UPLOAD_003";
    readonly UPLOAD_ERROR: "UPLOAD_004";
    readonly DB_OPERATION_FAILED: "DB_001";
    readonly DB_CONNECTION_ERROR: "DB_002";
    readonly DUPLICATE_ERROR: "DB_003";
    readonly RAG_SERVICE_UNAVAILABLE: "RAG_001";
    readonly RAG_INDEXING_FAILED: "RAG_002";
    readonly RAG_QUERY_FAILED: "RAG_003";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly SERVER_ERROR: "SERVER_ERROR";
    readonly BAD_REQUEST: "BAD_REQUEST";
};
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export declare const ERROR_MESSAGES: Record<ErrorCode, string>;
//# sourceMappingURL=errors.d.ts.map