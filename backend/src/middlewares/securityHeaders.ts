import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

export class SecurityHeaders {
  /**
   * Set comprehensive security headers
   */
  static setSecurityHeaders = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        frameSrc: ["https://www.google.com"],
      },
    },
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    
    // X-Frame-Options
    frameguard: {
      action: 'deny',
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // Referrer Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    
    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: false,
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
  });

  /**
   * Add custom security headers
   */
  static addCustomHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent information disclosure
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    // Cache control for sensitive endpoints
    if (req.path.includes('/pln/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  };
}