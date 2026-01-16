import { Request, Response, NextFunction } from 'express';
export declare class CaptchaProtection {
    private static readonly RECAPTCHA_VERIFY_URL;
    private static readonly MIN_SCORE;
    /**
     * Verify reCAPTCHA token
     */
    static verifyRecaptcha(token: string, remoteip?: string): Promise<boolean>;
    /**
     * Middleware to validate CAPTCHA for PLN submissions
     */
    static validateCaptcha: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=captchaProtection.d.ts.map