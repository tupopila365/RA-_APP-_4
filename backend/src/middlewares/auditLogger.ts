import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest } from './auth';

export class AuditLogger {
  /**
   * Log PLN submission attempts
   */
  static logPLNSubmission = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Log the attempt
    logger.info('PLN submission attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      hasFile: !!req.file,
      bodyFields: Object.keys(req.body),
      fileSize: req.file?.size,
      fileName: req.file?.originalname,
    });

    // Override res.json to log the result
    const originalJson = res.json;
    res.json = function(body: any) {
      const duration = Date.now() - startTime;
      
      if (body.success) {
        logger.info('PLN submission successful', {
          ip: req.ip,
          referenceId: body.data?.referenceId,
          duration,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.warn('PLN submission failed', {
          ip: req.ip,
          error: body.error?.code,
          message: body.error?.message,
          duration,
          timestamp: new Date().toISOString(),
        });
      }
      
      return originalJson.call(this, body);
    };

    next();
  };

  /**
   * Log admin actions on PLN applications
   */
  static logAdminAction = (action: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      
      logger.info(`PLN admin action: ${action}`, {
        adminId: req.user?.userId,
        adminEmail: req.user?.email,
        applicationId: req.params.id,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        requestBody: req.body,
      });

      // Override res.json to log the result
      const originalJson = res.json;
      res.json = function(body: any) {
        const duration = Date.now() - startTime;
        
        if (body.success) {
          logger.info(`PLN admin action successful: ${action}`, {
            adminId: req.user?.userId,
            applicationId: req.params.id,
            duration,
            timestamp: new Date().toISOString(),
          });
        } else {
          logger.error(`PLN admin action failed: ${action}`, {
            adminId: req.user?.userId,
            applicationId: req.params.id,
            error: body.error?.code,
            duration,
            timestamp: new Date().toISOString(),
          });
        }
        
        return originalJson.call(this, body);
      };

      next();
    };
  };

  /**
   * Log data access attempts
   */
  static logDataAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
    logger.info('PLN data access', {
      userId: req.user?.userId,
      userEmail: req.user?.email,
      endpoint: req.path,
      method: req.method,
      query: req.query,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    next();
  };

  /**
   * Log security events
   */
  static logSecurityEvent = (event: string, details: any): void => {
    logger.warn(`Security event: ${event}`, {
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  };
}