export interface ScanResult {
    isClean: boolean;
    threats: string[];
    scanId: string;
    scanTime: number;
}
export declare class AntivirusService {
    private static readonly TIMEOUT;
    private static readonly QUARANTINE_DIR;
    /**
     * Scan file for malware using external antivirus service
     */
    static scanFile(filePath: string): Promise<ScanResult>;
    /**
     * Basic malware scanning (fallback)
     */
    private static basicScan;
    /**
     * Quarantine infected file
     */
    private static quarantineFile;
    /**
     * Ensure quarantine directory exists
     */
    private static ensureQuarantineDir;
    /**
     * Clean up old quarantine files
     */
    static cleanupQuarantine(maxAgeMs?: number): Promise<void>;
}
//# sourceMappingURL=antivirusService.d.ts.map