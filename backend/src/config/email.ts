import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

export async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
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
  }

  return transporter;
}

export const EMAIL_FROM = process.env.SMTP_FROM || 'CV Hive <noreply@cvhive.ae>';
