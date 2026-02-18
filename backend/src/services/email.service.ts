import nodemailer from 'nodemailer';
import { getTransporter, EMAIL_FROM } from '../config/email';
import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import * as templates from '../templates/emails';

async function sendEmail(to: string, subject: string, html: string, userId?: string, emailType?: string) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    // Log the email
    if (emailType) {
      await db.query(
        `INSERT INTO email_logs (id, user_id, email_type, recipient_email, subject, status)
         VALUES ($1, $2, $3, $4, $5, 'SENT')`,
        [uuidv4(), userId || null, emailType, to, subject]
      );
    }

    // Show Ethereal preview URL in dev
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview email: ${previewUrl}`);
    }

    return info;
  } catch (error: any) {
    // Log failure
    if (emailType) {
      await db.query(
        `INSERT INTO email_logs (id, user_id, email_type, recipient_email, subject, status, error_message)
         VALUES ($1, $2, $3, $4, $5, 'FAILED', $6)`,
        [uuidv4(), userId || null, emailType, to, subject, error.message]
      ).catch(() => {});
    }
    console.error('Email send failed:', error.message);
    throw error;
  }
}

export async function sendVerificationEmail(to: string, token: string, userId: string) {
  const { subject, html } = templates.verificationEmail(token);
  return sendEmail(to, subject, html, userId, 'VERIFICATION');
}

export async function sendPasswordResetEmail(to: string, token: string, userId: string) {
  const { subject, html } = templates.passwordResetEmail(token);
  return sendEmail(to, subject, html, userId, 'PASSWORD_RESET');
}

export async function sendApplicationNotification(employerEmail: string, candidateName: string, jobTitle: string) {
  const { subject, html } = templates.applicationNotificationEmployer(candidateName, jobTitle);
  return sendEmail(employerEmail, subject, html, undefined, 'APPLICATION_NOTIFICATION');
}

export async function sendStatusChangeNotification(
  candidateEmail: string, jobTitle: string, companyName: string, newStatus: string, userId: string
) {
  const { subject, html } = templates.applicationStatusCandidate(jobTitle, companyName, newStatus);
  return sendEmail(candidateEmail, subject, html, userId, 'STATUS_CHANGE');
}

export async function sendJobAlertDigest(
  to: string, userId: string, jobs: Array<{ title: string; company: string; emirate: string; id: string }>
) {
  const { subject, html } = templates.jobAlertDigest(jobs);
  return sendEmail(to, subject, html, userId, 'JOB_ALERT');
}
