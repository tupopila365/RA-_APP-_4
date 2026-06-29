import { ApiClient } from './api';
import ENV from '../config/env';

function mockChatbotAnswer(question) {
  const q = String(question).toLowerCase();
  if (q.includes('road') && (q.includes('status') || q.includes('close') || q.includes('open'))) {
    return 'Open the Road Status section from the home screen to see current road conditions, maintenance, and cautions across Namibia.';
  }
  if (q.includes('pothole') || q.includes('damage') || q.includes('report')) {
    return 'Use Report Road Damage on the home screen to submit a photo and location. Your report will be logged for review.';
  }
  if (q.includes('permit') || q.includes('pln') || q.includes('licence') || q.includes('license')) {
    return 'For PLN applications, go to Services and choose PLN Application. Track progress under My Applications after signing in.';
  }
  if (q.includes('office') || q.includes('contact') || q.includes('phone')) {
    return 'Use Find Offices to see Roads Authority locations, hours, and contact details. Head office: +264 61 284 2111.';
  }
  return 'Thank you for your question. This demo app uses sample data only. For official enquiries, contact the Roads Authority at +264 61 284 2111 or visit ra.org.na.';
}

/**
 * Send a question to the backend chatbot (RAG/traffic/roadworks). Admin can see interactions.
 * @param {string} question
 * @param {string} [sessionId]
 * @param {{ latitude: number, longitude: number }} [userLocation]
 */
export async function queryChatbot(question, sessionId = null, userLocation = null) {
  if (ENV.USE_MOCK_DATA) {
    return mockChatbotAnswer(question);
  }

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
