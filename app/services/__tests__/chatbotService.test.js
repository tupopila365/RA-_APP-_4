import { chatbotService } from '../chatbotService';
import { ApiClient } from '../api';

// Mock the ApiClient
jest.mock('../api', () => ({
  ApiClient: {
    post: jest.fn(),
  },
  API_ENDPOINTS: {
    CHATBOT_QUERY: '/chatbot/query',
  },
}));

describe('chatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    it('sends query successfully', async () => {
      const mockResponse = {
        data: {
          answer: 'This is the answer',
          sources: [
            { documentId: '1', title: 'Doc 1', relevance: 0.9 },
          ],
        },
      };

      ApiClient.post.mockResolvedValue(mockResponse);

      const result = await chatbotService.query('What is road safety?');

      expect(ApiClient.post).toHaveBeenCalledWith('/chatbot/query', {
        question: 'What is road safety?',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('sends query with session ID', async () => {
      const mockResponse = { data: { answer: 'Answer', sources: [] } };
      ApiClient.post.mockResolvedValue(mockResponse);

      await chatbotService.query('Question', 'session-123');

      expect(ApiClient.post).toHaveBeenCalledWith('/chatbot/query', {
        question: 'Question',
        sessionId: 'session-123',
      });
    });

    it('handles API errors', async () => {
      const error = new Error('Service unavailable');
      ApiClient.post.mockRejectedValue(error);

      await expect(
        chatbotService.query('Question')
      ).rejects.toThrow('Service unavailable');
    });
  });
});
