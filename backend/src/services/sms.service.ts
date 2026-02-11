import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Normalize phone number to digits only (Namibia format: 264XXXXXXXX)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // If starts with 0, assume local format (e.g. 0812345678) -> 264812345678
  if (digits.startsWith('0')) {
    return '264' + digits.slice(1);
  }
  // If doesn't start with 264, prepend Namibia country code
  if (!digits.startsWith('264')) {
    return '264' + digits;
  }
  return digits;
}

/**
 * Ozeki NG SMS Gateway HTTP API service
 * https://ozekisms.com/p_2413-how-to-send-an-sms-using-http.html
 */
class SmsService {
  private baseUrl: string | null = null;
  private username: string | null = null;
  private password: string | null = null;

  constructor() {
    if (env.OZEKI_SMS_BASE_URL && env.OZEKI_SMS_USERNAME && env.OZEKI_SMS_PASSWORD) {
      this.baseUrl = env.OZEKI_SMS_BASE_URL.replace(/\/$/, '');
      this.username = env.OZEKI_SMS_USERNAME;
      this.password = env.OZEKI_SMS_PASSWORD;
      logger.info('SMS service configured (Ozeki)');
    } else {
      logger.warn(
        'SMS not configured - set OZEKI_SMS_BASE_URL, OZEKI_SMS_USERNAME, OZEKI_SMS_PASSWORD'
      );
    }
  }

  /**
   * Send SMS via Ozeki HTTP API
   * @param recipient - Phone number (will be normalized)
   * @param message - Message text
   */
  async sendSms(recipient: string, message: string): Promise<void> {
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('SMS service not configured. Please set Ozeki environment variables.');
    }

    const normalizedPhone = normalizePhone(recipient);
    const encodedMessage = encodeURIComponent(message);

    const url = `${this.baseUrl}/api?action=sendmessage&username=${encodeURIComponent(
      this.username
    )}&password=${encodeURIComponent(this.password)}&recipient=${normalizedPhone}&messagetype=SMS:TEXT&messagedata=${encodedMessage}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/xml, text/xml, */*' },
      });

      const text = await response.text();
      logger.debug('Ozeki SMS response:', { status: response.status, body: text });

      if (!response.ok) {
        logger.error('Ozeki SMS request failed:', { status: response.status, body: text });
        throw new Error(`SMS delivery failed: HTTP ${response.status}`);
      }

      // Parse XML response for status
      const statusMatch = text.match(/<statuscode>([^<]+)<\/statuscode>/i);
      const statusMessage = text.match(/<statusmessage>([^<]*)<\/statusmessage>/i)?.[1] || '';

      if (statusMatch) {
        const statusCode = statusMatch[1].trim();
        // Ozeki typically returns "0" or "0 " for success
        if (statusCode !== '0' && statusCode !== '0 ') {
          logger.error('Ozeki SMS rejected:', { statusCode, statusMessage });
          throw new Error(`SMS delivery failed: ${statusMessage || statusCode}`);
        }
      }

      logger.info(`SMS sent to ${normalizedPhone.replace(/\d(?=\d{3})/g, '*')}`);
    } catch (error: any) {
      logger.error('SMS send error:', error);
      if (error.message?.includes('SMS')) {
        throw error;
      }
      throw new Error(`Failed to send SMS: ${error.message || 'Unknown error'}`);
    }
  }

  isConfigured(): boolean {
    return !!(this.baseUrl && this.username && this.password);
  }
}

export const smsService = new SmsService();
