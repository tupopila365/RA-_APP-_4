import apiClient from './api';
import { IApiResponse, IPaginatedResponse } from '../types';

/**
 * Interactions Service
 * Handles API calls related to chatbot interactions and metrics
 */

export interface IChatbotInteraction {
  id: string;
  question: string;
  answer: string;
  feedback?: 'like' | 'dislike' | null;
  comment?: string;
  timestamp: string;
  sessionId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInteractionsListParams {
  page?: number;
  limit?: number;
  feedback?: 'like' | 'dislike';
  category?: string;
  startDate?: string;
  endDate?: string;
  sessionId?: string;
}

export interface IMetrics {
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

/**
 * Get list of interactions with pagination and filtering
 */
export const getInteractions = async (
  params?: IInteractionsListParams
): Promise<any> => {
  const queryParams: Record<string, string> = {};
  
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.feedback) queryParams.feedback = params.feedback;
  if (params?.category) queryParams.category = params.category;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.sessionId) queryParams.sessionId = params.sessionId;

  const queryString = new URLSearchParams(queryParams).toString();
  const endpoint = queryString ? `/chatbot/interactions?${queryString}` : '/chatbot/interactions';

  const response = await apiClient.get<any>(endpoint);
  return response.data;
};

/**
 * Get metrics and statistics
 */
export const getMetrics = async (
  startDate?: string,
  endDate?: string
): Promise<IApiResponse<IMetrics>> => {
  const queryParams: Record<string, string> = {};
  
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  const queryString = new URLSearchParams(queryParams).toString();
  const endpoint = queryString ? `/chatbot/interactions/metrics?${queryString}` : '/chatbot/interactions/metrics';

  const response = await apiClient.get<IApiResponse<IMetrics>>(endpoint);
  return response.data;
};

const interactionsService = {
  getInteractions,
  getMetrics,
};

export default interactionsService;

