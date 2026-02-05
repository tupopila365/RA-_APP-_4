import { AppDataSource } from '../../config/db';
import { ChatbotInteraction } from './interactions.entity';
import type { IChatbotInteraction, FeedbackType } from './interactions.model';
import { logger } from '../../utils/logger';
import { ERROR_CODES } from '../../constants/errors';

export interface LogInteractionDTO {
  question: string;
  answer: string;
  sessionId: string;
  category?: string;
}

export interface UpdateFeedbackDTO {
  feedback: FeedbackType;
  comment?: string;
}

export interface ListInteractionsQuery {
  page?: number;
  limit?: number;
  feedback?: FeedbackType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  sessionId?: string;
}

export interface ListInteractionsResult {
  interactions: ChatbotInteraction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MetricsResult {
  totalQuestions: number;
  totalLikes: number;
  totalDislikes: number;
  likeDislikeRatio: number;
  mostDislikedQuestions: Array<{
    question: string;
    answer: string;
    dislikeCount: number;
    interactionId: string;
  }>;
  questionsByCategory: Record<string, number>;
  questionsOverTime: Array<{
    date: string;
    count: number;
  }>;
}

function parseId(interactionId: string): number {
  const id = parseInt(interactionId, 10);
  if (isNaN(id)) {
    throw {
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
      message: 'Interaction not found',
    };
  }
  return id;
}

class InteractionsService {
  detectCategory(question: string): string {
    const lowerQuestion = question.toLowerCase();
    const categoryKeywords: Record<string, string[]> = {
      policy: ['policy', 'policies', 'rule', 'rules', 'regulation', 'regulations', 'guideline', 'guidelines'],
      tender: ['tender', 'tenders', 'bidding', 'bid', 'procurement', 'contract', 'contracts'],
      report: ['report', 'reports', 'annual', 'quarterly', 'statistics', 'data'],
      location: ['location', 'locations', 'office', 'offices', 'address', 'where', 'find', 'near'],
      contact: ['contact', 'phone', 'email', 'call', 'reach', 'how to contact', 'telephone'],
      procedure: ['procedure', 'process', 'how to', 'step', 'steps', 'application', 'apply', 'form'],
    };
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerQuestion.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  async logInteraction(dto: LogInteractionDTO): Promise<ChatbotInteraction> {
    try {
      const category = dto.category || this.detectCategory(dto.question);

      const repo = AppDataSource.getRepository(ChatbotInteraction);
      const interaction = repo.create({
        question: dto.question,
        answer: dto.answer,
        sessionId: dto.sessionId,
        category,
        timestamp: new Date(),
      });

      const saved = await repo.save(interaction);
      logger.info(`Interaction logged with ID: ${saved.id}`, {
        sessionId: dto.sessionId,
        category,
      });
      return saved;
    } catch (error: any) {
      logger.error('Log interaction error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to log interaction',
        details: error.message,
      };
    }
  }

  async updateFeedback(interactionId: string, dto: UpdateFeedbackDTO): Promise<ChatbotInteraction> {
    try {
      const id = parseId(interactionId);
      const repo = AppDataSource.getRepository(ChatbotInteraction);
      const interaction = await repo.findOne({ where: { id } });

      if (!interaction) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Interaction not found',
        };
      }

      interaction.feedback = dto.feedback;
      if (dto.comment !== undefined) interaction.comment = dto.comment || null;

      const saved = await repo.save(interaction);
      logger.info(`Feedback updated for interaction ${interactionId}`, { feedback: dto.feedback });
      return saved;
    } catch (error: any) {
      logger.error('Update feedback error:', error);
      if (error.statusCode) throw error;
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update feedback',
        details: error.message,
      };
    }
  }

  async getInteractions(query: ListInteractionsQuery): Promise<ListInteractionsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const skip = (page - 1) * limit;

      const repo = AppDataSource.getRepository(ChatbotInteraction);
      const qb = repo.createQueryBuilder('i');

      if (query.feedback !== undefined) {
        qb.andWhere('i.feedback = :feedback', { feedback: query.feedback });
      }
      if (query.category) {
        qb.andWhere('i.category = :category', { category: query.category });
      }
      if (query.sessionId) {
        qb.andWhere('i.sessionId = :sessionId', { sessionId: query.sessionId });
      }
      if (query.startDate) {
        qb.andWhere('i.timestamp >= :startDate', { startDate: query.startDate });
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        qb.andWhere('i.timestamp <= :endDate', { endDate });
      }

      const [interactions, total] = await qb
        .orderBy('i.timestamp', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        interactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error('Get interactions error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve interactions',
        details: error.message,
      };
    }
  }

  async getMetrics(startDate?: Date, endDate?: Date): Promise<MetricsResult> {
    try {
      const repo = AppDataSource.getRepository(ChatbotInteraction);
      const qbBase = repo.createQueryBuilder('i');
      if (startDate) qbBase.andWhere('i.timestamp >= :startDate', { startDate });
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        qbBase.andWhere('i.timestamp <= :endDate', { endDate: end });
      }

      const totalQuestions = await qbBase.getCount();

      const totalLikes = await repo
        .createQueryBuilder('i')
        .where('i.feedback = :fb', { fb: 'like' })
        .getCount();
      const totalDislikes = await repo
        .createQueryBuilder('i')
        .where('i.feedback = :fb', { fb: 'dislike' })
        .getCount();

      const likeDislikeRatio =
        totalDislikes > 0
          ? Number((totalLikes / totalDislikes).toFixed(2))
          : totalLikes > 0
            ? totalLikes
            : 0;

      // Most disliked: group by question+answer, count, take top 10
      const mostDislikedRows = await repo
        .createQueryBuilder('i')
        .select('i.question', 'question')
        .addSelect('i.answer', 'answer')
        .addSelect('COUNT(*)', 'count')
        .addSelect('MIN(i.id)', 'minId')
        .where('i.feedback = :fb', { fb: 'dislike' })
        .groupBy('i.question')
        .addGroupBy('i.answer')
        .orderBy('COUNT(*)', 'DESC')
        .limit(10)
        .getRawMany();

      const mostDislikedQuestions = (mostDislikedRows as { question: string; answer: string; count: string; minId: number }[]).map(
        (item) => ({
          question: item.question,
          answer: item.answer,
          dislikeCount: parseInt(item.count, 10) || 0,
          interactionId: String(item.minId),
        })
      );

      const categoryRows = await repo
        .createQueryBuilder('i')
        .select('i.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('i.category')
        .getRawMany();

      const questionsByCategory: Record<string, number> = {};
      (categoryRows as { category: string; count: string }[]).forEach((item) => {
        questionsByCategory[item.category || 'general'] = parseInt(item.count, 10) || 0;
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const timeRows = await repo
        .createQueryBuilder('i')
        .select('CONVERT(varchar(10), i.timestamp, 120)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('i.timestamp >= :from', { from: thirtyDaysAgo })
        .groupBy('CONVERT(varchar(10), i.timestamp, 120)')
        .orderBy('CONVERT(varchar(10), i.timestamp, 120)', 'ASC')
        .getRawMany();

      const questionsOverTime = (timeRows as { date: string; count: string }[]).map((item) => ({
        date: item.date,
        count: parseInt(item.count, 10) || 0,
      }));

      return {
        totalQuestions,
        totalLikes,
        totalDislikes,
        likeDislikeRatio,
        mostDislikedQuestions,
        questionsByCategory,
        questionsOverTime,
      };
    } catch (error: any) {
      logger.error('Get metrics error:', error);
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to retrieve metrics',
        details: error.message,
      };
    }
  }
}

export const interactionsService = new InteractionsService();
