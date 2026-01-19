import { ChatbotInteractionModel, IChatbotInteraction, FeedbackType } from './interactions.model';
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
  interactions: IChatbotInteraction[];
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

class InteractionsService {
  /**
   * Auto-detect category from question text using keyword matching
   */
  detectCategory(question: string): string {
    const lowerQuestion = question.toLowerCase();

    // Category keywords mapping
    const categoryKeywords: Record<string, string[]> = {
      policy: ['policy', 'policies', 'rule', 'rules', 'regulation', 'regulations', 'guideline', 'guidelines'],
      tender: ['tender', 'tenders', 'bidding', 'bid', 'procurement', 'contract', 'contracts'],
      report: ['report', 'reports', 'annual', 'quarterly', 'statistics', 'data'],
      location: ['location', 'locations', 'office', 'offices', 'address', 'where', 'find', 'near'],
      contact: ['contact', 'phone', 'email', 'call', 'reach', 'how to contact', 'telephone'],
      procedure: ['procedure', 'process', 'how to', 'step', 'steps', 'application', 'apply', 'form'],
    };

    // Check each category for keyword matches
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerQuestion.includes(keyword))) {
        return category;
      }
    }

    // Default to general if no match
    return 'general';
  }

  /**
   * Log a new interaction after chatbot query
   */
  async logInteraction(dto: LogInteractionDTO): Promise<IChatbotInteraction> {
    try {
      const category = dto.category || this.detectCategory(dto.question);

      const interaction = await ChatbotInteractionModel.create({
        question: dto.question,
        answer: dto.answer,
        sessionId: dto.sessionId,
        category,
        timestamp: new Date(),
      });

      logger.info(`Interaction logged with ID: ${interaction._id}`, {
        sessionId: dto.sessionId,
        category,
      });

      return interaction;
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

  /**
   * Update feedback for an existing interaction
   */
  async updateFeedback(interactionId: string, dto: UpdateFeedbackDTO): Promise<IChatbotInteraction> {
    try {
      const updateData: any = {
        feedback: dto.feedback,
      };

      if (dto.comment !== undefined) {
        updateData.comment = dto.comment || undefined; // Convert empty string to undefined
      }

      const interaction = await ChatbotInteractionModel.findByIdAndUpdate(
        interactionId,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!interaction) {
        throw {
          statusCode: 404,
          code: ERROR_CODES.NOT_FOUND,
          message: 'Interaction not found',
        };
      }

      logger.info(`Feedback updated for interaction ${interactionId}`, {
        feedback: dto.feedback,
      });

      return interaction as unknown as IChatbotInteraction;
    } catch (error: any) {
      logger.error('Update feedback error:', error);
      if (error.statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        code: ERROR_CODES.DB_OPERATION_FAILED,
        message: 'Failed to update feedback',
        details: error.message,
      };
    }
  }

  /**
   * Get interactions with pagination and filtering
   */
  async getInteractions(query: ListInteractionsQuery): Promise<ListInteractionsResult> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      if (query.feedback !== undefined) {
        filter.feedback = query.feedback;
      }

      if (query.category) {
        filter.category = query.category;
      }

      if (query.sessionId) {
        filter.sessionId = query.sessionId;
      }

      if (query.startDate || query.endDate) {
        filter.timestamp = {};
        if (query.startDate) {
          filter.timestamp.$gte = query.startDate;
        }
        if (query.endDate) {
          // Include the entire end date
          const endDate = new Date(query.endDate);
          endDate.setHours(23, 59, 59, 999);
          filter.timestamp.$lte = endDate;
        }
      }

      // Execute query with pagination
      const [interactions, total] = await Promise.all([
        ChatbotInteractionModel.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ChatbotInteractionModel.countDocuments(filter),
      ]);

      return {
        interactions: interactions as unknown as IChatbotInteraction[],
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

  /**
   * Get metrics and statistics
   */
  async getMetrics(startDate?: Date, endDate?: Date): Promise<MetricsResult> {
    try {
      // Build date filter
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.$gte = startDate;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      const filter: any = Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {};

      // Get total counts
      const [totalQuestions, totalLikes, totalDislikes] = await Promise.all([
        ChatbotInteractionModel.countDocuments(filter),
        ChatbotInteractionModel.countDocuments({ ...filter, feedback: 'like' }),
        ChatbotInteractionModel.countDocuments({ ...filter, feedback: 'dislike' }),
      ]);

      // Calculate like/dislike ratio
      const likeDislikeRatio =
        totalDislikes > 0 ? Number((totalLikes / totalDislikes).toFixed(2)) : totalLikes > 0 ? totalLikes : 0;

      // Get most disliked questions
      const mostDislikedAggregation = await ChatbotInteractionModel.aggregate([
        { $match: { ...filter, feedback: 'dislike' } },
        {
          $group: {
            _id: { question: '$question', answer: '$answer' },
            dislikeCount: { $sum: 1 },
            interactionId: { $first: '$_id' },
          },
        },
        { $sort: { dislikeCount: -1 } },
        { $limit: 10 },
      ]);

      const mostDislikedQuestions = mostDislikedAggregation.map((item) => ({
        question: item._id.question,
        answer: item._id.answer,
        dislikeCount: item.dislikeCount,
        interactionId: item.interactionId.toString(),
      }));

      // Get questions by category
      const categoryAggregation = await ChatbotInteractionModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);

      const questionsByCategory: Record<string, number> = {};
      categoryAggregation.forEach((item) => {
        questionsByCategory[item._id || 'general'] = item.count;
      });

      // Get questions over time (last 30 days, grouped by day)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const timeFilter = { ...filter, timestamp: { ...dateFilter, $gte: thirtyDaysAgo } };

      const timeAggregation = await ChatbotInteractionModel.aggregate([
        { $match: timeFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const questionsOverTime = timeAggregation.map((item) => ({
        date: item._id,
        count: item.count,
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




























