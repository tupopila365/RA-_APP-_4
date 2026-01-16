"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaProtection = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const errors_1 = require("../constants/errors");
class CaptchaProtection {
    /**
     * Verify reCAPTCHA token
     */
    static async verifyRecaptcha(token, remoteip) {
        try {
            const response = await axios_1.default.post(this.RECAPTCHA_VERIFY_URL, null, {
                params: {
                    secret: env_1.env.RECAPTCHA_SECRET_KEY,
                    response: token,
                    remoteip,
                },
                timeout: 5000,
            });
            const { success, score, action } = response.data;
            // For reCAPTCHA v3, check score
            if (score !== undefined) {
                return success && score >= this.MIN_SCORE && action === 'pln_submit';
            }
            // For reCAPTCHA v2, just check success
            return success;
        }
        catch (error) {
            console.error('reCAPTCHA verification failed:', error);
            return false;
        }
    }
}
exports.CaptchaProtection = CaptchaProtection;
_a = CaptchaProtection;
CaptchaProtection.RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
CaptchaProtection.MIN_SCORE = 0.5; // For reCAPTCHA v3
/**
 * Middleware to validate CAPTCHA for PLN submissions
 */
CaptchaProtection.validateCaptcha = async (req, res, next) => {
    try {
        const captchaToken = req.body.captchaToken || req.headers['x-captcha-token'];
        if (!captchaToken) {
            res.status(400).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.CAPTCHA_REQUIRED,
                    message: 'CAPTCHA verification is required',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const isValid = await _a.verifyRecaptcha(captchaToken, req.ip);
        if (!isValid) {
            res.status(400).json({
                success: false,
                error: {
                    code: errors_1.ERROR_CODES.CAPTCHA_INVALID,
                    message: 'CAPTCHA verification failed. Please try again.',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=captchaProtection.js.map