import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth';
import { vacanciesService } from './vacancies.service';
import { notificationsService } from '../notifications/notifications.service';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export class VacanciesController {
  /**
   * Create a new vacancy
   * POST /api/vacancies
   */
  async createVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate required fields
      const {
        title,
        type,
        department,
        location,
        description,
        requirements,
        responsibilities,
        salary,
        closingDate,
        pdfUrl,
        published,
        // Contact information
        contactName,
        contactEmail,
        contactTelephone,
        submissionLink,
        submissionEmail,
        submissionInstructions,
      } = req.body;

      if (!title || !type || !department || !location || !description || !requirements || !responsibilities || !closingDate) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Title, type, department, location, description, requirements, responsibilities, and closingDate are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate type
      const validTypes = ['full-time', 'part-time', 'bursary', 'internship'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Type must be one of: full-time, part-time, bursary, internship',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate requirements and responsibilities are arrays
      if (!Array.isArray(requirements) || requirements.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Requirements must be a non-empty array',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Responsibilities must be a non-empty array',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Create vacancy
      const vacancy = await vacanciesService.createVacancy({
        title,
        type,
        department,
        location,
        description,
        requirements,
        responsibilities,
        salary,
        closingDate: new Date(closingDate),
        pdfUrl,
        published: published === true,
        // Contact information
        contactName,
        contactEmail,
        contactTelephone,
        submissionLink,
        submissionEmail,
        submissionInstructions,
      });

      logger.info(`Vacancy created successfully: ${vacancy._id}`);

      // Send push notification if published
      if (vacancy.published === true) {
        try {
          const notifResult = await notificationsService.sendVacancyNotification(
            vacancy._id.toString(),
            vacancy.title,
            new Date(vacancy.closingDate).toLocaleDateString()
          );
          logger.info(`Push notification sent for vacancy ${vacancy._id}: sent=${notifResult.sentCount ?? 0}, failed=${notifResult.failedCount ?? 0}`);
        } catch (notifError: any) {
          logger.error('Failed to send notification for vacancy:', notifError);
        }
      }

      res.status(201).json({
        success: true,
        data: {
          vacancy: {
            id: vacancy._id,
            title: vacancy.title,
            type: vacancy.type,
            department: vacancy.department,
            location: vacancy.location,
            description: vacancy.description,
            requirements: vacancy.requirements,
            responsibilities: vacancy.responsibilities,
            salary: vacancy.salary,
            closingDate: vacancy.closingDate,
            pdfUrl: vacancy.pdfUrl,
            published: vacancy.published,
            // Contact information
            contactName: vacancy.contactName,
            contactEmail: vacancy.contactEmail,
            contactTelephone: vacancy.contactTelephone,
            submissionLink: vacancy.submissionLink,
            submissionEmail: vacancy.submissionEmail,
            submissionInstructions: vacancy.submissionInstructions,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
          },
          message: 'Vacancy created successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Create vacancy error:', error);
      next(error);
    }
  }

  /**
   * List all vacancies with pagination, filtering, and search
   * GET /api/vacancies
   */
  async listVacancies(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as 'full-time' | 'part-time' | 'bursary' | 'internship' | undefined;
      const department = req.query.department as string;
      const location = req.query.location as string;
      const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await vacanciesService.listVacancies({
        page,
        limit,
        type,
        department,
        location,
        published,
        search,
      });

      res.status(200).json({
        success: true,
        data: {
          vacancies: result.vacancies.map((vacancy) => ({
            id: vacancy._id,
            title: vacancy.title,
            type: vacancy.type,
            department: vacancy.department,
            location: vacancy.location,
            description: vacancy.description,
            requirements: vacancy.requirements,
            responsibilities: vacancy.responsibilities,
            salary: vacancy.salary,
            closingDate: vacancy.closingDate,
            pdfUrl: vacancy.pdfUrl,
            published: vacancy.published,
            // Contact information
            contactName: vacancy.contactName,
            contactEmail: vacancy.contactEmail,
            contactTelephone: vacancy.contactTelephone,
            submissionLink: vacancy.submissionLink,
            submissionEmail: vacancy.submissionEmail,
            submissionInstructions: vacancy.submissionInstructions,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
          })),
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            limit,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('List vacancies error:', error);
      next(error);
    }
  }

  /**
   * Get a single vacancy by ID
   * GET /api/vacancies/:id
   */
  async getVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const vacancy = await vacanciesService.getVacancyById(id);

      res.status(200).json({
        success: true,
        data: {
          vacancy: {
            id: vacancy._id,
            title: vacancy.title,
            type: vacancy.type,
            department: vacancy.department,
            location: vacancy.location,
            description: vacancy.description,
            requirements: vacancy.requirements,
            responsibilities: vacancy.responsibilities,
            salary: vacancy.salary,
            closingDate: vacancy.closingDate,
            pdfUrl: vacancy.pdfUrl,
            published: vacancy.published,
            // Contact information
            contactName: vacancy.contactName,
            contactEmail: vacancy.contactEmail,
            contactTelephone: vacancy.contactTelephone,
            submissionLink: vacancy.submissionLink,
            submissionEmail: vacancy.submissionEmail,
            submissionInstructions: vacancy.submissionInstructions,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Get vacancy error:', error);
      next(error);
    }
  }

  /**
   * Update a vacancy
   * PUT /api/vacancies/:id
   */
  async updateVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const {
        title,
        type,
        department,
        location,
        description,
        requirements,
        responsibilities,
        salary,
        closingDate,
        pdfUrl,
        published,
        // Contact information
        contactName,
        contactEmail,
        contactTelephone,
        submissionLink,
        submissionEmail,
        submissionInstructions,
      } = req.body;

      // Check if publishing newly
      let wasPublishedBefore = false;
      if (published === true) {
        const existing = await vacanciesService.getVacancyById(id);
        wasPublishedBefore = existing.published === true;
      }

      // Build update object with only provided fields
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (type !== undefined) {
        const validTypes = ['full-time', 'part-time', 'bursary', 'internship'];
        if (!validTypes.includes(type)) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Type must be one of: full-time, part-time, bursary, internship',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.type = type;
      }
      if (department !== undefined) updateData.department = department;
      if (location !== undefined) updateData.location = location;
      if (description !== undefined) updateData.description = description;
      if (requirements !== undefined) {
        if (!Array.isArray(requirements) || requirements.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Requirements must be a non-empty array',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.requirements = requirements;
      }
      if (responsibilities !== undefined) {
        if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Responsibilities must be a non-empty array',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        updateData.responsibilities = responsibilities;
      }
      if (salary !== undefined) updateData.salary = salary;
      if (closingDate !== undefined) {
        // Parse the date and ensure it's valid
        const parsedDate = new Date(closingDate);
        if (isNaN(parsedDate.getTime())) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Invalid closing date format',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        
        // Validate that closing date is today or in the future (only for new dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        const closingDateOnly = new Date(parsedDate);
        closingDateOnly.setHours(0, 0, 0, 0); // Set to start of closing date
        
        if (closingDateOnly < today) {
          res.status(400).json({
            success: false,
            error: {
              code: ERROR_CODES.VALIDATION_ERROR,
              message: 'Closing date must be today or in the future',
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
        
        updateData.closingDate = parsedDate;
      }
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
      if (published !== undefined) updateData.published = published;
      
      // Contact information
      if (contactName !== undefined) updateData.contactName = contactName;
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (contactTelephone !== undefined) updateData.contactTelephone = contactTelephone;
      if (submissionLink !== undefined) updateData.submissionLink = submissionLink;
      if (submissionEmail !== undefined) updateData.submissionEmail = submissionEmail;
      if (submissionInstructions !== undefined) updateData.submissionInstructions = submissionInstructions;

      const vacancy = await vacanciesService.updateVacancy(id, updateData);

      logger.info(`Vacancy updated successfully: ${id}`);

      // Send push notification only on first publish
      if (published === true && !wasPublishedBefore) {
        try {
          const notifResult = await notificationsService.sendVacancyNotification(
            vacancy._id.toString(),
            vacancy.title,
            new Date(vacancy.closingDate).toLocaleDateString()
          );
          logger.info(`Push notification sent for vacancy ${vacancy._id}: sent=${notifResult.sentCount ?? 0}, failed=${notifResult.failedCount ?? 0}`);
        } catch (notifError: any) {
          logger.error('Failed to send notification for vacancy:', notifError);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          vacancy: {
            id: vacancy._id,
            title: vacancy.title,
            type: vacancy.type,
            department: vacancy.department,
            location: vacancy.location,
            description: vacancy.description,
            requirements: vacancy.requirements,
            responsibilities: vacancy.responsibilities,
            salary: vacancy.salary,
            closingDate: vacancy.closingDate,
            pdfUrl: vacancy.pdfUrl,
            published: vacancy.published,
            // Contact information
            contactName: vacancy.contactName,
            contactEmail: vacancy.contactEmail,
            contactTelephone: vacancy.contactTelephone,
            submissionLink: vacancy.submissionLink,
            submissionEmail: vacancy.submissionEmail,
            submissionInstructions: vacancy.submissionInstructions,
            createdAt: vacancy.createdAt,
            updatedAt: vacancy.updatedAt,
          },
          message: 'Vacancy updated successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Update vacancy error:', error);
      next(error);
    }
  }

  /**
   * Delete a vacancy
   * DELETE /api/vacancies/:id
   */
  async deleteVacancy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await vacanciesService.deleteVacancy(id);

      logger.info(`Vacancy deleted: ${id}`);

      res.status(200).json({
        success: true,
        data: {
          message: 'Vacancy deleted successfully',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Delete vacancy error:', error);
      next(error);
    }
  }
}

export const vacanciesController = new VacanciesController();
