import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { env } from '../config/env';
import { ERROR_CODES } from '../constants/errors';

export class CaptchaProtection {
  private static readonly RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
  private static readonly MIN_SCORE = 0.5; // For reCAPTCHA v3

  /**
   * Verify reCAPTCHA token
   */
  static async verifyRecaptcha(token: string, remoteip?: string): Promise<boolean> {
    try {
      const response = await axios.post(this.RECAPTCHA_VERIFY_URL, null, {
        params: {
          secret: env.RECAPTCHA_SECRET_KEY,
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
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return false;
    }
  }

  /**
   * Middleware to validate CAPTCHA for PLN submissions
   */
  static validateCaptcha = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const captchaToken = req.body.captchaToken || req.headers['x-captcha-token'];

      if (!captchaToken) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.CAPTCHA_REQUIRED,
            message: 'CAPTCHA verification is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isValid = await this.verifyRecaptcha(captchaToken, req.ip);

      if (!isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.CAPTCHA_INVALID,
            message: 'CAPTCHA verification failed. Please try again.',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}