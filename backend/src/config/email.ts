import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

export async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'REPLACE_WITH_APP_PASSWORD') {
    // Production / real SMTP (Gmail, etc.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`📧 Using SMTP: ${process.env.SMTP_HOST} (${process.env.SMTP_USER})`);
  } else {
    // Use Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 Ethereal email account: ${testAccount.user}`);
    console.log(`⚠️  Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to send real emails`);
  }

  return transporter;
}

export const EMAIL_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'CV Hive <noreply@cvhive.ae>';
