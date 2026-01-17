import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Only initialize if SMTP is configured
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      logger.warn('SMTP not configured - email service will not send emails');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });

      logger.info('Email transporter initialized');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Send email
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set up SMTP settings.');
    }

    try {
      const mailOptions = {
        from: `"${env.SMTP_FROM_NAME || 'Roads Authority Namibia'}" <${env.SMTP_FROM_EMAIL || 'noreply@roadsauthority.na'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
    } catch (error: any) {
      logger.error('Error sending email:', error);
      throw {
        statusCode: 500,
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send email',
        details: error.message,
      };
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, fullName: string | undefined, token: string): Promise<void> {
    const verificationUrl = `${env.EMAIL_VERIFICATION_BASE_URL || 'roadsauthority://verify-email'}?token=${token}`;
    const displayName = fullName || 'User';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Roads Authority Namibia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00B4E6 0%, #00B4E6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #FFFFFF; margin: 0;">Roads Authority Namibia</h1>
            <p style="color: #FFFFFF; margin: 10px 0 0 0;">Safe Roads to Prosperity</p>
          </div>
          
          <div style="background: #FFFFFF; padding: 30px; border: 1px solid #E0E0E0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #00B4E6; margin-top: 0;">Verify Your Email Address</h2>
            
            <p>Hello ${displayName},</p>
            
            <p>Thank you for registering with Roads Authority Namibia. Please verify your email address to activate your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background-color: #00B4E6; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background: #F5F5F5; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${verificationUrl}
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email from Roads Authority Namibia. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Roads Authority Namibia - Verify Your Email Address
      
      Hello ${displayName},
      
      Thank you for registering with Roads Authority Namibia. Please verify your email address to activate your account.
      
      Click this link to verify your email:
      ${verificationUrl}
      
      This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
      
      ---
      This is an automated email from Roads Authority Namibia. Please do not reply to this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Roads Authority Namibia',
      html,
      text,
    });
  }

  /**
   * Send password reset email (for future use)
   */
  async sendPasswordResetEmail(email: string, fullName: string | undefined, token: string): Promise<void> {
    const resetUrl = `${env.EMAIL_VERIFICATION_BASE_URL || 'roadsauthority://reset-password'}?token=${token}`;
    const displayName = fullName || 'User';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Roads Authority Namibia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00B4E6 0%, #00B4E6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #FFFFFF; margin: 0;">Roads Authority Namibia</h1>
            <p style="color: #FFFFFF; margin: 10px 0 0 0;">Safe Roads to Prosperity</p>
          </div>
          
          <div style="background: #FFFFFF; padding: 30px; border: 1px solid #E0E0E0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #00B4E6; margin-top: 0;">Reset Your Password</h2>
            
            <p>Hello ${displayName},</p>
            
            <p>You requested to reset your password for your Roads Authority account. Click the button below to reset your password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #00B4E6; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; background: #F5F5F5; padding: 10px; border-radius: 5px; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              <strong>Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email from Roads Authority Namibia. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Roads Authority Namibia - Reset Your Password
      
      Hello ${displayName},
      
      You requested to reset your password for your Roads Authority account. Click the link below to reset your password.
      
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
      
      ---
      This is an automated email from Roads Authority Namibia. Please do not reply to this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Roads Authority Namibia',
      html,
      text,
    });
  }

  /**
   * Send welcome email after email verification
   */
  async sendWelcomeEmail(email: string, fullName: string | undefined): Promise<void> {
    const displayName = fullName || 'User';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Roads Authority Namibia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00B4E6 0%, #00B4E6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #FFFFFF; margin: 0;">Roads Authority Namibia</h1>
            <p style="color: #FFFFFF; margin: 10px 0 0 0;">Safe Roads to Prosperity</p>
          </div>
          
          <div style="background: #FFFFFF; padding: 30px; border: 1px solid #E0E0E0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #00B4E6; margin-top: 0;">Welcome, ${displayName}!</h2>
            
            <p>Your email has been successfully verified. Your account is now active!</p>
            
            <p>You can now access all features of the Roads Authority Namibia mobile app, including:</p>
            
            <ul style="color: #666;">
              <li>Apply for Personalized Number Plates (PLN)</li>
              <li>Report road damage and potholes</li>
              <li>Track your applications</li>
              <li>View news and announcements</li>
              <li>Access job vacancies and tenders</li>
            </ul>
            
            <p>Thank you for joining Roads Authority Namibia!</p>
            
            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated email from Roads Authority Namibia. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to Roads Authority Namibia!
      
      Hello ${displayName},
      
      Your email has been successfully verified. Your account is now active!
      
      You can now access all features of the Roads Authority Namibia mobile app.
      
      Thank you for joining Roads Authority Namibia!
      
      ---
      This is an automated email from Roads Authority Namibia. Please do not reply to this email.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Roads Authority Namibia',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();




















