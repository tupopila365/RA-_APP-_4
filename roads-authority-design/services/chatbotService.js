import { ApiClient } from './api';
import ENV from '../config/env';

/**
 * Send a question to the backend chatbot (RAG/traffic/roadworks). Admin can see interactions.
 * @param {string} question
 * @param {string} [sessionId]
 * @param {{ latitude: number, longitude: number }} [userLocation]
 */
export async function queryChatbot(question, sessionId = null, userLocation = null) {
  const body = {
    question: String(question).trim(),
    ...(sessionId && { sessionId }),
    ...(userLocation && { userLocation }),
  };
  const response = await ApiClient.post('/chatbot/query', body, {
    timeout: ENV.API_TIMEOUT_LONG || 60000,
  });
  const data = response.data || response;
  return data.answer != null ? data.answer : (data.response || data.message || 'No response.');
}
