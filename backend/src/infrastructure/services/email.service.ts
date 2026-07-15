import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (!env.SMTP_HOST || !env.SMTP_USER) {
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }

    return this.transporter;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();

    if (!transporter) {
      logger.info('Email skipped (SMTP not configured)', { to, subject });
      return;
    }

    try {
      await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to,
        subject,
        html,
      });
      logger.info('Email sent', { to, subject });
    } catch (error) {
      logger.error('Email send failed', { to, subject, error });
    }
  }

  async sendApplicationStatusEmail(
    email: string,
    applicationNo: string,
    status: string,
    serviceName: string
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Government Citizen Services Portal</h2>
        <p>Your application status has been updated.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Application No</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${applicationNo}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${serviceName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${status}</td></tr>
        </table>
        <p>Login to the portal to view details.</p>
      </div>
    `;

    await this.sendEmail(email, `Application ${applicationNo} - Status Update`, html);
  }
}

export const emailService = new EmailService();
