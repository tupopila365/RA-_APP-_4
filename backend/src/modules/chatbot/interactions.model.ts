export type FeedbackType = 'like' | 'dislike' | null;

export interface IChatbotInteraction {
  question: string;
  answer: string;
  feedback?: FeedbackType;
  comment?: string;
  timestamp: Date;
  sessionId: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
