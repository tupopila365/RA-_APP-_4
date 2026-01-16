"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntivirusService = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AntivirusService {
    /**
     * Scan file for malware using external antivirus service
     */
    static async scanFile(filePath) {
        const startTime = Date.now();
        try {
            // Ensure quarantine directory exists
            await this.ensureQuarantineDir();
            // If no antivirus service configured, use basic scanning
            if (!env_1.env.ANTIVIRUS_API_URL || !env_1.env.ANTIVIRUS_API_KEY) {
                return await this.basicScan(filePath);
            }
            // Read file for scanning
            const fileBuffer = await fs.readFile(filePath);
            const fileName = path.basename(filePath);
            // Create form data for API
            const formData = new FormData();
            formData.append('file', new Blob([fileBuffer]), fileName);
            formData.append('scan_type', 'comprehensive');
            // Send to antivirus service
            const response = await axios_1.default.post(`${env_1.env.ANTIVIRUS_API_URL}/scan`, formData, {
                headers: {
                    'Authorization': `Bearer ${env_1.env.ANTIVIRUS_API_KEY}`,
                    'Content-Type': 'multipart/form-data',
                },
                timeout: this.TIMEOUT,
            });
            const result = {
                isClean: response.data.status === 'clean',
                threats: response.data.threats || [],
                scanId: response.data.scan_id,
                scanTime: Date.now() - startTime,
            };
            // Log scan result
            logger_1.logger.info('Antivirus scan completed', {
                fileName,
                isClean: result.isClean,
                threats: result.threats,
                scanTime: result.scanTime,
                scanId: result.scanId,
            });
            // Quarantine infected files
            if (!result.isClean) {
                await this.quarantineFile(filePath, result);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Antivirus scan failed', {
                filePath,
                error: error.message,
                scanTime: Date.now() - startTime,
            });
            // On scan failure, use basic scanning as fallback
            return await this.basicScan(filePath);
        }
    }
    /**
     * Basic malware scanning (fallback)
     */
    static async basicScan(filePath) {
        try {
            const buffer = await fs.readFile(filePath);
            const content = buffer.toString('utf8', 0, Math.min(buffer.length, 2048));
            // Enhanced malware patterns
            const maliciousPatterns = [
                // Script injection
                /<script[^>]*>/i,
                /javascript:/i,
                /vbscript:/i,
                /data:text\/html/i,
                // Event handlers
                /on\w+\s*=/i,
                // Dangerous functions
                /eval\s*\(/i,
                /document\.write/i,
                /window\.location/i,
                /innerHTML\s*=/i,
                // Suspicious executables
                /MZ\x90\x00\x03/, // PE header
                /\x7fELF/, // ELF header
                // Macro indicators
                /Auto_Open/i,
                /Workbook_Open/i,
                /Document_Open/i,
                // Suspicious URLs
                /https?:\/\/[^\s]*\.(tk|ml|ga|cf)/i,
            ];
            const threats = maliciousPatterns
                .filter(pattern => pattern.test(content))
                .map((_, index) => `Pattern_${index + 1}`);
            return {
                isClean: threats.length === 0,
                threats,
                scanId: `basic_${Date.now()}`,
                scanTime: 0,
            };
        }
        catch (error) {
            logger_1.logger.error('Basic scan failed', { filePath, error: error.message });
            // If we can't scan, assume it's infected for safety
            return {
                isClean: false,
                threats: ['SCAN_ERROR'],
                scanId: `error_${Date.now()}`,
                scanTime: 0,
            };
        }
    }
    /**
     * Quarantine infected file
     */
    static async quarantineFile(filePath, scanResult) {
        if (!env_1.env.FILE_QUARANTINE_ENABLED) {
            return;
        }
        try {
            const fileName = path.basename(filePath);
            const quarantinePath = path.join(this.QUARANTINE_DIR, `${Date.now()}_${scanResult.scanId}_${fileName}`);
            // Move file to quarantine
            await fs.rename(filePath, quarantinePath);
            // Create metadata file
            const metadataPath = `${quarantinePath}.meta`;
            const metadata = {
                originalPath: filePath,
                quarantineTime: new Date().toISOString(),
                scanResult,
                threats: scanResult.threats,
            };
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            logger_1.logger.warn('File quarantined', {
                originalPath: filePath,
                quarantinePath,
                threats: scanResult.threats,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to quarantine file', {
                filePath,
                error: error.message,
            });
        }
    }
    /**
     * Ensure quarantine directory exists
     */
    static async ensureQuarantineDir() {
        try {
            await fs.access(this.QUARANTINE_DIR);
        }
        catch {
            await fs.mkdir(this.QUARANTINE_DIR, { recursive: true });
        }
    }
    /**
     * Clean up old quarantine files
     */
    static async cleanupQuarantine(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
        try {
            const files = await fs.readdir(this.QUARANTINE_DIR);
            const now = Date.now();
            for (const file of files) {
                const filePath = path.join(this.QUARANTINE_DIR, file);
                const stats = await fs.stat(filePath);
                if (now - stats.mtime.getTime() > maxAgeMs) {
                    await fs.unlink(filePath);
                    logger_1.logger.info('Cleaned up old quarantine file', { file });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Quarantine cleanup failed', { error: error.message });
        }
    }
}
exports.AntivirusService = AntivirusService;
AntivirusService.TIMEOUT = 30000; // 30 seconds
AntivirusService.QUARANTINE_DIR = path.join(process.cwd(), 'quarantine');
//# sourceMappingURL=antivirusService.js.map