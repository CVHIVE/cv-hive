const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#2563eb;font-size:24px;margin:0;">CV Hive</h1>
      </div>
      ${content}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
        <p>CV Hive — UAE's Premier CV Library</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function verificationEmail(token: string) {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  return {
    subject: 'Verify your CV Hive account',
    html: layout(`
      <h2 style="color:#111;font-size:20px;">Verify your email address</h2>
      <p style="color:#4b5563;">Thanks for signing up! Please click the button below to verify your email address.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${link}" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;">Verify Email</a>
      </div>
      <p style="color:#9ca3af;font-size:13px;">If you didn't create an account, you can safely ignore this email.</p>
    `),
  };
}

export function passwordResetEmail(token: string) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  return {
    subject: 'Reset your CV Hive password',
    html: layout(`
      <h2 style="color:#111;font-size:20px;">Reset your password</h2>
      <p style="color:#4b5563;">We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${link}" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
      </div>
      <p style="color:#9ca3af;font-size:13px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
    `),
  };
}

export function applicationNotificationEmployer(candidateName: string, jobTitle: string) {
  return {
    subject: `New application for ${jobTitle}`,
    html: layout(`
      <h2 style="color:#111;font-size:20px;">New Application Received</h2>
      <p style="color:#4b5563;"><strong>${candidateName}</strong> has applied for the position of <strong>${jobTitle}</strong>.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BASE_URL}/employer-dashboard" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;">View Applications</a>
      </div>
    `),
  };
}

export function applicationStatusCandidate(jobTitle: string, companyName: string, newStatus: string) {
  const statusMessages: Record<string, string> = {
    REVIEWED: 'Your application is being reviewed.',
    SHORTLISTED: 'Congratulations! You have been shortlisted.',
    REJECTED: 'Unfortunately, your application was not selected at this time.',
    HIRED: 'Congratulations! You have been hired!',
  };

  return {
    subject: `Application update: ${jobTitle} at ${companyName}`,
    html: layout(`
      <h2 style="color:#111;font-size:20px;">Application Status Update</h2>
      <p style="color:#4b5563;">Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
      <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:16px 0;text-align:center;">
        <p style="color:#6b7280;margin:0 0 4px 0;font-size:13px;">New Status</p>
        <p style="color:#111;font-size:18px;font-weight:700;margin:0;">${newStatus}</p>
      </div>
      <p style="color:#4b5563;">${statusMessages[newStatus] || ''}</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BASE_URL}/dashboard" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;">View My Applications</a>
      </div>
    `),
  };
}

export function contactFormEmail(name: string, email: string, subject: string, message: string) {
  return {
    subject: `Contact Form: ${subject || 'General Enquiry'} — from ${name}`,
    html: layout(`
      <h2 style="color:#111;font-size:20px;">New Contact Form Submission</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#6b7280;width:100px;">Name:</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Email:</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;">Subject:</td><td style="padding:8px 0;">${subject || 'General Enquiry'}</td></tr>
      </table>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#374151;white-space:pre-wrap;margin:0;">${message}</p>
      </div>
      <p style="color:#9ca3af;font-size:12px;">Reply directly to this email to respond to ${name}.</p>
    `),
  };
}

export function jobAlertDigest(alerts: Array<{ title: string; company: string; emirate: string; id: string }>) {
  const jobRows = alerts.map(j => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
        <a href="${BASE_URL}/jobs/${j.id}" style="color:#2563eb;font-weight:600;text-decoration:none;">${j.title}</a>
        <br><span style="color:#6b7280;font-size:13px;">${j.company} · ${j.emirate.replace(/_/g, ' ')}</span>
      </td>
    </tr>
  `).join('');

  return {
    subject: `${alerts.length} new jobs match your alert`,
    html: layout(`
      <h2 style="color:#111;font-size:20px;">New Job Matches</h2>
      <p style="color:#4b5563;">We found ${alerts.length} new jobs matching your alert criteria:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${jobRows}</table>
      <div style="text-align:center;margin:24px 0;">
        <a href="${BASE_URL}/jobs" style="background:#2563eb;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;">Browse All Jobs</a>
      </div>
    `),
  };
}
