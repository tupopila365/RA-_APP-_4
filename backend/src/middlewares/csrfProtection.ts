import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { SecureIdGenerator } from '../utils/secureIdGenerator';

/**
 * CSRF Protection middleware
 */
export class CSRFProtection {
  private static readonly CSRF_TOKEN_HEADER = 'x-csrf-token';
  private static readonly CSRF_COOKIE_NAME = 'csrf-token';
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  private static tokenStore = new Map<string, { token: string; expires: number; ip: string }>();

  /**
   * Generate CSRF token for a session
   */
  static generateToken(req: Request): string {
    const token = SecureIdGenerator.generateCSRFToken();
    const sessionId = this.getSessionId(req);
    
    this.tokenStore.set(sessionId, {
      token,
      expires: Date.now() + this.TOKEN_EXPIRY,
      ip: req.ip || 'unknown',
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Get session ID from request
   */
  private static getSessionId(req: Request): string {
    // Use IP + User-Agent as session identifier for stateless approach
    const userAgent = req.get('User-Agent') || '';
    return crypto.createHash('sha256')
      .update(`${req.ip}-${userAgent}`)
      .digest('hex');
  }

  /**
   * Clean up expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.tokenStore.entries()) {
      if (tokenData.expires < now) {
        this.tokenStore.delete(sessionId);
      }
    }
  }

  /**
   * Validate CSRF token
   */
  private static validateToken(req: Request, providedToken: string): boolean {
    const sessionId = this.getSessionId(req);
    const tokenData = this.tokenStore.get(sessionId);

    if (!tokenData) {
      return false;
    }

    // Check if token is expired
    if (tokenData.expires < Date.now()) {
      this.tokenStore.delete(sessionId);
      return false;
    }

    // Check if IP matches (additional security)
    if (tokenData.ip !== (req.ip || 'unknown')) {
      return false;
    }

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(tokenData.token, 'base64url'),
      Buffer.from(providedToken, 'base64url')
    );
  }

  /**
   * Middleware to provide CSRF token
   */
  static provideToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = CSRFProtection.generateToken(req);
    
    // Set token in cookie (httpOnly for security)
    res.cookie(CSRFProtection.CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRFProtection.TOKEN_EXPIRY,
    });

    // Also provide in response header for SPA consumption
    res.setHeader('X-CSRF-Token', token);

    next();
  };

  /**
   * Middleware to validate CSRF token
   */
  static validateCSRF = (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip for authenticated API requests with valid JWT
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return next();
    }

    const token = req.headers[CSRFProtection.CSRF_TOKEN_HEADER] as string ||
                  req.body._csrf ||
                  req.query._csrf as string;

    if (!token) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token is required',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!CSRFProtection.validateToken(req, token)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid or expired CSRF token',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };

  /**
   * Middleware for PLN form submissions (combines token provision and validation)
   */
  static protectPLNSubmission = (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET') {
      // Provide token for form rendering
      return CSRFProtection.provideToken(req, res, next);
    } else {
      // Validate token for form submission
      return CSRFProtection.validateCSRF(req, res, next);
    }
  };

  /**
   * Get CSRF token for client-side usage
   */
  static getTokenForClient = (req: Request, res: Response): void => {
    const token = CSRFProtection.generateToken(req);
    
    res.json({
      success: true,
      data: {
        csrfToken: token,
        expires: Date.now() + CSRFProtection.TOKEN_EXPIRY,
      },
      timestamp: new Date().toISOString(),
    });
  };
}