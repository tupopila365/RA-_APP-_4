/**
 * Test script for Ozeki SMS gateway
 * Run with: npm run test:ozeki-sms -- 0812345678
 */
import dotenv from 'dotenv';

dotenv.config();

const OZEKI_BASE_URL = process.env.OZEKI_SMS_BASE_URL;
const OZEKI_USERNAME = process.env.OZEKI_SMS_USERNAME;
const OZEKI_PASSWORD = process.env.OZEKI_SMS_PASSWORD;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '264' + digits.slice(1);
  }
  if (!digits.startsWith('264')) {
    return '264' + digits;
  }
  return digits;
}

async function testOzekiSms() {
  const phone = process.argv[2];
  if (!phone) {
    console.error('Usage: npm run test:ozeki-sms -- <phone_number>');
    console.error('Example: npm run test:ozeki-sms -- 0812345678');
    process.exit(1);
  }

  if (!OZEKI_BASE_URL || !OZEKI_USERNAME || !OZEKI_PASSWORD) {
    console.error('Error: Ozeki env vars not set. Check .env has:');
    console.error('  OZEKI_SMS_BASE_URL, OZEKI_SMS_USERNAME, OZEKI_SMS_PASSWORD');
    process.exit(1);
  }

  const normalizedPhone = normalizePhone(phone);
  const message = 'Roads Authority test: Ozeki SMS is working!';
  const encodedMessage = encodeURIComponent(message);

  const url = `${OZEKI_BASE_URL.replace(/\/$/, '')}/api?action=sendmessage&username=${encodeURIComponent(
    OZEKI_USERNAME
  )}&password=${encodeURIComponent(OZEKI_PASSWORD)}&recipient=${normalizedPhone}&messagetype=SMS:TEXT&messagedata=${encodedMessage}`;

  console.log('Testing Ozeki SMS...');
  console.log('  Phone:', normalizedPhone);
  console.log('  Message:', message);
  console.log('  Server:', OZEKI_BASE_URL);
  console.log('');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/xml, text/xml' },
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', text);

    const statusMatch = text.match(/<statuscode>([^<]+)<\/statuscode>/i);
    const statusCode = statusMatch?.[1]?.trim();

    if (response.ok && (statusCode === '0' || statusCode === '0 ')) {
      console.log('\nSuccess! SMS should be delivered to', phone);
    } else {
      console.error('\nFailed. Status code:', statusCode || 'unknown');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
    process.exit(1);
  }
}

testOzekiSms();
