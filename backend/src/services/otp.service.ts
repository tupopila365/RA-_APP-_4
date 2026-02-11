import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { normalizePhone } from './sms.service';

const OTP_PREFIX = 'otp:reset:';
const OTP_REGISTER_PREFIX = 'otp:register:';
const OTP_CHANGE_PASSWORD_PREFIX = 'otp:change_password:';
const TTL_SECONDS = env.OTP_EXPIRY_SECONDS ?? 300;

interface OtpPayload {
  otp: string;
  email: string;
}

interface RegisterOtpPayload {
  otp: string;
  email: string;
  fullName: string | null;
  phoneNumber: string;
}

/**
 * In-memory fallback when Redis is not available
 */
const memoryStore = new Map<string, { payload: OtpPayload; expiry: number }>();
const registerMemoryStore = new Map<string, { payload: RegisterOtpPayload; expiry: number }>();

/**
 * Store OTP for password reset (Redis or in-memory fallback)
 */
export async function storeOtp(phone: string, otp: string, email: string): Promise<void> {
  const normalizedPhone = normalizePhone(phone);
  const key = OTP_PREFIX + normalizedPhone;
  const payload: OtpPayload = { otp, email };

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.setEx(key, TTL_SECONDS, JSON.stringify(payload));
      logger.debug(`OTP stored for ${normalizedPhone.replace(/\d(?=\d{3})/g, '*')}`);
    } catch (error) {
      logger.error('Redis OTP store failed, using memory fallback:', error);
      memoryStore.set(key, {
        payload,
        expiry: Date.now() + TTL_SECONDS * 1000,
      });
      setTimeout(() => memoryStore.delete(key), TTL_SECONDS * 1000);
    }
  } else {
    memoryStore.set(key, {
      payload,
      expiry: Date.now() + TTL_SECONDS * 1000,
    });
    setTimeout(() => memoryStore.delete(key), TTL_SECONDS * 1000);
    logger.debug('OTP stored in memory (Redis not configured)');
  }
}

/**
 * Verify OTP and return email if valid. Deletes OTP on success (single use).
 */
export async function verifyAndConsumeOtp(phone: string, otp: string): Promise<string | null> {
  const normalizedPhone = normalizePhone(phone);
  const key = OTP_PREFIX + normalizedPhone;

  const redis = getRedisClient();
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      const payload: OtpPayload = JSON.parse(raw);
      if (payload.otp !== otp) return null;
      await redis.del(key);
      return payload.email;
    } catch (error) {
      logger.error('Redis OTP verify failed:', error);
      return null;
    }
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiry < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  if (entry.payload.otp !== otp) return null;
  memoryStore.delete(key);
  return entry.payload.email;
}

/**
 * Store OTP for registration (phone verification)
 */
export async function storeRegisterOtp(
  phone: string,
  otp: string,
  email: string,
  fullName: string | null,
  phoneNumber: string
): Promise<void> {
  const normalizedPhone = normalizePhone(phone);
  const key = OTP_REGISTER_PREFIX + normalizedPhone;
  const payload: RegisterOtpPayload = { otp, email, fullName, phoneNumber };

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.setEx(key, TTL_SECONDS, JSON.stringify(payload));
      logger.debug(`Register OTP stored for ${normalizedPhone.replace(/\d(?=\d{3})/g, '*')}`);
    } catch (error) {
      logger.error('Redis register OTP store failed, using memory fallback:', error);
      registerMemoryStore.set(key, {
        payload,
        expiry: Date.now() + TTL_SECONDS * 1000,
      });
      setTimeout(() => registerMemoryStore.delete(key), TTL_SECONDS * 1000);
    }
  } else {
    registerMemoryStore.set(key, {
      payload,
      expiry: Date.now() + TTL_SECONDS * 1000,
    });
    setTimeout(() => registerMemoryStore.delete(key), TTL_SECONDS * 1000);
  }
}

/**
 * Verify registration OTP and return payload if valid. Deletes on success.
 */
export async function verifyAndConsumeRegisterOtp(
  phone: string,
  otp: string
): Promise<RegisterOtpPayload | null> {
  const normalizedPhone = normalizePhone(phone);
  const key = OTP_REGISTER_PREFIX + normalizedPhone;

  const redis = getRedisClient();
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      const payload: RegisterOtpPayload = JSON.parse(raw);
      if (payload.otp !== otp) return null;
      await redis.del(key);
      return payload;
    } catch (error) {
      logger.error('Redis register OTP verify failed:', error);
      return null;
    }
  }

  const entry = registerMemoryStore.get(key);
  if (!entry) return null;
  if (entry.expiry < Date.now()) {
    registerMemoryStore.delete(key);
    return null;
  }
  if (entry.payload.otp !== otp) return null;
  registerMemoryStore.delete(key);
  return entry.payload;
}

/**
 * In-memory fallback for change-password OTP (keyed by userId)
 */
const changePasswordMemoryStore = new Map<string, { otp: string; expiry: number }>();

/**
 * Store OTP for change password (authenticated user). Keyed by userId.
 */
export async function storeChangePasswordOtp(userId: string, otp: string): Promise<void> {
  const key = OTP_CHANGE_PASSWORD_PREFIX + userId;

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.setEx(key, TTL_SECONDS, otp);
      logger.debug(`Change password OTP stored for user ${userId}`);
    } catch (error) {
      logger.error('Redis change password OTP store failed, using memory fallback:', error);
      changePasswordMemoryStore.set(key, {
        otp,
        expiry: Date.now() + TTL_SECONDS * 1000,
      });
      setTimeout(() => changePasswordMemoryStore.delete(key), TTL_SECONDS * 1000);
    }
  } else {
    changePasswordMemoryStore.set(key, {
      otp,
      expiry: Date.now() + TTL_SECONDS * 1000,
    });
    setTimeout(() => changePasswordMemoryStore.delete(key), TTL_SECONDS * 1000);
    logger.debug('Change password OTP stored in memory (Redis not configured)');
  }
}

/**
 * Verify and consume change password OTP for user. Returns true if valid.
 */
export async function verifyAndConsumeChangePasswordOtp(userId: string, otp: string): Promise<boolean> {
  const key = OTP_CHANGE_PASSWORD_PREFIX + userId;

  const redis = getRedisClient();
  if (redis) {
    try {
      const stored = await redis.get(key);
      if (!stored || stored !== otp) return false;
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Redis change password OTP verify failed:', error);
      return false;
    }
  }

  const entry = changePasswordMemoryStore.get(key);
  if (!entry) return false;
  if (entry.expiry < Date.now()) {
    changePasswordMemoryStore.delete(key);
    return false;
  }
  if (entry.otp !== otp) return false;
  changePasswordMemoryStore.delete(key);
  return true;
}
