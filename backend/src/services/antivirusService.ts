import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ScanResult {
  isClean: boolean;
  threats: string[];
  scanId: string;
  scanTime: number;
}

export class AntivirusService {
  private static readonly TIMEOUT = 30000; // 30 seconds
  private static readonly QUARANTINE_DIR = path.join(process.cwd(), 'quarantine');

  /**
   * Scan file for malware using external antivirus service
   */
  static async scanFile(filePath: string): Promise<ScanResult> {
    const startTime = Date.now();
    
    try {
      // Ensure quarantine directory exists
      await this.ensureQuarantineDir();

      // If no antivirus service configured, use basic scanning
      if (!env.ANTIVIRUS_API_URL || !env.ANTIVIRUS_API_KEY) {
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
      const response = await axios.post(
        `${env.ANTIVIRUS_API_URL}/scan`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${env.ANTIVIRUS_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: this.TIMEOUT,
        }
      );

      const result: ScanResult = {
        isClean: response.data.status === 'clean',
        threats: response.data.threats || [],
        scanId: response.data.scan_id,
        scanTime: Date.now() - startTime,
      };

      // Log scan result
      logger.info('Antivirus scan completed', {
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
    } catch (error: any) {
      logger.error('Antivirus scan failed', {
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
  private static async basicScan(filePath: string): Promise<ScanResult> {
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
        /MZ\x90\x00\x03/,  // PE header
        /\x7fELF/,          // ELF header
        
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
    } catch (error: any) {
      logger.error('Basic scan failed', { filePath, error: error.message });
      
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
  private static async quarantineFile(filePath: string, scanResult: ScanResult): Promise<void> {
    if (!env.FILE_QUARANTINE_ENABLED) {
      return;
    }

    try {
      const fileName = path.basename(filePath);
      const quarantinePath = path.join(
        this.QUARANTINE_DIR,
        `${Date.now()}_${scanResult.scanId}_${fileName}`
      );

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

      logger.warn('File quarantined', {
        originalPath: filePath,
        quarantinePath,
        threats: scanResult.threats,
      });
    } catch (error: any) {
      logger.error('Failed to quarantine file', {
        filePath,
        error: error.message,
      });
    }
  }

  /**
   * Ensure quarantine directory exists
   */
  private static async ensureQuarantineDir(): Promise<void> {
    try {
      await fs.access(this.QUARANTINE_DIR);
    } catch {
      await fs.mkdir(this.QUARANTINE_DIR, { recursive: true });
    }
  }

  /**
   * Clean up old quarantine files
   */
  static async cleanupQuarantine(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.QUARANTINE_DIR);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.QUARANTINE_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          await fs.unlink(filePath);
          logger.info('Cleaned up old quarantine file', { file });
        }
      }
    } catch (error: any) {
      logger.error('Quarantine cleanup failed', { error: error.message });
    }
  }
}